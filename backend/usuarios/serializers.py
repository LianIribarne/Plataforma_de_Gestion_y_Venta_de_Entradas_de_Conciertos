from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Usuario
from django.utils import timezone

class RegistroClienteSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(
        validators=[UniqueValidator(
            queryset=Usuario.objects.all(),
            message="Este email ya está registrado"
        )]
    )

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres")
        return value

    def validate_fecha_nacimiento(self, value):
        hoy = timezone.localdate()
        edad = hoy.year - value.year
        if (hoy.month, hoy.day) < (value.month, value.day):
            edad -= 1
        if edad < 18:
            raise serializers.ValidationError("El usuario debe ser mayor de 18 años")
        return value

    class Meta:
        model = Usuario
        fields = [
            'email',
            'password',
            'first_name',
            'last_name',
            'fecha_nacimiento',
            'genero'
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        usuario = Usuario(
            **validated_data,
            rol_id=3,
        )
        usuario.set_password(password)
        usuario.save()
        return usuario

class RegistroUsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(
        validators=[UniqueValidator(
            queryset=Usuario.objects.all(),
            message="Este email ya está registrado"
        )]
    )
    rol = serializers.IntegerField()

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres")
        return value

    def validate_fecha_nacimiento(self, value):
        hoy = timezone.localdate()
        edad = hoy.year - value.year
        if (hoy.month, hoy.day) < (value.month, value.day):
            edad -= 1
        if edad < 18:
            raise serializers.ValidationError("El usuario debe ser mayor de 18 años")
        return value

    class Meta:
        model = Usuario
        fields = [
            'email',
            'password',
            'first_name',
            'last_name',
            'fecha_nacimiento',
            'genero',
            'rol'
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        rol = validated_data.pop("rol")
        usuario = Usuario(
            **validated_data,
            rol_id=rol
        )
        usuario.set_password(password)
        usuario.save()
        return usuario

class ActualizarUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            "first_name", "last_name", "email",
            "fecha_nacimiento", "genero",
        ]
        extra_kwargs = {
            "email": {
                "validators": []
            }
        }

    def validate_email(self, value):
        user = self.context["request"].user
        if Usuario.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("Ese email ya está en uso.")
        return value

    def validate_fecha_nacimiento(self, value):
        hoy = timezone.localdate()
        edad = hoy.year - value.year
        if (hoy.month, hoy.day) < (value.month, value.day):
            edad -= 1
        if edad < 18:
            raise serializers.ValidationError("El usuario debe ser mayor de 18 años")
        return value

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("La nueva contraseña debe tener al menos 8 caracteres.")
        return value

    def validate(self, data):
        user = self.context['request'].user

        if not user.check_password(data['current_password']):
            raise serializers.ValidationError({
                "current_password": "La contraseña actual es incorrecta."
            })

        if data['current_password'] == data['new_password']:
            raise serializers.ValidationError({
                "new_password": "La nueva contraseña no puede ser igual a la actual."
            })

        return data

class AdminUsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Usuario
        fields = [
            "email", "password", "first_name", "last_name",
            "fecha_nacimiento", "genero", "rol", "is_active",
        ]
        extra_kwargs = {
            "email": {
                "validators": []
            }
        }

    def validate(self, attrs):
        user = self.context["request"].user

        # No permitir modificar otro administrador
        if self.instance and self.instance.es_administrador and self.instance != user:
            raise serializers.ValidationError("No puedes modificar a otro administrador")

        # Evitar modificarse a sí mismo desde este endpoint
        if self.instance == user:
            raise serializers.ValidationError("No puedes modificar tu propio usuario desde este endpoint")

        return attrs

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres")
        if self.instance and self.instance.check_password(value):
            raise serializers.ValidationError("La nueva contraseña no puede ser igual a la actual")
        return value

    def validate_email(self, value):
        if Usuario.objects.exclude(id=self.instance.id).filter(email=value).exists():
            raise serializers.ValidationError("Este email ya está registrado")
        return value

    def validate_fecha_nacimiento(self, value):
        hoy = timezone.localdate()
        edad = hoy.year - value.year
        if (hoy.month, hoy.day) < (value.month, value.day):
            edad -= 1
        if edad < 18:
            raise serializers.ValidationError("El usuario debe ser mayor de 18 años")
        return value

class AdminUsuarioListSerializer(serializers.ModelSerializer):
    rol = serializers.CharField(source="rol.get_nombre_display")

    class Meta:
        model = Usuario
        fields = [
            "id", "email", "rol", "first_name",
            "last_name", "is_active"
        ]

class AdminUsuarioDetailSerializer(serializers.ModelSerializer):
    fecha_nacimiento = serializers.DateField(format="%d/%m/%Y")
    date_joined = serializers.DateTimeField(format="%d/%m/%Y %H:%M")
    last_login = serializers.SerializerMethodField()
    rol = serializers.SerializerMethodField()
    is_active = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            "id", "email", "rol", "first_name",
            "last_name", "fecha_nacimiento", "is_active",
            "last_login", "date_joined"
        ]

    def get_rol(self, obj):
        return {
            "id": obj.rol.id,
            "nombre": obj.rol.get_nombre_display()
        }

    def get_is_active(self, obj):
        return "Activo" if obj.is_active else "Suspendido"

    def get_last_login(self, obj):
        if obj.last_login is None:
            return "Sin información"
        return obj.last_login.strftime("%d/%m/%Y %H:%M")

