from django.urls import path
from .views import (
    CreateReservaView, CancelarReservaView, AdminCancelarReservaView,
    ReservaActivaView
)

urlpatterns = [
    # crear reserva
    path('reservar/', CreateReservaView.as_view(), name='crear_reserva'),

    # cancelar reserva
    path('cancelar_reserva/', CancelarReservaView.as_view(), name='cancelar_reserva'),
    path('admin/cancelar_reserva/<int:id>', AdminCancelarReservaView.as_view(), name='admin_cancelar_reserva'), # administrador
    
    path('reserva_activa/', ReservaActivaView.as_view(), name='get-reservar_hasta-cliente'),
]
