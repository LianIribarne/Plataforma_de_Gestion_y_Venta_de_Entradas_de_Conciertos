from rest_framework import serializers
from .models import Evento, Artista, TipoEntrada, Lugar

class ArtistaEventoSerializer(serializers.ModelSerializer):
    categoria = serializers.SlugRelatedField(read_only=True, slug_field='nombre')

    class Meta:
        model = Artista
        fields = ['nombre', 'categoria', 'pais_origen']

class LugarEventoSerializer(serializers.ModelSerializer):
    ciudad = serializers.CharField(source='ciudad.nombre', read_only=True)
    provincia = serializers.CharField(source='ciudad.provincia.nombre', read_only=True)

    class Meta:
        model = Lugar
        fields = '__all__'

class TipoEntradaSerializer(serializers.ModelSerializer):
    disponibles = serializers.SerializerMethodField()
    reservadas = serializers.SerializerMethodField()

    class Meta:
        model = TipoEntrada
        fields = '__all__'
    
    def get_disponibles(self, obj):
        return obj.entrada_set.filter(estado='Disponible').count()

    def get_reservadas(self, obj):
        return obj.entrada_set.filter(estado='Reservada').count()

class EventoSerializer(serializers.ModelSerializer):
    artista = ArtistaEventoSerializer(read_only=True)
    lugar = LugarEventoSerializer(read_only=True)
    tipos_entrada = TipoEntradaSerializer(source='tipoentrada_set', many=True, read_only=True)

    class Meta:
        model = Evento
        fields = '__all__'
