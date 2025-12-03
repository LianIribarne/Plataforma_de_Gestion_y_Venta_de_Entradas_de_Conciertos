from django.db import models
from backend.utils.generarCodigo import generar_codigo

class Reserva(models.Model):
    reservar_hasta = models.DateTimeField()

    # Foreing Key
    cliente = models.OneToOneField(
        "usuarios.Usuario",
        on_delete=models.CASCADE,
        related_name='reservas'
    )

    def __str__(self):
        return f'Cliente: {self.cliente.email}'

class Entrada(models.Model):
    ESTADOS = [
        ('Disponible', 'Disponible'),
        ('Reservada', 'Reservada'),
        ('Vendida', 'Vendida'),
        ('Cancelada', 'Cancelada'),
    ]
    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default='Disponible'
    )
    codigo = models.CharField(
        max_length=12,
        unique=True,
        default=generar_codigo,
        editable=False
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
        related_name='tipos'
    )
    reserva = models.ForeignKey(
        Reserva,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reservas'
    )

    def __str__(self):
        return f'Usuario: {self.usuario} - Pago: {self.pago}'
