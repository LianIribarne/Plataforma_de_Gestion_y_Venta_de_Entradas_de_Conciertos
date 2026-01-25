from django.urls import path
from .views import (
    PagarReservaView, PagoListView,
)

urlpatterns = [
    # pagar reserva
    path('pagar_reserva/', PagarReservaView.as_view(), name='pagar_reserva'),

    # listar
    path('pagos/', PagoListView.as_view(), name='listar_pagos'),
]
