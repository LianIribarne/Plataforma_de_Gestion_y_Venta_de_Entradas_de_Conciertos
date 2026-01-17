from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from backend.utils.generarCodigo import generar_codigo_unico_entrada

class Reserva(models.Model):
    reservar_hasta = models.DateTimeField()
    activo = models.BooleanField(default=True)

    # Foreing Key
    cliente = models.ForeignKey(
        "usuarios.Usuario",
        on_delete=models.CASCADE,
        related_name='reservas'
    )

    def __str__(self):
        return f'Cliente: {self.cliente.email}'

class Entrada(models.Model):
    ESTADOS = [
        ('disponible', 'Disponible'),
        ('reservada', 'Reservada'),
        ('vendida', 'Vendida'),
        ('cancelada', 'Cancelada'),
    ]
    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default='disponible'
    )
    codigo = models.CharField(
        max_length=10,
        unique=True,
        default=generar_codigo_unico_entrada,
        editable=False
    )
    precio = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[
            MinValueValidator(100.00),
            MaxValueValidator(1000000.00)
        ]
    )

    # Foreing Key
    pago = models.ForeignKey(
        "pagos.Pago",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='pagos'
    )
    tipo = models.ForeignKey(
        "conciertos.TipoEntrada",
        on_delete=models.CASCADE,
        related_name='entradas'
    )
    reserva = models.ForeignKey(
        Reserva,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reservas'
    )

    def __str__(self):
        return f'{self.codigo} - {self.get_estado_display()}'
