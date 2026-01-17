from PIL import Image
from django.core.exceptions import ValidationError
from io import BytesIO

MAX_SIZE = 5 * 1024 * 1024  # 5 MB
FORMATOS_PERMITIDOS = ("JPEG", "PNG", "WEBP")


def _open_image(value):
    """
    Abre la imagen desde memoria de forma segura
    y resetea el puntero.
    """
    try:
        value.seek(0)
        image = Image.open(value)
        image.load()
        value.seek(0)
        return image
    except Exception:
        raise ValidationError("El archivo no es una imagen válida.")


def validar_tamano_imagen(value):
    # Usa el tamaño en memoria, no en disco
    if hasattr(value, "size") and value.size > MAX_SIZE:
        raise ValidationError("El archivo es demasiado grande (máx 5MB).")


def validar_cuadrada(value):
    image = _open_image(value)

    if image.width != image.height:
        raise ValidationError("La imagen debe ser cuadrada.")


def validar_formato_imagen(value):
    image = _open_image(value)

    if image.format not in FORMATOS_PERMITIDOS:
        raise ValidationError(
            "Formato no permitido. Usá JPG, PNG o WEBP."
        )
