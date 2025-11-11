from django.contrib.auth.models import AbstractUser, Group, Permission, BaseUserManager
from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
import uuid

def generar_codigo():
    return uuid.uuid4().hex[:10].upper()

class Rol(models.Model):
    ROLES = [
        ('Administrador', 'Administrador'),
        ('Organizador', 'Organizador'),
        ('Cliente', 'Cliente'),
    ]
    nombre = models.CharField(max_length=20, choices=ROLES, unique=True)

    def __str__(self):
        return self.nombre

class UsuarioManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self._create_user(email, password, **extra_fields)

class Usuario(AbstractUser):
    """
    Campos:
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
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    # Necesarios definirlos pasa el uso de AbstractUser
    groups = models.ManyToManyField(Group, related_name="usuario_set", blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name="usuario_set", blank=True)

    # Foreing Key
    rol = models.ForeignKey(Rol, on_delete=models.PROTECT)

    objects = UsuarioManager()

    # Calcula la edad a partir de fecha_nacimiento y devulve un entero
    def calcular_edad(self):
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
            edad = self.calcular_edad()
            if edad is not None and edad < 18:
                raise ValidationError('Debes ser mayor de 18 años.')
    
    def save(self, *args, **kwargs):
        self.edad = self.calcular_edad() # Completa el campo edad
        self.full_clean() # Realiza las validaciones necesarias
        
        super().save(*args, **kwargs)
    
    # Verificaciones de si el usuario es de tal rol
    @property
    def es_administrador(self):
        return self.rol.nombre == 'Administrador'
    
    @property
    def es_organizador(self):
        return self.rol.nombre == 'Organizador'
    
    @property
    def es_cliente(self):
        return self.rol.nombre == 'Cliente'
    
    def __str__(self):
        return f'{self.first_name} {self.last_name} ({self.email} - {self.rol.nombre})'

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

class Artista(models.Model):
    nombre = models.CharField(max_length=255)
    pais_origen = models.CharField(max_length=120)
    imagen = models.ImageField(upload_to='artistas/')

    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT)

    def __str__(self):
        return self.nombre

class Provincia(models.Model):
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre

class Ciudad(models.Model):
    nombre = models.CharField(max_length=120)

    provincia = models.ForeignKey(Provincia, on_delete=models.PROTECT)

    class Meta:
        unique_together = ('nombre', 'provincia')

    def __str__(self):
        return self.nombre

class Lugar(models.Model):
    nombre = models.CharField(max_length=255)
    direccion = models.CharField(max_length=255)

    ciudad = models.ForeignKey(Ciudad, on_delete=models.PROTECT)

    class Meta:
        unique_together = ('nombre', 'ciudad')

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
    fecha = models.DateField()
    show_hora = models.TimeField()
    puertas_hora = models.TimeField()
    limite_reserva_total = models.PositiveIntegerField()
    imagen = models.ImageField(upload_to='eventos/')

    # Foreing Key
    lugar = models.ForeignKey(Lugar, on_delete=models.PROTECT)
    organizador = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    artista = models.ForeignKey(Artista, on_delete=models.PROTECT)
    
    def clean(self):
        if self.fecha and self.fecha <= timezone.now():
            raise ValidationError('La fecha debe ser futuro.')

    def __str__(self):
        return self.titulo
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

class TipoEntrada(models.Model):
    nombre = models.CharField(max_length=100)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    cantidad_total = models.PositiveIntegerField()
    limite_reserva = models.PositiveIntegerField()

    evento = models.ForeignKey(Evento, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('nombre', 'evento')

    def __str__(self):
        return f"{self.nombre} - {self.evento}"

class Pago(models.Model):
    codigo = models.CharField(max_length=12, unique=True, default=generar_codigo, editable=False)
    cant_entradas = models.PositiveIntegerField()
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_hora = models.DateTimeField(auto_now_add=True)

    cliente = models.ForeignKey(Usuario, on_delete=models.PROTECT)

    def __str__(self):
        return f'Monto: {self.monto} - Fecha y hora: {self.fecha_hora}'

class Entrada(models.Model):
    ESTADOS = [
        ('Disponible', 'Disponible'),
        ('Reservada', 'Reservada'),
        ('Vendida', 'Vendida'),
        ('Cancelada', 'Cancelada'),
    ]
    estado = models.CharField(max_length=20, choices=ESTADOS, default='Disponible')
    codigo = models.CharField(max_length=12, unique=True, default=generar_codigo, editable=False)
    reserva_expira = models.DateTimeField(null=True, blank=True)

    # Foreing Key
    pago = models.ForeignKey(Pago, on_delete=models.PROTECT, null=True, blank=True)
    tipo = models.ForeignKey(TipoEntrada, on_delete=models.CASCADE)
    cliente = models.ForeignKey(Usuario, on_delete=models.PROTECT)

    def __str__(self):
        return f'Usuario: {self.usuario} - Pago: {self.pago}'
