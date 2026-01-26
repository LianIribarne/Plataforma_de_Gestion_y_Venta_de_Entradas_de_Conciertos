from django.db.models import Count, DecimalField, ExpressionWrapper, F
from django.utils import timezone
from entradas.models import Entrada
from rest_framework import serializers

from backend.utils.formatoPrecio import formato_ars

from .models import Pago


class PagoListSerializer(serializers.ModelSerializer):
    monto = serializers.SerializerMethodField()
    concierto = serializers.SerializerMethodField()
    fecha = serializers.SerializerMethodField()
    hora = serializers.SerializerMethodField()
    items = serializers.SerializerMethodField()

    class Meta:
        model = Pago
        fields = [
            'id', 'codigo', 'cant_entradas', 'monto',
            'concierto', 'fecha', 'hora', 'items'
        ]

    def get_monto(self, pago):
        return formato_ars(pago.monto)

    def get_concierto(self, pago):
        entrada = (
            Entrada.objects
            .select_related("tipo__evento")
            .filter(pago=pago)
            .first()
        )
        return entrada.tipo.evento.titulo if entrada else None

    def get_fecha(self, pago):
        local_dt = timezone.localtime(pago.fecha_hora)
        return local_dt.strftime("%d/%m/%Y")

    def get_hora(self, pago):
        local_dt = timezone.localtime(pago.fecha_hora)
        return local_dt.strftime("%H:%M")

    def get_items(self, pago):
        qs = (
            Entrada.objects
            .filter(pago=pago)
            .values(
                "tipo_id",
                "tipo__nombre",
                "tipo__precio",
            )
            .annotate(
                cantidad=Count("id"),
                subtotal=ExpressionWrapper(
                    Count("id") * F("tipo__precio"),
                    output_field=DecimalField(max_digits=10, decimal_places=2)
                )
            )
        )

        return [
            {
                "tipo_id": i["tipo_id"],
                "nombre": i["tipo__nombre"],
                "precio": formato_ars(i["tipo__precio"]),
                "cantidad": i["cantidad"],
                "subtotal": formato_ars(i["subtotal"]),
            }
            for i in qs
        ]
