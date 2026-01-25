import secrets
from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.core.validators import MaxValueValidator, MinValueValidator
from backend.utils.generarCodigo import generar_codigo_unico_entrada

def generar_qr_token_unico():
    while True:
        token = secrets.token_urlsafe(32)
        if not Entrada.objects.filter(qr_token=token).exists():
            return token

class Reserva(models.Model):
    reservar_hasta = models.DateTimeField(editable=False)
    activo = models.BooleanField(default=True)
    vencio = models.BooleanField(default=False)
    cancelada = models.BooleanField(default=False)
    pagada = models.BooleanField(default=False)
    task_id = models.CharField(max_length=255, null=True, blank=True)

    # Foreing Key
    cliente = models.ForeignKey(
        "usuarios.Usuario",
        on_delete=models.CASCADE,
        related_name='reservas'
    )
    concierto = models.ForeignKey(
        "conciertos.Concierto",
        on_delete=models.CASCADE,
        related_name='reservas'
    )

    def save(self, *args, **kwargs):
        if not self.pk:
            self.reservar_hasta = timezone.now() + timedelta(minutes=15)
        super().save(*args, **kwargs)

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
    qr_token = models.CharField(
        max_length=64,
        unique=True,
        default=generar_qr_token_unico,
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
        related_name='entradas'
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
