from django.contrib.auth.models import AbstractUser
from django.db import models

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
        email
    ya estan definidos por defecto
    """

    GENEROS = [
        ('Hombre', 'Hombre'),
        ('Mujer', 'Mujer'),
        ('Otro', 'Otro'),
    ]
    genero = models.CharField(max_length=20, choices=GENEROS)
    fecha_nacimiento = models.DateField()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    username = None
    is_staff = None
    is_superuser = None

    # Foreing Key
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.first_name} {self.last_name} ({self.email})'

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
    estado = models.CharField(max_length=20, choices=ESTADOS)
    cant_entradas = models.IntegerField()
    fecha_hora = models.DateTimeField()
    lugar = models.CharField(max_length=255)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    imagen = models.ImageField(upload_to='eventos/')

    # Foreing Key
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    organizador = models.ForeignKey(Usuario, on_delete=models.CASCADE)

    def __str__(self):
        return self.titulo

class Pago(models.Model):
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_hora = models.DateTimeField()

    def __str__(self):
        return f'Monto: {self.monto} - Fecha y hora: {self.fecha_hora}'

class Entrada(models.Model):
    ESTADOS = [
        ('Disponible', 'Disponible'),
        ('Reservada', 'Reservada'),
        ('Vendida', 'Vendida'),
        ('Cancelada', 'Cancelada'),
    ]
    estado = models.CharField(choices=ESTADOS)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    tipo = models.CharField(max_length=20, choices=[('Normal', 'Normal'), ('VIP', 'VIP')])

    # Foreing Key
    evento = models.ForeignKey(Evento, on_delete=models.CASCADE)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, null=True, blank=True)
    pago = models.ForeignKey(Pago, on_delete=models.PROTECT, null=True, blank=True)

    def __str__(self):
        return f'Evento: {self.evento} - Usuario: {self.usuario} - Pago: {self.pago}'
