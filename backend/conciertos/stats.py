from django.db.models import Count, Q, F, Sum, FloatField, ExpressionWrapper
from django.db.models.functions import NullIf
from django.utils.timezone import now
from .models import Concierto, TipoEntrada

def concierto_finanzas_queryset():
    return (
        Concierto.objects
        .annotate(
            entradas_totales=Count(
                "tipos_entrada__entradas",
                distinct=True
            ),
            entradas_disponibles=Count(
                "tipos_entrada__entradas",
                filter=Q(tipos_entrada__entradas__estado="disponible"),
                distinct=True
            ),
            entradas_reservadas=Count(
                "tipos_entrada__entradas",
                filter=Q(
                    tipos_entrada__entradas__estado="reservada",
                    tipos_entrada__entradas__reserva__reservar_hasta__gt=now()
                ),
                distinct=True
            ),
            entradas_vendidas=Count(
                "tipos_entrada__entradas",
                filter=Q(tipos_entrada__entradas__estado="vendida"),
                distinct=True
            ),
            cantidad_ventas=Count(
                "tipos_entrada__entradas__pago",
                distinct=True
            ),
            ingreso_real=Sum(
                "tipos_entrada__entradas__tipo__precio",
                filter=Q(tipos_entrada__entradas__estado="vendida")
            ),
            ingreso_estimado=Sum(
                F("tipos_entrada__precio") * F("tipos_entrada__cantidad_total"),
                output_field=FloatField()
            ),
        )
        .annotate(
            ocupacion=ExpressionWrapper(
                F("entradas_vendidas") * 1.0 /
                NullIf(F("entradas_totales"), 0),
                output_field=FloatField()
            )
        )
    )

def tipos_entrada_stats_queryset(concierto_id):
    return (
        TipoEntrada.objects
        .filter(evento_id=concierto_id)
        .annotate(
            disponibles=Count(
                "entradas",
                filter=Q(entradas__estado="disponible")
            ),
            vendidas=Count(
                "entradas",
                filter=Q(entradas__estado="vendida")
            ),
            canceladas=Count(
                "entradas",
                filter=Q(entradas__estado="cancelada")
            ),
        )
    )

def reservas_stats_por_tipo(concierto_id):
    return (
        TipoEntrada.objects
        .filter(evento_id=concierto_id)
        .annotate(
            reservas_totales=Count(
                "entradas",
                filter=Q(entradas__reserva__isnull=False),
                distinct=True
            ),
            reservas_activas=Count(
                "entradas",
                filter=Q(
                    entradas__estado="reservada",
                    entradas__reserva__reservar_hasta__gt=now()
                ),
                distinct=True
            ),
            reservas_expiradas=Count(
                "entradas",
                filter=Q(
                    entradas__estado="reservada",
                    entradas__reserva__reservar_hasta__lte=now()
                ),
                distinct=True
            ),
            reservas_finalizadas=Count(
                "entradas",
                filter=Q(
                    entradas__estado="vendida",
                    entradas__reserva__isnull=False
                ),
                distinct=True
            ),
            ingreso_real=Sum(
                "entradas__tipo__precio",
                filter=Q(entradas__estado="vendida")
            ),
            ingreso_estimado=ExpressionWrapper(
                F("precio") * F("cantidad_total"),
                output_field=FloatField()
            )
        )
        .annotate(
            ratio_reserva_compra=ExpressionWrapper(
                F("reservas_finalizadas") * 1.0 /
                NullIf(F("reservas_totales"), 0),
                output_field=FloatField()
            ),
            reservas_activas_pct=ExpressionWrapper(
                F("reservas_activas") * 1.0 /
                NullIf(F("reservas_totales"), 0),
                output_field=FloatField()
            ),
            reservas_expiradas_pct=ExpressionWrapper(
                F("reservas_expiradas") * 1.0 /
                NullIf(F("reservas_totales"), 0),
                output_field=FloatField()
            ),
            reservas_finalizadas_pct=ExpressionWrapper(
                F("reservas_finalizadas") * 1.0 /
                NullIf(F("reservas_totales"), 0),
                output_field=FloatField()
            ),
        )
    )
