from celery import shared_task
from celery.result import AsyncResult
from django.db import transaction
from entradas.models import Reserva
from entradas.services import liberar_reserva

from .models import Concierto, ConciertoMeta


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=60)
def iniciar_concierto(self, concierto_id):
    with transaction.atomic():
        concierto = Concierto.objects.select_related('estado').get(id=concierto_id)
        reservas_activas = (
            Reserva.objects
            .select_for_update()
            .filter(concierto=concierto, activo=True)
        )

        if concierto.estado.codigo in ['programado', 'agotado']:
            concierto.estado = ConciertoMeta.objects.get(codigo='en_curso')
            concierto.save(update_fields=['estado'])

            for reserva in reservas_activas:
                if getattr(reserva, "task_id", None):
                    AsyncResult(reserva.task_id).revoke(terminate=False)

                liberar_reserva(reserva, cancelada=True)

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=60)
def finalizar_concierto(self, concierto_id):
    concierto = Concierto.objects.select_related('estado').get(id=concierto_id)

    if concierto.estado.codigo == 'en_curso':
        concierto.estado = ConciertoMeta.objects.get(codigo='finalizado')
        concierto.save(update_fields=['estado'])
