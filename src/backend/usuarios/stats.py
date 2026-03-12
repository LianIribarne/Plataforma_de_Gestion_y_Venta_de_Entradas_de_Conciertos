from django.db.models import Count, ExpressionWrapper, F, FloatField, Q
from django.db.models.functions import NullIf

from .models import Usuario


def organizador_stats_queryset():
    return (
        Usuario.objects
        .filter(rol=2)
        .annotate(
            conciertos_creados=Count(
                "organizadores",
                distinct=True
            ),
            conciertos_borradores=Count(
                "organizadores",
                filter=Q(organizadores__estado__codigo="borrador"),
                distinct=True
            ),
            conciertos_programados=Count(
                "organizadores",
                filter=Q(organizadores__estado__codigo="programado"),
                distinct=True
            ),
            conciertos_agotados=Count(
                "organizadores",
                filter=Q(organizadores__estado__codigo="agotado"),
                distinct=True
            ),
            conciertos_en_curso=Count(
                "organizadores",
                filter=Q(organizadores__estado__codigo="en_curso"),
                distinct=True
            ),
            conciertos_finalizados=Count(
                "organizadores",
                filter=Q(organizadores__estado__codigo="finalizado"),
                distinct=True
            ),
            conciertos_cancelados=Count(
                "organizadores",
                filter=Q(organizadores__estado__codigo="cancelado"),
                distinct=True
            ),
            tipos_entrada_creados=Count(
                "organizadores__tipos_entrada",
                distinct=True
            ),
            entradas_totales=Count(
                "organizadores__tipos_entrada__entradas",
                distinct=True
            ),
            entradas_vendidas=Count(
                "organizadores__tipos_entrada__entradas",
                filter=Q(
                    organizadores__tipos_entrada__entradas__estado="vendida"
                ),
                distinct=True
            ),
        )
        .annotate(
            ocupacion_promedio=ExpressionWrapper(
                F("entradas_vendidas") * 100.0 /
                NullIf(F("entradas_totales"), 0),
                output_field=FloatField()
            )
        )
    )
