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
