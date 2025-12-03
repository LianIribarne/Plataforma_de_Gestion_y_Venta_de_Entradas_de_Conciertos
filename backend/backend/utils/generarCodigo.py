import uuid

def generar_codigo():
    return uuid.uuid4().hex[:10].upper()
