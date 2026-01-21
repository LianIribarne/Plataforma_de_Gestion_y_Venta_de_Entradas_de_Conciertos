from django.db import models
from django.core.validators import MinValueValidator
from backend.utils.generarCodigo import generar_codigo_unico_pago

class Pago(models.Model):
    codigo = models.CharField(
        max_length=10,
        unique=True,
        default=generar_codigo_unico_pago,
        editable=False
    )
    cant_entradas = models.PositiveIntegerField(
        validators=[MinValueValidator(1)]
    )
    monto = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    fecha_hora = models.DateTimeField(auto_now_add=True)

    # Foreing Key
    cliente = models.ForeignKey(
        "usuarios.Usuario",
        on_delete=models.PROTECT,
        related_name='pagos'
    )

    def __str__(self):
        return f'Codigo: {self.codigo}'
