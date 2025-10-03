from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import timedelta
from django.utils import timezone
from .models import Usuario, Evento, Entrada, Rol
from .serializers import UsuarioSerializer, EventoSerializer, EntradaSerializer
from .permissions import EsAdministrador, EsOrganizador

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

    def get_permissions(self):
        if self.action == 'create':
            if self.request.user.is_authenticated and not self.request.user.es_administrador:
                raise PermissionDenied("Solo los administradores pueden crear usuarios estando autenticado.")
            return [AllowAny()]
        elif self.action in ['destroy', 'list']:
            return [EsAdministrador()]

        return [IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return Usuario.objects.none()  # anónimo no ve nada

        if user.es_administrador:
            return Usuario.objects.all()  # admin ve todo

        # clientes y organizadores solo se ven a sí mismos
        return Usuario.objects.filter(id=user.id)
    
    def perform_create(self, serializer):
        rol_data = self.request.data.get('rol')
        rol = None

        if self.request.user.is_authenticated:
            # Solo un admin autenticado puede crear organizadores o admins
            rol = Rol.objects.get(nombre=rol_data) if rol_data else None
            if rol and rol.nombre in ['Organizador', 'Administrador'] and not self.request.user.es_administrador:
                raise PermissionDenied("Solo los administradores pueden crear organizadores o administradores.")
            if not rol:
                rol = Rol.objects.get(nombre='Cliente')
        else:
            # Anónimo siempre será Cliente
            rol = Rol.objects.get(nombre='Cliente')

        serializer.save(rol=rol)

class EventoViewSet(viewsets.ModelViewSet):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [EsOrganizador()]
        return [IsAuthenticatedOrReadOnly()]

    def perform_create(self, serializer):
        evento = serializer.save(organizador=self.request.user)
        entradas_info = self.request.data.get('cant_entradas', [])

        for entrada_data in entradas_info:
            tipo = entrada_data.get('tipo', 'Normal')
            precio = entrada_data.get('precio')
            cantidad = int(entrada_data.get('cant_entradas', 0))

            for _ in range(cantidad):
                Entrada.objects.create(
                    evento=evento,
                    tipo=tipo,
                    precio=precio,
                    estado='Disponible'
                )

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.es_organizador:
            return Evento.objects.filter(organizador=user)
        return Evento.objects.all()

class EntradaViewSet(viewsets.ModelViewSet):
    queryset = Entrada.objects.all()
    serializer_class = EntradaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.es_cliente:
            return Entrada.objects.filter(usuario=user)
        elif user.es_organizador:
            return Entrada.objects.filter(evento__organizador=user)
        return super().get_queryset()
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def reservar(self, request):
        if not request.user.es_cliente:
            raise PermissionDenied('Solo los clientes pueden reservar entradas.')
        
        evento_id = request.data.get('evento_id')
        entrada = Entrada.objects.filter(evento_id=evento_id, estado='Disponible').first()

        if not entrada:
            return Response({'error': 'No hay entradas disponibles'}, status=400)
        
        entrada.estado = 'Reservada'
        entrada.usuario = request.user
        entrada.reserva_expira = timezone.now() + timedelta(minutes=10)
        entrada.save()

        return Response({
            'mensaje': 'Entrada reservada',
            'entrada_id': entrada.id,
            'expira_en': 10
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def comprar(self, request, pk=None):
        entrada = self.get_object()
        
        if not request.user.es_cliente:
            raise PermissionDenied('Solo los clientes pueden comprar entradas.')
        
        if entrada.usuario != request.user or entrada.estado != 'Reservada':
            raise Response({'error': 'No puedes comprar esta entrada'}, status=400)
        
        entrada.estado = 'Vendida'
        entrada.save()
        return Response({'mensaje': 'Entrada comprada con éxito'})

    def perform_create(self, serializer):
        if not self.request.user.es_organizador:
            raise PermissionDenied("Solo los organizadores pueden crear entradas.")
        serializer.save(evento=serializer.validated_data['evento'])
