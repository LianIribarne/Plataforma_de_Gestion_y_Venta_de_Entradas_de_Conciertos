from rest_framework import permissions

class EsAdministrador(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.es_administrador

class EsOrganizador(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.es_organizador

class EsCliente(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.es_cliente
