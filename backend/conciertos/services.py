import secrets

from celery.result import AsyncResult
from conciertos.models import Concierto, ConciertoMeta, TipoEntrada
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Count, Max, Q
from entradas.models import Entrada, Reserva
from entradas.services import liberar_reserva


def cancelar_tipo(tipo):
    with transaction.atomic():
        tipo.activo = False
        tipo.save()

        Entrada.objects.filter(
            tipo=tipo,
            estado="disponible"
        ).update(estado="cancelada")

def cancelar_cantidad(tipo, cantidad):
    with transaction.atomic():
        disponibles = Entrada.objects.filter(
            tipo=tipo,
            estado="disponible"
        ).order_by("id")

        if disponibles.count() < cantidad:
            raise ValueError("No hay suficientes entradas disponibles")

        ids = list(
            disponibles.values_list("id", flat=True)[:cantidad]
        )

        Entrada.objects.filter(id__in=ids).update(
            estado="cancelada"
        )

def modificar_precio(tipo, nuevo_precio):
    with transaction.atomic():
        tipo.precio = nuevo_precio
        tipo.save()

        Entrada.objects.filter(
            tipo=tipo,
            estado="disponible"
        ).update(precio=nuevo_precio)

def agregar_entradas(tipo, cantidad):
    with transaction.atomic():
        nueva_cantidad_total = tipo.cantidad_total + cantidad

        if nueva_cantidad_total > 10000:
            raise ValidationError("La cantidad total no puede superar 10000")

        tokens = set()
        nuevas = []

        for _ in range(cantidad):
            while True:
                token = secrets.token_urlsafe(32)
                if token not in tokens:
                    tokens.add(token)
                    break

            nuevas.append(
                Entrada(
                    tipo=tipo,
                    precio=tipo.precio,
                    qr_token=token
                )
            )

        Entrada.objects.bulk_create(nuevas)

        tipo.cantidad_total = nueva_cantidad_total
        tipo.save(update_fields=["cantidad_total"])

def sincronizar_limite_concierto(concierto):
    max_limite_tipo = (
        concierto.tipos_entrada.aggregate(
            max_limite=Max("limite_reserva")
        )["max_limite"] or 0
    )

    if concierto.limite_reserva_total < max_limite_tipo:
        concierto.limite_reserva_total = max_limite_tipo
        concierto.save(update_fields=["limite_reserva_total"])

@transaction.atomic
def cancelar_concierto(concierto_id: int):
    concierto = (
        Concierto.objects
        .select_for_update()
        .get(id=concierto_id)
    )

    if concierto.estado.codigo in ["cancelado", "finalizado"]:
        return concierto

    estado_cancelado = ConciertoMeta.objects.get(nombre="Cancelado")

    if hasattr(concierto, "estado"):
        concierto.estado = estado_cancelado
    concierto.save(update_fields=["estado"])

    TipoEntrada.objects.filter(evento=concierto, activo=True).update(activo=False)

    reservas_activas = (
        Reserva.objects
        .select_for_update()
        .filter(concierto=concierto, activo=True)
    )

    for reserva in reservas_activas:
        if getattr(reserva, "task_id", None):
            AsyncResult(reserva.task_id).revoke(terminate=False)

        liberar_reserva(reserva, cancelada=True)

    Entrada.objects.filter(
        tipo__evento=concierto,
        estado__in=["disponible", "reservada", "vendida"],
    ).update(estado="cancelada")

    return concierto

def actualizar_estado_por_stock(concierto):
    estado_actual = concierto.estado.codigo

    if estado_actual in ["borrador", "cancelado", "finalizado"]:
        return

    tipos_activos = concierto.tipos_entrada.filter(activo=True)

    if not tipos_activos.exists():
        return

    quedan = (
        tipos_activos
        .annotate(
            disponibles=Count(
                "entradas",
                filter=Q(entradas__estado="disponible")
            )
        )
        .filter(disponibles__gt=0)
        .exists()
    )

    if quedan:
        if estado_actual == "agotado":
            concierto.estado = ConciertoMeta.objects.get(
                tipo="estado",
                codigo="programado"
            )
            concierto.save(update_fields=["estado"])
    else:
        if estado_actual != "agotado":
            concierto.estado = ConciertoMeta.objects.get(
                tipo="estado",
                codigo="agotado"
            )
            concierto.save(update_fields=["estado"])
