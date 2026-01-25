from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.db.models import Q
from usuarios.permissions import EsOrganizador
from conciertos.models import ConciertoMeta, Concierto
from conciertos.serializers import (
    ConciertoMetaListSerializer, ConciertoCreateSerializer,
    ConciertoListSerializer, ConciertoUpdateSerializer,
    ConciertoDetailSerializer,
)
from conciertos.services import cancelar_concierto

# conciertoMeta
class ConciertoMetaListView(generics.ListAPIView):
    serializer_class = ConciertoMetaListSerializer

    def get_queryset(self):
        queryset = ConciertoMeta.objects.filter(activo=True)

        tipo = self.request.query_params.get("tipo")
        if tipo:
            queryset = queryset.filter(tipo=tipo)

        return queryset.order_by("orden")

# concierto
class ConciertoCreateView(generics.CreateAPIView):
    queryset = Concierto.objects.all()
    serializer_class = ConciertoCreateSerializer
    permission_classes = [EsOrganizador]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        concierto = serializer.save()

        return Response(
            {"id": concierto.id, "titulo": concierto.titulo},
            status=status.HTTP_201_CREATED
        )

class ConciertoListView(generics.ListAPIView):
    serializer_class = ConciertoListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Concierto.objects.all().order_by('fecha', 'show_hora')

        if user.es_cliente:
            queryset = queryset.exclude(estado__codigo='borrador')
        elif user.es_organizador:
            queryset = queryset.filter(organizador=user)
        elif user.es_administrador:
            queryset = queryset.all()

        artista = self.request.query_params.get('artista')
        categoria = self.request.query_params.get('categoria')
        rango_horario = self.request.query_params.get('rango_horario')
        provincia = self.request.query_params.get('provincia')
        estado = self.request.query_params.get('estado')
        mood = self.request.query_params.get('mood')
        organizador = self.request.query_params.get('organizador')

        if artista:
            queryset = queryset.filter(artista_id=artista)

        if categoria:
            queryset = queryset.filter(artista__categoria_id=categoria)

        if rango_horario:
            horario = rango_horario.lower()

            if horario == 'tarde':
                queryset = queryset.filter(show_hora__gte="12:00", show_hora__lt="18:00")
            elif horario == 'noche':
                queryset = queryset.filter(show_hora__gte="18:00", show_hora__lt="23:00")
            elif horario == 'madrugada':
                queryset = queryset.filter(
                    Q(show_hora__gte="23:00") | Q(show_hora__lt="05:00")
                )

        if provincia:
            queryset = queryset.filter(lugar__ciudad__provincia_id=provincia)

        if estado:
            queryset = queryset.filter(estado_id=estado)

        if mood:
            queryset = queryset.filter(mood_id=mood)

        if organizador:
            queryset = queryset.filter(organizador_id=organizador)

        return queryset

class ConciertoUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = ConciertoUpdateSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user
        qs = Concierto.objects.all()

        if user.es_administrador:
            return qs

        if user.es_organizador:
            return qs.filter(organizador=user)

        return qs.none()

    def perform_update(self, serializer):
        concierto = self.get_object()

        if concierto.estado.codigo in ['cancelado', 'finalizado']:
            raise ValidationError(
                {"detail": "No se puede modificar el concierto."}
            )

        serializer.save()

class ConciertoDetailView(generics.RetrieveAPIView):
    serializer_class = ConciertoDetailSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        qs = Concierto.objects.all()

        if user.es_cliente or user.es_administrador:
            return qs

        if user.es_organizador:
            return qs.filter(organizador=user)

        return qs.none()

class CancelarConciertoView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Concierto.objects.all()

        if user.es_administrador:
            return qs

        if user.es_organizador:
            return qs.filter(organizador=user)

        return qs.none()

    def post(self, request, id, **kwargs):
        concierto = get_object_or_404(self.get_queryset(), id=id)

        if concierto.estado.codigo in ['cancelado', 'finalizado']:
            return Response(
                {"detail": "El concierto ya está cancelado o ya finalizo."},
                status=status.HTTP_400_BAD_REQUEST
            )

        cancelar_concierto(concierto.id)

        return Response(
            {
                "detail": 
                "Concierto cancelado. Tipos y entradas canceladas. Reservas activas liberadas."
            },
            status=status.HTTP_200_OK
        )