class OrganizadorStatsSerializer(serializers.ModelSerializer):
    conciertos_creados = serializers.SerializerMethodField()
    conciertos_borradores = serializers.SerializerMethodField()
    conciertos_programados = serializers.SerializerMethodField()
    conciertos_agotados = serializers.SerializerMethodField()
    conciertos_finalizados = serializers.SerializerMethodField()
    conciertos_cancelados = serializers.SerializerMethodField()
    tipos_entrada_creados = serializers.SerializerMethodField()
    entradas_totales = serializers.SerializerMethodField()
    entradas_vendidas = serializers.SerializerMethodField()
    ocupacion_promedio = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            "conciertos_creados", "conciertos_borradores", "conciertos_programados", "conciertos_finalizados",
            "conciertos_cancelados", "tipos_entrada_creados", "entradas_totales", "entradas_vendidas",
            "ocupacion_promedio", "conciertos_agotados"
        ]

    def _valor_o_sin_info(self, value):
        return "Sin información" if value in [0, None] else value

    def get_conciertos_creados(self, obj):
        return self._valor_o_sin_info(obj.conciertos_creados)

    def get_conciertos_borradores(self, obj):
        return self._valor_o_sin_info(obj.conciertos_borradores)

    def get_conciertos_programados(self, obj):
        return self._valor_o_sin_info(obj.conciertos_programados)

    def get_conciertos_agotados(self, obj):
        return self._valor_o_sin_info(obj.conciertos_agotados)

    def get_conciertos_finalizados(self, obj):
        return self._valor_o_sin_info(obj.conciertos_finalizados)

    def get_conciertos_cancelados(self, obj):
        return self._valor_o_sin_info(obj.conciertos_cancelados)

    def get_tipos_entrada_creados(self, obj):
        return self._valor_o_sin_info(obj.tipos_entrada_creados)

    def get_entradas_totales(self, obj):
        return self._valor_o_sin_info(obj.entradas_totales)

    def get_entradas_vendidas(self, obj):
        return self._valor_o_sin_info(obj.entradas_vendidas)

    def get_ocupacion_promedio(self, obj):
        if obj.entradas_totales in [0, None] or obj.ocupacion_promedio is None:
            return "Sin información"

        porcentaje = round(obj.ocupacion_promedio, 2)

        return f"{porcentaje:.2f}".replace(".", ",") + "%"
