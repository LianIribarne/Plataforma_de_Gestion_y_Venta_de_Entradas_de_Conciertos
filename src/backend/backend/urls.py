from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),

    # USUARIOS
    path('api/usuarios/', include(('usuarios.urls', 'usuarios'))),

    # CONCIERTOS
    path('api/conciertos/', include(('conciertos.urls', 'conciertos'))),

    # ENTRADAS
    path('api/entradas/', include(('entradas.urls', 'entradas'))),

    # PAGOS
    path('api/pagos/', include(('pagos.urls', 'pagos'))),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
