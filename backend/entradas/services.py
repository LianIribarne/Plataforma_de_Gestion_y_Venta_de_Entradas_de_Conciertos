from django.db import transaction
from .models import Reserva, Entrada

def liberar_reserva(reserva: Reserva, vencio=False, cancelada=False):
    if not reserva.activo:
        return

    with transaction.atomic():
        entradas = (
            Entrada.objects
            .select_related("tipo")
            .filter(
                estado="reservada",
                reserva=reserva
            )
        )

        for entrada in entradas:
            tipo = entrada.tipo
            entrada.reserva = None
            entrada.precio = tipo.precio

            entrada.estado = "disponible" if tipo.activo else "cancelada"

            entrada.save()

        reserva.activo = False
        reserva.vencio = vencio
        reserva.cancelada = cancelada
        reserva.save()
