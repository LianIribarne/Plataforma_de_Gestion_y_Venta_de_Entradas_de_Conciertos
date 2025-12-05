from rest_framework.permissions import BasePermission

class EsAdministrador(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.es_administrador

class EsOrganizador(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.es_organizador

class EsCliente(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.es_cliente

class PuedeModificarUsuario(BasePermission):
    """
    Admin puede modificar cualquier usuario EXCEPTO otros admins.
    Usuarios normales solo pueden modificarse a sí mismos.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user

        # Si el usuario no está autenticado → no pasa
        if not user.is_authenticated:
            return False

        # Si el usuario es admin
        if user.es_administrador:
            # Puede modificar a cualquiera excepto a otros admins
            return not obj.es_administrador

        # Si NO es admin → solo modifica su propio usuario
        return obj.id == user.id
