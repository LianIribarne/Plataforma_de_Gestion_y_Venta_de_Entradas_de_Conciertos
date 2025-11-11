from rest_framework import serializers
from rest_framework import status
from rest_framework.response import Response
from rest_framework.validators import UniqueValidator
from .models import Usuario, Evento, Pago, Entrada, Artista, TipoEntrada, Lugar

class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=Usuario.objects.all(), message="Este email ya está registrado")]
    )

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres")
        return value

    rol = serializers.IntegerField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['email', 'password', 'first_name', 'last_name', 'fecha_nacimiento', 'genero', 'rol']

    def create(self, validated_data):
        password = validated_data.pop("password")
        rol = validated_data.pop("rol")
        usuario = Usuario(**validated_data, rol_id=rol)
        usuario.set_password(password)
        usuario.save()
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
