from PIL import Image
from django.core.exceptions import ValidationError

def validar_tamano_imagen(value):
    max_size = 5 * 1024 * 1024  # 5 MB
    if value.size > max_size:
        raise ValidationError("El archivo es demasiado grande (máx 5MB).")

def validar_cuadrada(value):
    image = Image.open(value)
    if image.width != image.height:
        raise ValidationError("La imagen debe ser cuadrada.")
