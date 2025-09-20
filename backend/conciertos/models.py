from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError

# Create your models here.
class Rol(models.Model):
    ROLES = [
        ('Administrador', 'Administrador'),
        ('Organizador', 'Organizador'),
        ('Cliente', 'Cliente'),
    ]
    nombre = models.CharField(max_length=20, choices=ROLES, unique=True)

    def __str__(self):
        return self.nombre

class Usuario(AbstractUser):
    """
    Los campos:
        password
        first_name
        last_name
    ya estan definidos por defecto
    """

    GENEROS = [
        ('Hombre', 'Hombre'),
        ('Mujer', 'Mujer'),
        ('Otro', 'Otro'),
    ]
    genero = models.CharField(max_length=20, choices=GENEROS)
    fecha_nacimiento = models.DateField()
    edad = models.PositiveIntegerField(null=True, blank=True)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    username = None
    is_staff = None
    is_superuser = None

    groups = models.ManyToManyField(
        Group,
        related_name="usuario_set",
        blank=True,
        help_text="Los grupos a los que pertenece este usuario.",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="usuario_set",
        blank=True,
        help_text="Permisos específicos para este usuario.",
    )

    # Foreing Key
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE)

    def calcular_edad(self):
        if not self.fecha_nacimiento:
            return None
        hoy = timezone.localdate()
        edad = hoy.year - self.fecha_nacimiento.year
        if (hoy.month, hoy.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day):
            edad -= 1
        return edad

    def clean(self):
        if self.fecha_nacimiento:
            edad = self.calcular_edad()
            if edad is not None and edad < 18:
                raise ValidationError('Debes ser mayor de 18 años.')

    def __str__(self):
        return f'{self.first_name} {self.last_name} ({self.email})'
    
    def save(self, *args, **kwargs):
        self.full_clean()
        self.edad = self.calcular_edad()
        super().save(*args, **kwargs)

class Categoria(models.Model):
    CATEGORIAS = [
        ('Rock', 'Rock'),
        ('Pop', 'Pop'),
        ('Metal', 'Metal'),
        ('Indie', 'Indie'),
        ('Hip-Hop', 'Hip-Hop'),
        ('Electronica', 'Electronica'),
    ]
    nombre = models.CharField(max_length=20, choices=CATEGORIAS, unique=True)

    def __str__(self):
        return self.nombre

class Evento(models.Model):
    ESTADOS = [
        ('Programado', 'Programado'),
        ('En curso', 'En curso'),
        ('Finalizado', 'Finalizado'),
        ('Cancelado', 'Cancelado'),
    ]
    titulo = models.CharField(max_length=255)
    descripcion = models.TextField()
    estado = models.CharField(max_length=20, choices=ESTADOS, default='Programado')
    cant_entradas = models.PositiveIntegerField()
    fecha_hora = models.DateTimeField()
    lugar = models.CharField(max_length=255)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    imagen = models.ImageField(upload_to='eventos/')

    # Foreing Key
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    organizador = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    
    def clean(self):
        if self.fecha_hora and self.fecha_hora <= timezone.now():
            raise ValidationError('La fecha y hora deben ser futuras.')

    def __str__(self):
        return self.titulo
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

class Pago(models.Model):
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_hora = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Monto: {self.monto} - Fecha y hora: {self.fecha_hora}'

class Entrada(models.Model):
    ESTADOS = [
        ('Disponible', 'Disponible'),
        ('Reservada', 'Reservada'),
        ('Vendida', 'Vendida'),
        ('Cancelada', 'Cancelada'),
    ]
    estado = models.CharField(choices=ESTADOS, default='Disponible')
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    tipo = models.CharField(max_length=20, choices=[('Normal', 'Normal'), ('VIP', 'VIP')])

    # Foreing Key
    evento = models.ForeignKey(Evento, on_delete=models.CASCADE)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, null=True, blank=True)
    pago = models.ForeignKey(Pago, on_delete=models.PROTECT, null=True, blank=True)

    def __str__(self):
        return f'Evento: {self.evento} - Usuario: {self.usuario} - Pago: {self.pago}'
