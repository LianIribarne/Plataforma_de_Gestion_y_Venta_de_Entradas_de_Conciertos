import secrets
from datetime import timedelta

from conciertos.models import Concierto, TipoEntrada
from django.core.management.base import BaseCommand
from django.utils import timezone
from entradas.models import Entrada


class Command(BaseCommand):
    def handle(self, *args, **options):
        ahora = timezone.localtime()
        hoy = ahora.date()

        concierto = Concierto.objects.create(
            titulo="AURORA – What Happened To The Earth? Tour | Buenos Aires",
            descripcion="AURORA llega a Buenos Aires con su gira internacional What Happened To The Earth? Tour. Un show íntimo y potente donde combina sus canciones más conocidas con material nuevo, en una puesta artística envolvente, visuales etéreas y una conexión única con el público.",
            fecha=hoy,
            puertas_hora=(ahora - timedelta(hours=1)).time(),
            show_hora=(ahora + timedelta(minutes=15)).time(),
            duracion=30,
            limite_reserva_total=6,
            estado_id=2,
            mood_id=10,
            lugar_id=2,
            organizador_id=2,
            artista_id=1,
            imagen="conciertos/aurora-en-argentina.webp"
        )

        tipos = [
            {"nombre": "General", "precio": 38000.00, "cantidad_total": 1600, "limite_reserva": 6},
            {"nombre": "Platea Alta", "precio": 52000.00, "cantidad_total": 900, "limite_reserva": 6},
            {"nombre": "Platea Preferencial", "precio": 68000.00, "cantidad_total": 600, "limite_reserva": 4},
            {"nombre": "Experiencia VIP", "precio": 120000.00, "cantidad_total": 200, "limite_reserva": 2}
        ]

        for tipo_data in tipos:
            tipo_entrada = TipoEntrada.objects.create(
                evento=concierto,
                nombre=tipo_data["nombre"],
                precio=tipo_data["precio"],
                cantidad_total=tipo_data["cantidad_total"],
                limite_reserva=tipo_data["limite_reserva"]
            )

            tokens = set()
            entradas = []

            for _ in range(tipo_data["cantidad_total"]):
                while True:
                    token = secrets.token_urlsafe(32)
                    if token not in tokens:
                        tokens.add(token)
                        break

                entradas.append(
                    Entrada(
                        tipo=tipo_entrada,
                        precio=tipo_data["precio"],
                        qr_token=token
                    )
                )

            Entrada.objects.bulk_create(entradas)
