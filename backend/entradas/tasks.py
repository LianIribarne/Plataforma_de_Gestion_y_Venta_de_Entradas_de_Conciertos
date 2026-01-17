from celery import shared_task
from django.utils import timezone
from .models import Entrada
from django.db import transaction

@shared_task
def expirar_reservas():
    ahora = timezone.now()

    with transaction.atomic():
        entradas = (
            Entrada.objects
            .select_related("tipo", "reserva")
            .filter(
                estado="reservada",
                reserva__reservar_hasta__lt=ahora
            )
        )

        for entrada in entradas:
            tipo = entrada.tipo
            reserva = entrada.reserva

            # liberar entrada
            entrada.reserva = None
            entrada.precio = tipo.precio

            # estado final
            if not tipo.activo:
                entrada.estado = "cancelada"
            else:
                entrada.estado = "disponible"

            entrada.save()

            # cerrar reserva
            if reserva:
                reserva.activo = False
                reserva.save()
