from rest_framework import serializers
from .models import Usuario, Evento, Pago, Entrada, Artista, TipoEntrada, Lugar

class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    rol = serializers.IntegerField(write_only=True)

    class Meta:
        model = Usuario
        fields = ('email', 'password', 'first_name', 'last_name', 'fecha_nacimiento', 'genero', 'rol')

    def create(self, validated_data):
        rol = validated_data.pop('rol')
        usuario = Usuario.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            fecha_nacimiento=validated_data.get('fecha_nacimiento'),
            genero=validated_data.get('genero'),
            rol_id=rol
        )
        return usuario

# USUARIO ------------------------------------------
class PagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pago
        fields = '__all__'

class EntradaSerializer(serializers.ModelSerializer):
    tipo = serializers.CharField(source='tipoentrada.nombre', read_only=True)

    class Meta:
        model = Entrada
        fields = ['id', 'codigo', 'estado', 'tipo']

class UsuarioSerializer(serializers.ModelSerializer):
    entradas = EntradaSerializer(source='entrada_set', many=True, read_only=True)
    pagos = PagoSerializer(source='pago_set', many=True, read_only=True)
    rol = serializers.SlugRelatedField(read_only=True, slug_field='nombre')

    class Meta:
        model = Usuario
        fields = '__all__'

# EVENTO --------------------------------------------
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
