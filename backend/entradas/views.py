from rest_framework import generics, status
from rest_framework.response import Response
from celery.result import AsyncResult
from usuarios.permissions import EsCliente, EsAdministrador
from .models import Reserva
from .serializers import ReservaCreateSerializer, ReservaEstadoSerializer
from .services import liberar_reserva

class CreateReservaView(generics.CreateAPIView):
    queryset = Reserva.objects.all()
    serializer_class = ReservaCreateSerializer
    permission_classes = [EsCliente]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reserva = serializer.save()

        return Response(
            {
                "message": "Reserva realizada. Tenés 15 minutos para completar el pago.",
                "vence_en": reserva.reservar_hasta
            },
            status=status.HTTP_201_CREATED
        )

class CancelarReservaView(generics.GenericAPIView):
    permission_classes = [EsCliente]

    def post(self, request):
        reserva = Reserva.objects.filter(
            cliente=request.user,
            activo=True
        ).first()

        if not reserva:
            return Response(
                {"detail": "No tenés una reserva activa"},
                status=status.HTTP_404_NOT_FOUND
            )

        if reserva.task_id:
            AsyncResult(reserva.task_id).revoke(terminate=False)

        liberar_reserva(reserva, cancelada=True)

        return Response({"detail": "Reserva cancelada"}, status=status.HTTP_200_OK)

class AdminCancelarReservaView(generics.GenericAPIView):
    permission_classes = [EsAdministrador]
    queryset = Reserva.objects.all()

    def post(self, request, id):
        reserva = self.get_queryset().get(pk=id)

        if not reserva:
            return Response(
                {"detail": "El cliente no tiene una reserva activa"},
                status=status.HTTP_404_NOT_FOUND
            )

        if reserva.task_id:
            AsyncResult(reserva.task_id).revoke(terminate=False)

        liberar_reserva(reserva, cancelada=True)

        return Response({"detail": "Reserva cancelada"}, status=status.HTTP_200_OK)

class ReservaActivaView(generics.RetrieveAPIView):
    serializer_class = ReservaEstadoSerializer
    permission_classes = [EsCliente]

    def get_object(self):
        return Reserva.objects.filter(
            cliente=self.request.user,
            activo=True
        ).first()
