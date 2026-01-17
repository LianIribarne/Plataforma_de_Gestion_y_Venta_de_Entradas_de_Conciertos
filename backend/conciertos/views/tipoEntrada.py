from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from conciertos.models import TipoEntrada
from conciertos.services import (
    cancelar_tipo, cancelar_cantidad,
    modificar_precio, sincronizar_limite_concierto,
    agregar_entradas
)
from conciertos.serializers import (
    TipoEntradaCancelarSerializer, TipoEntradaCancelarCantidadSerializer,
    TipoEntradaModificarSerializer, TipoEntradaAgregarSerializer
)

class TipoEntradaCancelarView(generics.GenericAPIView):
    serializer_class = TipoEntradaCancelarSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        user = self.request.user

        qs = TipoEntrada.objects.select_related(
            "evento",
            "evento__organizador"
        )

        if user.es_administrador:
            return qs

        if user.es_organizador:
            return qs.filter(evento__organizador=user)

        return qs.none()

    def post(self, request, *args, **kwargs):
        tipo = self.get_object()

        cancelar_tipo(tipo)

        return Response(
            {"detail": "Tipo de entrada cancelado correctamente"},
            status=status.HTTP_200_OK
        )

class TipoEntradaCancelarCantidadView(generics.GenericAPIView):
    serializer_class = TipoEntradaCancelarCantidadSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        user = self.request.user

        qs = TipoEntrada.objects.select_related(
            "evento",
            "evento__organizador"
        )

        if user.es_administrador:
            return qs

        if user.es_organizador:
            return qs.filter(evento__organizador=user)

        return qs.none()

    def post(self, request, *args, **kwargs):
        tipo = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cantidad = serializer.validated_data["cantidad"]

        try:
            cancelar_cantidad(tipo, cantidad)
        except ValueError as e:
            raise ValidationError({"cantidad": str(e)})

        return Response(
            {"detail": f"Se cancelaron {cantidad} entradas"},
            status=status.HTTP_200_OK
        )

class TipoEntradaModificarView(generics.GenericAPIView):
    serializer_class = TipoEntradaModificarSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        user = self.request.user

        qs = TipoEntrada.objects.select_related(
            "evento",
            "evento__organizador"
        )

        if user.es_administrador:
            return qs

        if user.es_organizador:
            return qs.filter(evento__organizador=user)

        return qs.none()

    def patch(self, request, *args, **kwargs):
        tipo = self.get_object()

        serializer = self.get_serializer(
            tipo,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        if "precio" in data:
            modificar_precio(tipo, data["precio"])
        
        if "limite_reserva" in data:
            tipo.limite_reserva = data["limite_reserva"]
            tipo.save(update_fields=["limite_reserva"])

            sincronizar_limite_concierto(tipo.evento)
        
        if "nombre" in data:
            tipo.nombre = data["nombre"]
            tipo.save(update_fields=["nombre"])

        return Response(
            {"detail": "Tipo de entrada actualizado correctamente"},
            status=status.HTTP_200_OK
        )

class TipoEntradaAgregarEntradasView(generics.GenericAPIView):
    serializer_class = TipoEntradaAgregarSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        user = self.request.user

        qs = TipoEntrada.objects.select_related(
            "evento",
            "evento__organizador"
        )

        if user.es_administrador:
            return qs

        if user.es_organizador:
            return qs.filter(evento__organizador=user)

        return qs.none()

    def post(self, request, *args, **kwargs):
        tipo = self.get_object()

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cantidad = serializer.validated_data["cantidad"]

        try:
            agregar_entradas(tipo, cantidad)
        except ValidationError as e:
            raise ValidationError({"cantidad": e.message})

        return Response(
            {"detail": f"Se agregaron {cantidad} entradas correctamente"},
            status=status.HTTP_200_OK
        )
