# agency-app/permissions.py
from rest_framework import permissions
from users.models import CustomUser, RoleHierarchy

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role and request.user.role.role_name == 'SUPERADMIN'

class IsManagerUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role and request.user.role.role_name in ['SUPERADMIN', 'COO']

class IsContractorOrHigher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role and request.user.role.role_name in ['SUPERADMIN', 'COO', 'P1']