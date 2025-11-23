from django.urls import path
from .views import RegistroUsuarioView, LoginCookieView, RefreshCookieView, LogoutView, ProtectedView

urlpatterns = [
    path("registro/", RegistroUsuarioView.as_view(), name="registro"),
    path("login/", LoginCookieView.as_view(), name="login"),
    path("refresh/", RefreshCookieView.as_view(), name="refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("protected/", ProtectedView.as_view(), name="protected"),
]
