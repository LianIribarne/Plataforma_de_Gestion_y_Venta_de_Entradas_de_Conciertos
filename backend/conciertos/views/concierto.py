from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q, Count
from usuarios.permissions import EsOrganizador
from conciertos.models import ConciertoMeta, Concierto
from conciertos.serializers import (
    ConciertoMetaListSerializer, ConciertoCreateSerializer,
    ConciertoListSerializer, ConciertoUpdateSerializer,
    ConciertoDetailSerializer, ConciertoDashboardSerializer
)
from conciertos.stats import concierto_finanzas_queryset, reservas_stats_por_tipo, tipos_entrada_stats_queryset

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
        entradas = self.request.query_params.get('entradas')

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
        
        entradas = self.request.query_params.get('entradas')

        if entradas:
            entrada = entradas.lower()
            queryset = queryset.annotate(
                entradas_disponibles=Count(
                    'tipos_entrada__entradas',
                    filter=Q(tipos_entrada__entradas__estado='disponible')
                )
            )
            if entrada == "disponibles":
                queryset = queryset.filter(entradas_disponibles__gt=0)
            elif entrada == 'agotadas':
                queryset = queryset.filter(entradas_disponibles=0)

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

class ConciertoStatsView(generics.GenericAPIView):
    serializer_class = ConciertoDashboardSerializer
    lookup_url_kwarg = "concierto_id"
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = concierto_finanzas_queryset()

        if user.es_administrador:
            return qs

        if user.es_organizador:
            return qs.filter(organizador=user)

        return qs.none()
    
    def get(self, request, *args, **kwargs):
        detalles = self.get_object()
        concierto = self.get_object()
        tipos = tipos_entrada_stats_queryset(concierto.id)
        reservas = reservas_stats_por_tipo(concierto.id)

        data = {
            "detalles": detalles,
            "concierto": concierto,
            "tipos_entrada": tipos.order_by('-cantidad_total'),
            "tipos_reservas": reservas
        }

        serializer = self.get_serializer(instance=data)
        return Response(serializer.data)
