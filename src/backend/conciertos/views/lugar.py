from conciertos.models import Ciudad, Lugar, Provincia
from conciertos.serializers import (CiudadSerializer, LugarCreateSerializer,
                                    LugarModificarSerializer, LugarSerializer,
                                    ProvinciaSerializer)
from rest_framework import generics
from usuarios.permissions import EsAdministrador


# provincia
class ProvinciaListView(generics.ListAPIView):
    queryset = Provincia.objects.all().order_by('nombre')
    serializer_class = ProvinciaSerializer
    pagination_class = None

# ciudad
class CiudadListView(generics.ListAPIView):
    serializer_class = CiudadSerializer
    pagination_class = None

    def get_queryset(self):
        queryset = Ciudad.objects.all().order_by('nombre')
        provincia_id = self.request.query_params.get("provincia_id")

        if provincia_id:
            queryset = queryset.filter(provincia_id=provincia_id)

        return queryset

# lugar
class LugarCreateView(generics.CreateAPIView):
    queryset = Lugar.objects.all()
    serializer_class = LugarCreateSerializer
    permission_classes = [EsAdministrador]

class LugarListView(generics.ListAPIView):
    serializer_class = LugarSerializer
    pagination_class = None

    def get_queryset(self):
        queryset = Lugar.objects.select_related(
            "ciudad",
            "ciudad__provincia"
        )

        id = self.request.query_params.get("id")
        provincia = self.request.query_params.get("provincia")
        ciudad = self.request.query_params.get("ciudad")
        nombre = self.request.query_params.get("nombre")
        activo = self.request.query_params.get("activo")

        if id:
            queryset = queryset.filter(id=id)

        if provincia:
            queryset = queryset.filter(ciudad__provincia_id=provincia)

        if ciudad:
            queryset = queryset.filter(ciudad_id=ciudad)

        if nombre:
            queryset = queryset.filter(nombre__icontains=nombre)

        if activo in ['true', 'false']:
            queryset = queryset.filter(activo=(activo == 'true'))

        return queryset

class LugarModificarView(generics.RetrieveUpdateAPIView):
    permission_classes = [EsAdministrador]
    serializer_class = LugarModificarSerializer
    queryset = Lugar.objects.all()
    lookup_field = "id"
