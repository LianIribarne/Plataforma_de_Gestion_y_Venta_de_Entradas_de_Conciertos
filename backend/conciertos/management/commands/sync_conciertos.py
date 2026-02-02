from conciertos.models import Concierto
from conciertos.tasks import finalizar_concierto, iniciar_concierto
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    def handle(self, *args, **options):

        for concierto in Concierto.objects.all():

            if not concierto.iniciar_task_id:
                r = iniciar_concierto.apply_async(
                    args=[concierto.id],
                    eta=concierto.fecha_inicio,
                    expires=concierto.fecha_fin
                )
                concierto.iniciar_task_id = r.id

            if not concierto.finalizar_task_id:
                r = finalizar_concierto.apply_async(
                    args=[concierto.id],
                    eta=concierto.fecha_fin
                )
                concierto.finalizar_task_id = r.id

            concierto.save()
