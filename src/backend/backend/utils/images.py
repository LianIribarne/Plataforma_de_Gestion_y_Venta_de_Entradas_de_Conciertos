from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile

def image_to_webp(
    image,
    max_size=1024,
    quality=80,
):
    # Asegura que el stream esté al inicio
    try:
        image.seek(0)
    except Exception:
        pass

    with Image.open(image) as img:
        # Convertir a RGB (evita errores con PNG / transparencias)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        # Resize manteniendo proporción
        img.thumbnail((max_size, max_size), Image.LANCZOS)

        buffer = BytesIO()
        img.save(buffer, format="WEBP", quality=quality)

    buffer.seek(0)

    return ContentFile(
        buffer.getvalue(),
        name=image.name.rsplit(".", 1)[0] + ".webp"
    )
