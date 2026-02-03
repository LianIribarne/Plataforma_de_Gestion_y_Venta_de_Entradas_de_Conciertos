from conciertos.models import Concierto
from conciertos.tasks import finalizar_concierto, iniciar_concierto
from django.apps import apps
from django.core.management.base import BaseCommand
from django.db import connections
from django.db.utils import OperationalError, ProgrammingError
from entradas.models import Reserva
from entradas.tasks import expirar_reserva


def database_is_ready():
    try:
        connection = connections["default"]
        connection.ensure_connection()
    except OperationalError:
        return False
    return True


def tables_are_ready():
    try:
        concierto = apps.get_model("conciertos", "Concierto")
        concierto.objects.exists()
    except ProgrammingError:
        return False
    return True

class Command(BaseCommand):
    def handle(self, *args, **options):
        if not database_is_ready():
            self.stdout.write(self.style.WARNING(
                "⏳ Database not ready, skipping task scheduling"
            ))
            return

        if not tables_are_ready():
            self.stdout.write(self.style.WARNING(
                "⏳ Migrations not applied yet, skipping task scheduling"
            ))
            return

        for concierto in Concierto.objects.all():
            r = iniciar_concierto.apply_async(
                args=[concierto.id],
                eta=concierto.fecha_inicio,
                expires=concierto.fecha_fin
            )
            concierto.iniciar_task_id = r.id

            r = finalizar_concierto.apply_async(
                args=[concierto.id],
                eta=concierto.fecha_fin
            )
            concierto.finalizar_task_id = r.id

            concierto.save()

        for reserva in Reserva.objects.filter(activo=True):
            r = expirar_reserva.apply_async(
                args=[reserva.id],
                eta=reserva.reservar_hasta
            )
            reserva.task_id = r.id
            reserva.save()
