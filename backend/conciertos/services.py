from django.db import transaction
from django.db.models import Max
from django.core.exceptions import ValidationError
from entradas.models import Entrada

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

        nuevas = [
            Entrada(
                tipo=tipo,
                precio=tipo.precio,
                estado="disponible"
            )
            for _ in range(cantidad)
        ]

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
