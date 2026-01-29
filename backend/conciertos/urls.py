from conciertos.views import (ArtistaCreateView, ArtistaListView,
                              ArtistaModificarView, CancelarConciertoView,
                              CategoriaListView, CiudadListView,
                              ConciertoCreateView, ConciertoDetailView,
                              ConciertoListView, ConciertoMetaListView,
                              ConciertoUpdateView, LugarCreateView,
                              LugarListView, LugarModificarView, PaisListView,
                              ProvinciaListView,
                              TipoEntradaAgregarEntradasView,
                              TipoEntradaCancelarCantidadView,
                              TipoEntradaCancelarView,
                              TipoEntradaConciertoView, TipoEntradaCreateView,
                              TipoEntradaModificarView,
                              TipoEntradaReservarView)
from django.urls import path

urlpatterns = [
    # provincia
    path('provincias/', ProvinciaListView.as_view(), name='listar_provincias'),

    # ciudad
    path('ciudades/', CiudadListView.as_view(), name='listar_ciudades'),

    # lugar
    path('registrar_lugar/', LugarCreateView.as_view(), name='crear_lugar'),
    path('lugares/', LugarListView.as_view(), name='listar_lugares'),
    path('modificar_lugar/<int:id>', LugarModificarView.as_view(), name='modificar_lugar'),

    # categoria
    path('categorias/', CategoriaListView.as_view(), name='listar_categorias'),

    # pais
    path('paises/', PaisListView.as_view(), name='listar_paises'),

    # artista
    path('crear_artista/', ArtistaCreateView.as_view(), name='crear_artista'),
    path('artistas/', ArtistaListView.as_view(), name='listar_artistas'),
    path('modificar_artista/<int:id>', ArtistaModificarView.as_view(), name='modificar_artista'),

    # conciertoMeta
    path('concierto-meta/', ConciertoMetaListView.as_view(), name='listar_concierto-meta'),

    # concierto
    path('crear_concierto/', ConciertoCreateView.as_view(), name='crear_concierto'),
    path('conciertos/', ConciertoListView.as_view(), name='listar_conciertos'),
    path('modificar_concierto/<int:id>', ConciertoUpdateView.as_view(), name='modificar_concierto'),
    path('detalles_concierto/<int:id>', ConciertoDetailView.as_view(), name='detalles_concierto'),
    path('cancelar_concierto/<int:id>', CancelarConciertoView.as_view(), name='cancelar_concierto'),

    # tiposEntrada
    path('agregar_tipo/', TipoEntradaCreateView.as_view(), name='agregar_tipo'),
    path('cancelar_tipo/<int:id>', TipoEntradaCancelarView.as_view(), name='cancelar_tipo'),
    path('cancelar_cantidad_tipo/<int:id>', TipoEntradaCancelarCantidadView.as_view(), name='cancelar_cantidad_tipo'),
    path('modificar_tipo/<int:id>', TipoEntradaModificarView.as_view(), name='modificar_tipo'),
    path('agregar_entradas_tipo/<int:id>', TipoEntradaAgregarEntradasView.as_view(), name='agregar_entradas_tipo'),
    path('tipos_concierto/<int:id>', TipoEntradaConciertoView.as_view(), name='tipos_concierto'),
    path('tipos_reservar/<int:id>', TipoEntradaReservarView.as_view(), name='tipos_reservar'),
]
