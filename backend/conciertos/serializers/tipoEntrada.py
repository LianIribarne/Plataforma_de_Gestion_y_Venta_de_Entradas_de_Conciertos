import secrets

from conciertos.models import TipoEntrada
from conciertos.services import (actualizar_estado_por_stock,
                                 sincronizar_limite_concierto)
from django.db import transaction
from entradas.models import Entrada
from rest_framework import serializers


# crear concierto
class TipoEntradaCreateSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=100)
    precio = serializers.DecimalField(max_digits=10, decimal_places=2)
    cantidad_total = serializers.IntegerField(min_value=1)
    limite_reserva = serializers.IntegerField(min_value=1)

# ver detalle del concierto
class TipoEntradaConciertoSerializer(serializers.ModelSerializer):
    disponibles = serializers.SerializerMethodField()
    reservadas = serializers.SerializerMethodField()
    precio_legible = serializers.SerializerMethodField()

    class Meta:
        model = TipoEntrada
        fields = [
            "id", "nombre", "precio", "precio_legible",
            "cantidad_total", "limite_reserva", "disponibles",
            "reservadas", "activo"
        ]

    def get_disponibles(self, obj):
        return obj.entradas.filter(estado="disponible").count()

    def get_reservadas(self, obj):
        return obj.entradas.filter(estado="reservada").count()

    def get_precio_legible(self, obj):
        return f"${obj.precio:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

class CreateTipoEntradaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoEntrada
        fields = ['nombre', 'precio', 'cantidad_total', 'limite_reserva', 'evento']

    def validate(self, attrs):
        request = self.context["request"]
        usuario = request.user
        concierto = attrs["evento"]

        if concierto.organizador != usuario:
            raise serializers.ValidationError(
                {"evento": "No sos el organizador de este concierto."}
            )

        if concierto.estado.codigo in ['en_curso', 'cancelado', 'finalizado']:
            raise serializers.ValidationError(
                {"evento": "No se puede agregar otro tipo de entrada al concierto."}
            )

        tipos_activos = TipoEntrada.objects.filter(
            evento=concierto,
            activo=True
        ).count()

        if tipos_activos >= 4:
            raise serializers.ValidationError(
                "Este concierto ya tiene el máximo de 4 tipos de entrada activos."
            )

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        tipo = TipoEntrada.objects.create(**validated_data)
        sincronizar_limite_concierto(tipo.evento)

        tokens = set()
        entradas = []

        for _ in range(tipo.cantidad_total):
            while True:
                token = secrets.token_urlsafe(32)
                if token not in tokens:
                    tokens.add(token)
                    break

            entradas.append(
                Entrada(
                    tipo=tipo,
                    precio=tipo.precio,
                    qr_token=token
                )
            )

        Entrada.objects.bulk_create(entradas)

        actualizar_estado_por_stock(tipo.evento)

        return tipo

class TipoEntradaMiniSerializer(serializers.ModelSerializer):
    disponibles = serializers.SerializerMethodField()
    vendidas = serializers.SerializerMethodField()
    reservadas = serializers.SerializerMethodField()
    canceladas = serializers.SerializerMethodField()

    class Meta:
        model = TipoEntrada
        fields = [
            'id', 'nombre', 'precio', 'limite_reserva', 'activo',
            'disponibles', 'vendidas', 'reservadas', 'canceladas'
        ]

    def get_disponibles(self, obj):
        return obj.entradas.filter(estado="disponible").count()

    def get_vendidas(self, obj):
        return obj.entradas.filter(estado="vendida").count()

    def get_reservadas(self, obj):
        return obj.entradas.filter(estado="reservada").count()

    def get_canceladas(self, obj):
        return obj.entradas.filter(estado="cancelada").count()

class TipoEntradaCancelarSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoEntrada
        fields = []

class TipoEntradaCancelarCantidadSerializer(serializers.ModelSerializer):
    cantidad = serializers.IntegerField(min_value=1)

    class Meta:
        model = TipoEntrada
        fields = ["cantidad"]

class TipoEntradaModificarSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoEntrada
        fields = ["precio", "nombre", "limite_reserva"]

class TipoEntradaAgregarSerializer(serializers.ModelSerializer):
    cantidad = serializers.IntegerField(
        min_value=1,
        required=False
    )

    class Meta:
        model = TipoEntrada
        fields = ["cantidad"]
