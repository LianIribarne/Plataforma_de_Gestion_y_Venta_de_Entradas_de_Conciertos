from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from backend.utils.validarImagen import (validar_cuadrada,
                                         validar_formato_imagen,
                                         validar_tamano_imagen)


class Categoria(models.Model):
    nombre = models.CharField(
        max_length=50,
        unique=True
    )

    def __str__(self):
        return self.nombre

class Pais(models.Model):
    nombre = models.CharField(
        max_length=50,
        unique=True
    )

    def __str__(self):
        return self.nombre

class Artista(models.Model):
    nombre = models.CharField(max_length=255)
    imagen = models.ImageField(
        upload_to='artistas/',
        validators=[
            validar_tamano_imagen,
            validar_formato_imagen,
            validar_cuadrada
        ]
    )
    activo = models.BooleanField(default=True)

    # Foreing Key
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.PROTECT,
        related_name='categorias'
    )
    pais_origen = models.ForeignKey(
        Pais,
        on_delete=models.PROTECT,
        related_name='paises'
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
    activo = models.BooleanField(default=True)

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

class ConciertoMeta(models.Model):
    TIPO_ESTADO = "estado"
    TIPO_MOOD = "mood"

    TIPO_CHOICES = (
        (TIPO_ESTADO, "Estado"),
        (TIPO_MOOD, "Mood"),
    )
    tipo = models.CharField(
        max_length=20,
        choices=TIPO_CHOICES
    )
    codigo = models.CharField(
        max_length=30,
        help_text="Valor interno, ej: borrador, chill"
    )
    nombre = models.CharField(
        max_length=50,
        help_text="Texto visible, ej: Borrador, Chill"
    )
    orden = models.PositiveIntegerField(default=0)
    activo = models.BooleanField(default=True)

    class Meta:
        unique_together = ("tipo", "codigo")
        ordering = ["orden", "nombre"]

    def __str__(self):
        return f"{self.get_tipo_display()} - {self.nombre}"

class Concierto(models.Model):
    titulo = models.CharField(max_length=255)
    descripcion = models.TextField()
    fecha = models.DateField()
    show_hora = models.TimeField()
    puertas_hora = models.TimeField()
    duracion = models.PositiveIntegerField(
        validators=[
            MinValueValidator(30),
            MaxValueValidator(300)
        ]
    )
    limite_reserva_total = models.PositiveIntegerField(
        validators=[
            MinValueValidator(2),
            MaxValueValidator(8)
        ]
    )
    imagen = models.ImageField(
        upload_to='conciertos/',
        validators=[
            validar_tamano_imagen,
            validar_formato_imagen,
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
    estado = models.ForeignKey(
        ConciertoMeta,
        on_delete=models.PROTECT,
        related_name="conciertos_por_estado",
        limit_choices_to={"tipo": "estado"}
    )
    mood = models.ForeignKey(
        ConciertoMeta,
        on_delete=models.PROTECT,
        related_name="conciertos_por_mood",
        limit_choices_to={"tipo": "mood"}
    )

    def __str__(self):
        return self.titulo

    def save(self, *args, **kwargs):
        if not self.estado_id:
            self.estado = ConciertoMeta.objects.get(
                tipo="estado",
                codigo="borrador"
            )
        self.full_clean()
        super().save(*args, **kwargs)

class TipoEntrada(models.Model):
    nombre = models.CharField(max_length=100)
    precio = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[
            MinValueValidator(100.00),
            MaxValueValidator(1000000.00)
        ]
    )
    cantidad_total = models.PositiveIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(10000)
        ]
    )
    limite_reserva = models.PositiveIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(6)
        ]
    )
    activo = models.BooleanField(default=True)

    evento = models.ForeignKey(
        Concierto,
        on_delete=models.CASCADE,
        related_name="tipos_entrada",
    )

    class Meta:
        unique_together = ("nombre", "evento")
        ordering = ['precio']
