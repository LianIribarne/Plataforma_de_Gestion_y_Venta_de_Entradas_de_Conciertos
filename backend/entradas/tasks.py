from celery import shared_task
from django.utils import timezone

from .models import Reserva
from .services import liberar_reserva


@shared_task
def expirar_reserva(reserva_id):
    try:
        reserva = Reserva.objects.get(id=reserva_id)
    except Reserva.DoesNotExist:
        return

    if reserva.reservar_hasta > timezone.now():
        return

    liberar_reserva(reserva, vencio=True)
