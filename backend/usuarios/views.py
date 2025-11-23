from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics, status
from .serializers import RegistroSerializer
from django.contrib.auth import authenticate

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

        # Generar Tokens
        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)

        # Respuesta normal
        res = Response({"message": "Bienvenido"}, status=status.HTTP_200_OK)

        # Guardar cookies httpOnly
        res.set_cookie(
            key="access",
            value=access,
            httponly=True,
            secure=False,   # TRUE si usás HTTPS
            samesite="Lax",
            max_age=5 * 60,
        )
        res.set_cookie(
            key="refresh",
            value=str(refresh),
            httponly=True,
            secure=False,   # TRUE si usás HTTPS
            samesite="Lax",
            max_age=60 * 60 * 24,
        )

        return res

class RefreshCookieView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh")

        if not refresh_token:
            return Response({"error": "No hay refresh token"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            refresh = RefreshToken(refresh_token)
            access = str(refresh.access_token)

            res = Response({"message": "Token renovado"})
            res.set_cookie(
                key="access",
                value=access,
                httponly=True,
                secure=False,
                samesite="Lax",
                max_age=60 * 60,
            )
            return res

        except:
            return Response({"error": "Refresh inválido"}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    def post(self, request):
        res = Response({"message": "Se cerro la sesion"})
        res.delete_cookie("access", path='/')
        res.delete_cookie("refresh", path='/')
        return res

class RegistroUsuarioView(generics.CreateAPIView):
    def post(self, request):
        serializer = RegistroSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Registro exitoso"}, status=status.HTTP_201_CREATED)

class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": f"Hola {request.user.email}"})
