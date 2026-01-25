from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from celery.result import AsyncResult
from django.db.models import Sum
from django.db import transaction
from .models import Pago
from .serializers import PagoListSerializer
from usuarios.permissions import EsCliente
from entradas.models import Entrada, Reserva
from backend.utils.formatoPrecio import formato_ars
from conciertos.services import actualizar_estado_por_stock

class PagarReservaView(generics.GenericAPIView):
    permission_classes = [EsCliente]

    @transaction.atomic
    def post(self, request):
        reserva = (
            Reserva.objects
            .select_for_update()
            .filter(cliente=request.user, activo=True)
            .first()
        )

        if not reserva:
            return Response(
                {"detail": "No tenés una reserva activa"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if reserva.vencio or reserva.cancelada:
            return Response(
                {"detail": "La reserva ya no es válida"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if reserva.concierto.estado.codigo in ['borrador', 'cancelada', 'finalizada']:
            return Response(
                {"detail": "La reserva ya no es válida"},
                status=status.HTTP_400_BAD_REQUEST
            )

        entradas = (
            Entrada.objects
            .select_for_update()
            .filter(reserva=reserva, estado="reservada")
        )

        if not entradas.exists():
            return Response(
                {"detail": "La reserva no tiene entradas válidas"},
                status=status.HTTP_400_BAD_REQUEST
            )

        cant_entradas = entradas.count()
        monto_total = entradas.aggregate(
            total=Sum("precio")
        )["total"]

        pago_ok = True

        if not pago_ok:
            return Response(
                {"detail": "Pago rechazado"},
                status=status.HTTP_402_PAYMENT_REQUIRED
            )

        pago = Pago.objects.create(
            cliente=request.user,
            cant_entradas=cant_entradas,
            monto=monto_total
        )

        entradas.update(estado="vendida", pago=pago)

        reserva.activo = False
        reserva.pagada = True
        reserva.save()

        actualizar_estado_por_stock(reserva.concierto)

        if reserva.task_id:
            AsyncResult(reserva.task_id).revoke(terminate=False)

        return Response(
            {
                "detail": "Pago confirmado",
                "codigo_pago": pago.codigo,
                "monto": formato_ars(pago.monto)
            },
            status=status.HTTP_200_OK
        )

class PagoListView(generics.ListAPIView):
    serializer_class = PagoListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        qs = Pago.objects.all()

        if user.es_cliente:
            qs = qs.filter(cliente=user)

        elif user.es_organizador:
            qs = qs.filter(
                entradas__tipo__evento__organizador=user
            )

            concierto_id = self.request.query_params.get("concierto")
            if concierto_id:
                qs = qs.filter(
                    entradas__tipo__evento_id=concierto_id
                )

        elif user.es_administrador:
            concierto_id = self.request.query_params.get("concierto")
            cliente_id = self.request.query_params.get("cliente")
            organizador_id = self.request.query_params.get("organizador")

            if concierto_id:
                qs = qs.filter(
                    entradas__tipo__evento_id=concierto_id
                )

            if cliente_id:
                qs = qs.filter(
                    cliente_id=cliente_id
                )

            if organizador_id:
                qs = qs.filter(
                    entradas__tipo__evento__organizador_id=organizador_id
                )

        params = self.request.query_params

        fecha_desde = params.get("fecha_desde")
        fecha_hasta = params.get("fecha_hasta")
        monto_min = params.get("monto_min")
        monto_max = params.get("monto_max")

        if fecha_desde:
            qs = qs.filter(fecha_hora__date__gte=fecha_desde)

        if fecha_hasta:
            qs = qs.filter(fecha_hora__date__lte=fecha_hasta)

        if monto_min:
            qs = qs.filter(monto__gte=monto_min)

        if monto_max:
            qs = qs.filter(monto__lte=monto_max)

        return qs.distinct().order_by("-fecha_hora")
