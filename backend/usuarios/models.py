from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission, BaseUserManager
from django.utils import timezone
from django.core.exceptions import ValidationError
from backend.utils.validarImagen import validar_tamano_imagen, validar_cuadrada

ROLES = [
    ('admin', 'Administrador'),
    ('organizador', 'Organizador'),
    ('cliente', 'Cliente'),
]

class Rol(models.Model):
    nombre = models.CharField(
        max_length=20,
        choices=ROLES,
        unique=True
    )

    def __str__(self):
        return self.nombre

class UsuarioManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio')
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault(
            'is_staff',
            False
        )
        extra_fields.setdefault(
            'is_superuser',
            False
        )
        return self._create_user(
            email,
            password,
            **extra_fields
        )

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault(
            'is_staff',
            True
        )
        extra_fields.setdefault(
            'is_superuser',
            True
        )
        return self._create_user(
            email,
            password,
            **extra_fields
        )

class Usuario(AbstractUser):
    """
    Campos:
        password
        first_name
        last_name
    ya estan definidos por defecto
    """

    GENEROS = [
        ('hombre', 'Hombre'),
        ('mujer', 'Mujer'),
        ('otro', 'Otro'),
    ]
    genero = models.CharField(
        max_length=20,
        choices=GENEROS
    )
    fecha_nacimiento = models.DateField()
    email = models.EmailField(unique=True)
    imagen = models.ImageField(
        upload_to='usuarios/',
        validators=[
            validar_tamano_imagen,
            validar_cuadrada
        ],
        blank=True,
        null=True
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    username = None
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    # Necesarios definirlos pasa el uso de AbstractUser
    groups = models.ManyToManyField(
        Group,
        related_name="usuario_set",
        blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="usuario_set",
        blank=True
    )

    # Foreing Key
    rol = models.ForeignKey(
        Rol,
        on_delete=models.PROTECT,
        related_name='roles'
    )

    objects = UsuarioManager()

    @property
    def edad(self):
        if not self.fecha_nacimiento:
            return None
        hoy = timezone.localdate()
        edad = hoy.year - self.fecha_nacimiento.year
        if (hoy.month, hoy.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day):
            edad -= 1
        return edad

    # Verifica si el usuario es mayor de 18 años
    def clean(self):
        if self.fecha_nacimiento:
            if self.edad is not None and self.edad < 18:
                raise ValidationError('Debes ser mayor de 18 años.')
    
    def save(self, *args, **kwargs):
        self.full_clean() # Realiza las validaciones necesarias
        
        super().save(*args, **kwargs)
    
    # Verificaciones de si el usuario es de tal rol
    @property
    def es_administrador(self):
        return self.rol.nombre == 'admin'
    
    @property
    def es_organizador(self):
        return self.rol.nombre == 'organizador'
    
    @property
    def es_cliente(self):
        return self.rol.nombre == 'cliente'
    
    def __str__(self):
        return f'{self.first_name} {self.last_name} ({self.email} - {self.rol.nombre})'
