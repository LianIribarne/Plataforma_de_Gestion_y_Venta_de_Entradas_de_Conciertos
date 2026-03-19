from django.urls import path

from .views import (ActualizarUsuarioView, AdminUsuarioDetailView,
                    AdminUsuarioListView, AdminUsuarioUpdateView,
                    ChangePasswordView, LoginCookieView, LogoutView,
                    OrganizadorStatsView, RefreshCookieView,
                    RegistroClienteView, RegistroUsuarioView, UserMeView)

urlpatterns = [
    # todos
    path("registrarse/", RegistroClienteView.as_view(), name="registro"),
    path("login/", LoginCookieView.as_view(), name="login"),
    path("refresh/", RefreshCookieView.as_view(), name="refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", UserMeView.as_view(), name="me"),
    path("actualizar_perfil/", ActualizarUsuarioView.as_view(), name="actualizar_perfil"),
    path("actualizar_password/", ChangePasswordView.as_view(), name="actualizar_password"),

    # admin
    path("admin/crear_usuario/", RegistroUsuarioView.as_view(), name="crear_usuario"),
    path("admin/modificar_usuario/<int:id>", AdminUsuarioUpdateView.as_view(), name="modificar_usuario"),
    path("admin/listar_usuarios/", AdminUsuarioListView.as_view(), name="listar_usuarios"),
    path("admin/detalles_usuario/<int:id>", AdminUsuarioDetailView.as_view(), name="usuario_detalle"),

    # admin y organizador
    path("estadisticas_organizador/<int:id>", OrganizadorStatsView.as_view(), name="stats_organizador")
]
