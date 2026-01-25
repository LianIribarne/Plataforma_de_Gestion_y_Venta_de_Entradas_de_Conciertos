from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from celery.result import AsyncResult
from collections import defaultdict
import qrcode
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.db import transaction
from usuarios.permissions import EsCliente, EsAdministrador
from .models import Reserva, Entrada
from .serializers import ReservaCreateSerializer, ReservaActivaSerializer, ConciertoHeaderSerializer, EntradaItemSerializer
from .services import liberar_reserva, liberar_entrada

# reserva
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

class ReservaActivaView(generics.RetrieveAPIView):
    permission_classes = [EsCliente]

    def get(self, request):
        user = request.user

        reserva = Reserva.objects.filter(
            cliente=user,
            activo=True
        ).order_by("-id").first()

        if not reserva:
            return Response({
                "tiene_reserva": False,
                "reserva": None
            })

        serializer = ReservaActivaSerializer(reserva)

        return Response({
            "tiene_reserva": True,
            "reserva": serializer.data
        })

class QuitarEntradaReservaView(generics.GenericAPIView):
    permission_classes = [EsCliente]

    @transaction.atomic
    def post(self, request, **kwargs):
        tipo_id = self.kwargs.get("tipo_id")

        if not tipo_id:
            return Response(
                {"detail": "Tipo de entrada no especificado"},
                status=status.HTTP_400_BAD_REQUEST
            )

        reserva = Reserva.objects.filter(
            cliente=request.user,
            activo=True
        ).select_for_update().first()

        if not reserva:
            return Response(
                {"detail": "No tenés una reserva activa"},
                status=status.HTTP_404_NOT_FOUND
            )

        entrada = (
            Entrada.objects
            .select_for_update()
            .filter(
                reserva=reserva,
                tipo_id=tipo_id,
                estado="reservada"
            )
            .first()
        )

        if not entrada:
            return Response(
                {"detail": "No hay entradas de ese tipo en la reserva"},
                status=status.HTTP_400_BAD_REQUEST
            )

        liberar_entrada(entrada)

        quedan = Entrada.objects.filter(
            reserva=reserva,
            estado="reservada"
        ).exists()

        if not quedan:
            if reserva.task_id:
                AsyncResult(reserva.task_id).revoke(terminate=False)
            reserva.activo = False
            reserva.cancelada = True
            reserva.save()

            return Response(
                {"detail": "Entrada quitada correctamente, y reserva cancelada."},
                status=status.HTTP_200_OK
            )

        return Response(
            {"detail": "Entrada quitada correctamente."},
            status=status.HTTP_200_OK
        )

# entrada
def entrada_qr_view(request, token):
    entrada = get_object_or_404(
        Entrada,
        qr_token=token,
        estado="vendida"
    )

    img = qrcode.make(entrada.qr_token)

    response = HttpResponse(content_type="image/webp")
    img.save(
        response,
        format="WEBP",
        lossless=True,
        quality=90
    )
    return response

class EntradaListaView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.es_cliente:
            return Entrada.objects.filter(
                pago__cliente=user
            ).select_related("pago", "tipo").order_by("tipo__precio")

        if user.es_administrador:
            return Entrada.objects.filter(
                pago__isnull=False
            ).select_related("pago", "tipo").order_by("tipo__precio")

        return Entrada.objects.none()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        agrupado = defaultdict(list)

        for entrada in queryset:
            concierto = entrada.tipo.evento
            agrupado[concierto].append(entrada)

        response = []

        for concierto, entradas in agrupado.items():
            response.append({
                "concierto": ConciertoHeaderSerializer(concierto).data,
                "entradas": EntradaItemSerializer(
                    entradas,
                    many=True,
                    context={"request": request}
                ).data
            })

        return Response(response)
