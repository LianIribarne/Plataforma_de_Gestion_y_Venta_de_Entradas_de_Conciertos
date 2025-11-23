from django.db import models
import uuid

def generar_codigo():
    return uuid.uuid4().hex[:10].upper()

class Pago(models.Model):
    codigo = models.CharField(
        max_length=12,
        unique=True,
        default=generar_codigo,
        editable=False
    )
    cant_entradas = models.PositiveIntegerField()
    monto = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    fecha_hora = models.DateTimeField(auto_now_add=True)

    # Foreing Key
    cliente = models.ForeignKey(
        "usuarios.Usuario",
        on_delete=models.PROTECT,
        related_name='clientes'
    )

    def __str__(self):
        return f'Monto: {self.monto} - Fecha y hora: {self.fecha_hora} - Cliente: {self.cliente.email}'
