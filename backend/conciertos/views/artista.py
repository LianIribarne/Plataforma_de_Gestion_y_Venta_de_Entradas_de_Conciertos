from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser
from usuarios.permissions import EsAdministrador
from conciertos.models import Categoria, Pais, Artista
from conciertos.serializers import (
    CategoriaSerializer, PaisSerializer, ArtistaCreateSerializer,
    ArtistaSerializer, ArtistaModificarSerializer
)

# categoria
class CategoriaListView(generics.ListAPIView):
    queryset = Categoria.objects.all().order_by('nombre')
    serializer_class = CategoriaSerializer
    pagination_class = None

# pais
class PaisListView(generics.ListAPIView):
    queryset = Pais.objects.all().order_by('nombre')
    serializer_class = PaisSerializer
    pagination_class = None

# artista
class ArtistaCreateView(generics.CreateAPIView):
    queryset = Artista.objects.all()
    serializer_class = ArtistaCreateSerializer
    permission_classes = [EsAdministrador]
    parser_classes = [MultiPartParser, FormParser]

class ArtistaListView(generics.ListAPIView):
    queryset = Artista.objects.all().order_by('nombre')
    serializer_class = ArtistaSerializer

    def get_queryset(self):
        queryset = Artista.objects.select_related(
            "categoria",
            "pais_origen"
        ).order_by("nombre")

        id = self.request.query_params.get("id")
        nombre = self.request.query_params.get("nombre")
        categoria = self.request.query_params.get("categoria")
        pais_origen = self.request.query_params.get("pais_origen")
        activo = self.request.query_params.get("activo")

        if id:
            queryset = queryset.filter(id=id)

        if nombre:
            queryset = queryset.filter(nombre__icontains=nombre)

        if categoria:
            queryset = queryset.filter(categoria_id=categoria)

        if pais_origen:
            queryset = queryset.filter(pais_origen_id=pais_origen)
        
        if activo in ['true', 'false']:
            queryset = queryset.filter(activo=(activo == 'true'))

        return queryset

class ArtistaModificarView(generics.RetrieveUpdateAPIView):
    permission_classes = [EsAdministrador]
    serializer_class = ArtistaModificarSerializer
    queryset = Artista.objects.all()
    lookup_field = "id"
