from rest_framework import permissions

class HierarchyPermission(permissions.BasePermission):
    """
    Custom permission that grants access if the user is within the hierarchy tree.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        """
        Only allow access if the object belongs to the user's subtree.
        """
        if hasattr(obj, 'role'):
            return obj.role in request.user.get_allowed_roles()
        return False