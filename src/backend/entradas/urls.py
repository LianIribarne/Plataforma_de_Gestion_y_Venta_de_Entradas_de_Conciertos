from django.urls import path

from .views import (CancelarReservaView, EntradaListView,
                    QuitarEntradaReservaView, ReservaCreateView, ReservaView,
                    entrada_qr_view)

urlpatterns = [
    # crear reserva
    path('reservar/', ReservaCreateView.as_view(), name='crear_reserva'),

    # cancelar reserva
    path('cancelar_reserva/', CancelarReservaView.as_view(), name='cancelar_reserva'),

    # ver detalles de la reserva
    path('detalles_reserva/', ReservaView.as_view(), name='get-reservar_hasta-cliente'),

    # quitar una entrada de la reserva
    path('quitar_entrada/<int:tipo_id>', QuitarEntradaReservaView.as_view(), name='quitar_entrada'),

    # entradas
    path("entradas/qr/<str:token>/", entrada_qr_view),
    path('entradas/', EntradaListView.as_view(), name='listar_entradas'),
]
