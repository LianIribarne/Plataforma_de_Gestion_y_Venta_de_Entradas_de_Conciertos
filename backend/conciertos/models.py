from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from PIL import Image

def validar_tamano_imagen(value):
    max_size = 5 * 1024 * 1024  # 5 MB
    if value.size > max_size:
        raise ValidationError("El archivo es demasiado grande (máx 5MB).")

def validar_cuadrada(value):
    image = Image.open(value)
    if image.width != image.height:
        raise ValidationError("La imagen debe ser cuadrada.")

class Categoria(models.Model):
    nombre = models.CharField(
        max_length=50,
        unique=True
    )

    def __str__(self):
        return self.nombre

class Artista(models.Model):
    nombre = models.CharField(max_length=255)
    pais_origen = models.CharField(max_length=120)
    imagen = models.ImageField(
        upload_to='artistas/',
        validators=[
            validar_tamano_imagen,
            validar_cuadrada
        ]
    )

    # Foreing Key
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.PROTECT,
        related_name='categorias'
    )

    def __str__(self):
        return self.nombre

class Provincia(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nombre

class Ciudad(models.Model):
    nombre = models.CharField(max_length=120)

    # Foreing Key
    provincia = models.ForeignKey(
        Provincia,
        on_delete=models.PROTECT,
        related_name='provincias'
    )

    class Meta:
        unique_together = ('nombre', 'provincia')

    def __str__(self):
        return self.nombre

class Lugar(models.Model):
    nombre = models.CharField(max_length=255)
    direccion = models.CharField(max_length=255)

    # Foreing Key
    ciudad = models.ForeignKey(
        Ciudad,
        on_delete=models.PROTECT,
        related_name='ciudades'
    )

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
    MOOD = [
        ("bailable", "Para bailar"),
        ("fiestero", "Fiestero"),
        ("chill", "Chill"),
        ("romantico", "Romántico"),
        ("intimo", "Íntimo"),
        ("energetico", "Enérgico"),
    ]
    titulo = models.CharField(max_length=255)
    descripcion = models.TextField()
    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default='Programado'
    )
    mood = models.CharField(
        max_length=50,
        choices=MOOD
    )
    fecha = models.DateField()
    show_hora = models.TimeField()
    puertas_hora = models.TimeField()
    limite_reserva_total = models.PositiveIntegerField()
    imagen = models.ImageField(
        upload_to='eventos/',
        validators=[
            validar_tamano_imagen,
            validar_cuadrada
        ]
    )

    # Foreing Key
    lugar = models.ForeignKey(
        Lugar,
        on_delete=models.PROTECT,
        related_name='lugares'
    )
    organizador = models.ForeignKey(
        "usuarios.Usuario",
        on_delete=models.CASCADE,
        related_name='organizadores'
    )
    artista = models.ForeignKey(
        Artista,
        on_delete=models.PROTECT,
        related_name='artistas'
    )
    
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
    precio = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    cantidad_total = models.PositiveIntegerField()
    limite_reserva = models.PositiveIntegerField()

    # Foreing Key
    evento = models.ForeignKey(
        Evento,
        on_delete=models.CASCADE,
        related_name='eventos'
    )

    class Meta:
        unique_together = ('nombre', 'evento')

    def __str__(self):
        return f"{self.nombre} - {self.evento}"
