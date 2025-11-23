from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Usuario

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

class UsuarioSerializer(serializers.ModelSerializer):
    entradas = EntradaSerializer(source='entrada_set', many=True, read_only=True)
    pagos = PagoSerializer(source='pago_set', many=True, read_only=True)
    rol = serializers.SlugRelatedField(read_only=True, slug_field='nombre')

    class Meta:
        model = Usuario
        fields = '__all__'
