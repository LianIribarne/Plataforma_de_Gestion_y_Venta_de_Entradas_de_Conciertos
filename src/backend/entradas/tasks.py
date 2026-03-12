from celery import shared_task
from celery.exceptions import Ignore
from conciertos.services import actualizar_estado_por_stock
from django.utils import timezone

from .models import Reserva
from .services import liberar_reserva


@shared_task(bind=True, max_retries=None)
def expirar_reserva(self, reserva_id):
    try:
        reserva = Reserva.objects.get(id=reserva_id)
    except Reserva.DoesNotExist:
        return

    if reserva.task_id != self.request.id:
        self.update_state(
            state="IGNORED",
            meta={"reason": "task obsoleta"}
        )
        raise Ignore()

    if reserva.reservar_hasta > timezone.now():
        delay = (reserva.reservar_hasta - timezone.now()).total_seconds()
        raise self.retry(
            countdown=max(1, int(delay)),
            exc=Exception("Todavía no venció")
        )

    liberar_reserva(reserva, vencio=True)
    actualizar_estado_por_stock(reserva.concierto)
