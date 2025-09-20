from rest_framework import serializers
from .models import Usuario, Evento, Pago, Entrada

class UsuarioSerializer(serializers.ModelSerializer):
    rol = serializers.SlugRelatedField(
        read_only=True,
        slug_field='nombre'
    )

    class Meta:
        model = Usuario
        fields = '__all__'

class EventoSerializer(serializers.ModelSerializer):
    categoria = serializers.SlugRelatedField(
        read_only=True,
        slug_field='nombre'
    )

    organizador = serializers.SlugRelatedField(
        read_only=True,
        slug_field='email'
    )
    
    class Meta:
        model = Evento
        fields = '__all__'

class PagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pago
        fields = '__all__'

class EntradaSerializer(serializers.ModelSerializer):
    evento = serializers.SlugRelatedField(
        read_only=True,
        slug_field='titulo'
    )

    usuario = serializers.SlugRelatedField(
        read_only=True,
        slug_field='email'
    )
    
    class Meta:
        model = Entrada
        fields = '__all__'
