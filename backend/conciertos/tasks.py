from celery import shared_task
from celery.exceptions import Ignore
from celery.result import AsyncResult
from django.db import transaction
from django.utils import timezone
from entradas.models import Reserva
from entradas.services import liberar_reserva

from .models import Concierto, ConciertoMeta


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=60)
def iniciar_concierto(self, concierto_id):
    now = timezone.now()

    with transaction.atomic():
        try:
            concierto = (
                Concierto.objects
                .select_related('estado')
                .select_for_update()
                .get(id=concierto_id)
            )
        except Concierto.DoesNotExist:
            return

        if concierto.iniciar_task_id != self.request.id:
            self.update_state(
                state="IGNORED",
                meta={"reason": "task obsoleta"}
            )
            raise Ignore()

        if now >= concierto.fecha_fin:
            return

        if concierto.estado.codigo not in ['programado', 'agotado']:
            return

        concierto.estado = ConciertoMeta.objects.get(codigo='en_curso')
        concierto.save(update_fields=['estado'])

        reservas_activas = (
            Reserva.objects
            .select_for_update()
            .filter(concierto=concierto, activo=True)
        )

        for reserva in reservas_activas:
            if getattr(reserva, "task_id", None):
                AsyncResult(reserva.task_id).revoke(terminate=False)

            liberar_reserva(reserva, cancelada=True)

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=60)
def finalizar_concierto(self, concierto_id):
    with transaction.atomic():
        try:
            concierto = (
                Concierto.objects
                .select_related('estado')
                .select_for_update()
                .get(id=concierto_id)
            )
        except Concierto.DoesNotExist:
            return

        if concierto.finalizar_task_id != self.request.id:
                self.update_state(
                    state="IGNORED",
                    meta={"reason": "task obsoleta"}
                )
                raise Ignore()

        if concierto.estado.codigo != 'en_curso':
            return

        concierto.estado = ConciertoMeta.objects.get(codigo='finalizado')
        concierto.save(update_fields=['estado'])

        reservas_activas = (
            Reserva.objects
            .select_for_update()
            .filter(concierto=concierto, activo=True)
        )

        for reserva in reservas_activas:
            if getattr(reserva, "task_id", None):
                AsyncResult(reserva.task_id).revoke(terminate=False)

            liberar_reserva(reserva, cancelada=True)
