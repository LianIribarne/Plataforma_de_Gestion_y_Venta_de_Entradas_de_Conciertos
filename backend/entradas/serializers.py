from rest_framework import serializers
from .models import Entrada

class EntradaSerializer(serializers.ModelSerializer):
    tipo = serializers.CharField(source='tipoentrada.nombre', read_only=True)

    class Meta:
        model = Entrada
        fields = ['id', 'codigo', 'estado', 'tipo']
