from rest_framework import serializers
from django.db import transaction
from django.db.models import Count, F, DecimalField, ExpressionWrapper, Sum, Value
from django.db.models.functions import Coalesce
from conciertos.models import TipoEntrada
from conciertos.services import actualizar_estado_por_stock
from .models import Entrada, Reserva
from .tasks import expirar_reserva
from backend.utils.formatoPrecio import formato_ars

# reserva
class ItemReservaSerializer(serializers.Serializer):
    tipo = serializers.PrimaryKeyRelatedField(
        queryset=TipoEntrada.objects.filter(activo=True)
    )
    cantidad = serializers.IntegerField(min_value=1)

class ReservaCreateSerializer(serializers.ModelSerializer):
    items = ItemReservaSerializer(
        many=True,
        allow_empty=False,
        write_only=True
    )

    class Meta:
        model = Reserva
        fields = ['items']

    def validate_items(self, value):
        if len(value) > 4:
            raise serializers.ValidationError("Máximo 4 tipos de entrada.")

        tipos = [item["tipo"] for item in value]
        if len(tipos) != len(set(tipos)):
            raise serializers.ValidationError("No se puede repetir el mismo tipo.")

        estado = value[0]["tipo"].evento.estado.nombre
        if estado != 'Programado':
            raise serializers.ValidationError("No se puede reservar en este concierto.")

        return value

    def validate(self, attrs):
        user = self.context["request"].user

        if Reserva.objects.filter(cliente=user, activo=True).exists():
            raise serializers.ValidationError(
                "Ya tenés una reserva activa."
            )

        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        items = validated_data["items"]

        with transaction.atomic():
            concierto = items[0]["tipo"].evento

            total_solicitado = sum(item["cantidad"] for item in items)
            if total_solicitado > concierto.limite_reserva_total:
                raise serializers.ValidationError(
                    f"No podés reservar más de {concierto.limite_reserva_total} entradas en total para este concierto."
                )

            if concierto.estado.codigo != 'programado':
                raise serializers.ValidationError(
                    "No podés reservar porque no esta disponible la reserva en este concierto."
                )

            reserva = Reserva.objects.create(
                cliente=request.user,
                concierto=concierto
            )

            for item in items:
                tipo = item["tipo"]
                cantidad = item["cantidad"]

                if tipo.limite_reserva < cantidad:
                    raise serializers.ValidationError(
                        f"Se supera el limite de reserva aceptado, {tipo.nombre}({tipo.limite_reserva})."
                    )

                if tipo.evento != concierto:
                    raise serializers.ValidationError(
                        "No se pueden reservar entradas de distintos conciertos en una misma reserva."
                    )

                disponibles = (
                    Entrada.objects
                    .select_for_update()
                    .filter(
                        tipo=tipo,
                        estado="disponible",
                        reserva__isnull=True
                    )[:cantidad]
                )

                if len(disponibles) < cantidad:
                    raise serializers.ValidationError(
                        f"No hay suficientes entradas para el tipo {tipo.nombre}"
                    )

                for entrada in disponibles:
                    entrada.estado = "reservada"
                    entrada.reserva = reserva
                    entrada.save()

            # agendar expiración
            result = expirar_reserva.apply_async(
                args=[reserva.id],
                eta=reserva.reservar_hasta
            )
            reserva.task_id = result.id
            reserva.save()

            actualizar_estado_por_stock(reserva.concierto)

        return reserva

class ReservaActivaSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    precio_total_reserva = serializers.SerializerMethodField()

    class Meta:
        model = Reserva
        fields = ['id', 'reservar_hasta', 'items', 'precio_total_reserva']

    def get_items(self, reserva):
        qs = (
            Entrada.objects
            .filter(reserva=reserva, estado="reservada")
            .values(
                "tipo_id",
                "tipo__nombre",
                "tipo__precio",
            )
            .annotate(
                cantidad=Count("id"),
                precio_total_tipo=ExpressionWrapper(
                    Count("id") * F("tipo__precio"),
                    output_field=DecimalField(max_digits=12, decimal_places=2)
                ),
            )
        )

        return [
            {
                "tipo_id": i["tipo_id"],
                "tipo_nombre": i["tipo__nombre"],
                "cantidad": i["cantidad"],
                "precio_unitario": formato_ars(i["tipo__precio"]),
                "precio_total_tipo": formato_ars(i["precio_total_tipo"]),
            }
            for i in qs
        ]

    def get_precio_total_reserva(self, reserva):
        total = (
            Entrada.objects
            .filter(reserva=reserva, estado="reservada")
            .aggregate(
                total=Coalesce(
                    Sum("precio"),
                    Value(0),
                    output_field=DecimalField(max_digits=12, decimal_places=2)
                )
            )["total"]
        )
        return formato_ars(total)

# entrada
class ConciertoHeaderSerializer(serializers.Serializer):
    titulo = serializers.CharField()
    fecha = serializers.SerializerMethodField()
    puertas_hora = serializers.SerializerMethodField()
    show_hora = serializers.SerializerMethodField()
    estado = serializers.CharField(source="estado.nombre")
    artista = serializers.CharField(source="artista.nombre")

    def get_fecha(self, obj):
        return obj.fecha.strftime("%d/%m/%Y")

    def get_puertas_hora(self, obj):
        return obj.puertas_hora.strftime("%H:%M")

    def get_show_hora(self, obj):
        return obj.show_hora.strftime("%H:%M")

class EntradaItemSerializer(serializers.ModelSerializer):
    tipo = serializers.CharField(source="tipo.nombre")
    precio = serializers.SerializerMethodField()
    qr_url = serializers.SerializerMethodField()

    class Meta:
        model = Entrada
        fields = [
            "codigo", "tipo", "precio", "qr_url"
        ]

    def get_precio(self, obj):
        return formato_ars(obj.precio)

    def get_qr_url(self, obj):
        request = self.context.get("request")
        if not request:
            return None
        return request.build_absolute_uri(
            f"qr/{obj.qr_token}/"
        )
