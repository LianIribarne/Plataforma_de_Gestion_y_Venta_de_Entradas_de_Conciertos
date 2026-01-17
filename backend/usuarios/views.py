from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics, status
from django.db.models import Q
from django.contrib.auth.models import update_last_login
from django.contrib.auth import authenticate, get_user_model
from django.conf import settings
from .permissions import EsAdministrador
from .models import Usuario
from .stats import organizador_stats_queryset
from .serializers import (
    RegistroClienteSerializer, RegistroUsuarioSerializer, ActualizarUsuarioSerializer, ChangePasswordSerializer,
    AdminUsuarioSerializer, AdminUsuarioListSerializer, AdminUsuarioDetailSerializer, OrganizadorStatsSerializer,
)

access_lifetime = settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()
refresh_lifetime = settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()

User = get_user_model()

class LoginCookieView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Se requieren email y contraseña"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not User.objects.filter(email=email).exists():
            return Response({"error": "El email no se encuentra registrado"}, status=status.HTTP_404_NOT_FOUND)
        
        user = authenticate(request, email=email, password=password)

        if not user:
            return Response({"error": "Contraseña incorrecta"}, status=status.HTTP_401_UNAUTHORIZED)

        update_last_login(None, user)

        # Generar Tokens
        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)

        # Respuesta normal
        res = Response({
            "message": "Bienvenido",
            "user": {
                "id": user.id,
                "email": user.email,
                "rol": user.rol.get_nombre_display(),
                "nombre": user.first_name,
                "apellido": user.last_name,
                "fecha_nacimiento": user.fecha_nacimiento.strftime("%d/%m/%Y"),
                "genero": user.get_genero_display(),
            }
        }, status=status.HTTP_200_OK)

        # Guardar cookies httpOnly
        res.set_cookie(
            key="access",
            value=access,
            httponly=True,
            secure=False,   # poner True en producción
            samesite="Lax",
            max_age=int(access_lifetime),
        )
        res.set_cookie(
            key="refresh",
            value=str(refresh),
            httponly=True,
            secure=False,   # poner True en producción
            samesite="Lax",
            max_age=int(refresh_lifetime),
        )

        return res

class RefreshCookieView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh")
        if not refresh_token:
            return Response({"error": "No hay refresh token"}, status=401)
        try:
            refresh = RefreshToken(refresh_token)
            access = str(refresh.access_token)

            # Rotar refresh token si corresponde
            if settings.SIMPLE_JWT.get("ROTATE_REFRESH_TOKENS"):
                new_refresh = str(refresh)
            else:
                new_refresh = refresh_token

            res = Response({"message": "Token renovado"})
            res.set_cookie(
                key="access",
                value=access,
                httponly=True,
                secure=False,   # poner True en producción
                samesite="Lax",
                max_age=int(access_lifetime),
            )
            res.set_cookie(
                key="refresh",
                value=new_refresh,
                httponly=True,
                secure=False,   # poner True en producción
                samesite="Lax",
                max_age=int(refresh_lifetime),
            )
            return res

        except:
            return Response({"error": "Refresh inválido"}, status=401)

class LogoutView(APIView):
    def post(self, request):
        res = Response({"message": "Se cerro la sesion"})
        res.delete_cookie("access", path='/')
        res.delete_cookie("refresh", path='/')
        return res

class RegistroClienteView(generics.CreateAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistroClienteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Registro exitoso"}, status=status.HTTP_201_CREATED)

class RegistroUsuarioView(generics.CreateAPIView):
    permission_classes = [EsAdministrador]
    
    def post(self, request):
        serializer = RegistroUsuarioSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Registro exitoso"}, status=status.HTTP_201_CREATED)

class UserMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response({
            "user": {
                "id": user.id,
                "email": user.email,
                "rol": user.rol.get_nombre_display(),
                "nombre": user.first_name,
                "apellido": user.last_name,
                "fecha_nacimiento": user.fecha_nacimiento.strftime("%d/%m/%Y"),
                "genero": user.get_genero_display(),
            }
        }, status=status.HTTP_200_OK)

class ActualizarUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        serializer = ActualizarUsuarioSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={"request": request}
        )

        if serializer.is_valid():
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response({"message": "Perfil actualizado correctamente."})

        return Response(serializer.errors, status=400)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request},
        )

        if serializer.is_valid():
            user = request.user
            new_password = serializer.validated_data["new_password"]
            user.set_password(new_password)
            user.save()

            return Response({"message": "Contraseña cambiada correctamente."})

        return Response(serializer.errors, status=400)

class AdminUsuarioUpdateView(generics.RetrieveUpdateAPIView):
    permission_classes = [EsAdministrador]
    serializer_class = AdminUsuarioSerializer
    queryset = Usuario.objects.all()
    lookup_field = 'id'

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data.copy()

        serializer = self.get_serializer(
            instance,
            data=data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)

        password = serializer.validated_data.pop("password", None)
        if password:
            instance.set_password(password)

        serializer.save()
        return Response({"message": "Usuario actualizado correctamente."}, status=status.HTTP_200_OK)

class AdminUsuarioListView(generics.ListAPIView):
    permission_classes = [EsAdministrador]
    serializer_class = AdminUsuarioListSerializer

    def get_queryset(self):
        qs = Usuario.objects.exclude(rol__nombre='admin')

        email = self.request.query_params.get("email")
        nombre = self.request.query_params.get("nombre")
        activo = self.request.query_params.get("activo")
        rol = self.request.query_params.get("rol")

        if email:
            qs = qs.filter(email__icontains=email)

        if nombre:
            qs = qs.filter(
                Q(first_name__icontains=nombre) |
                Q(last_name__icontains=nombre)
            )

        if activo in ["true", "false"]:
            qs = qs.filter(is_active=(activo == "true"))

        if rol:
            qs = qs.filter(rol__nombre=rol)

        return qs

class AdminUsuarioDetailView(generics.RetrieveAPIView):
    permission_classes = [EsAdministrador]
    serializer_class = AdminUsuarioDetailSerializer
    queryset = Usuario.objects.all()
    lookup_field = "id"

    def get_object(self):
        user = super().get_object()

        if user.rol.nombre == "admin":
            raise PermissionDenied("No tenés permiso para ver información de administradores.")

        return user
    
class OrganizadorStatsView(generics.RetrieveAPIView):
    serializer_class = OrganizadorStatsSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return organizador_stats_queryset()

    def get_object(self):
        usuario = super().get_object()
        request_user = self.request.user

        # Admin ve a cualquiera
        if request_user.es_administrador:
            return usuario

        # Organizador solo a sí mismo
        if request_user.es_organizador and usuario.id == request_user.id:
            return usuario

        raise PermissionDenied("No tenés permiso para ver estas estadísticas")
