import uuid
from django.apps import apps

def generar_codigo_unico(app_label, model_name, field='codigo', length=10):
    Model = apps.get_model(app_label, model_name)

    while True:
        codigo = uuid.uuid4().hex[:length].upper()
        if not Model.objects.filter(**{field: codigo}).exists():
            return codigo

def generar_codigo_unico_entrada():
    return generar_codigo_unico('entradas', 'Entrada')

def generar_codigo_unico_pago():
    return generar_codigo_unico('pagos', 'Pago')
