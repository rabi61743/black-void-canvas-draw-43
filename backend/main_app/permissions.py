from rest_framework import permissions
from .models import ProcurementMember, Procurement


class IsRoleHierarchical(permissions.BasePermission):
    """
    Custom permission to allow higher roles in the hierarchy to access procurements created by lower roles.
    """
    def has_permission(self, request, view):
        # Check if the current user is the MD or CTO
        if request.user.role.role_name in ['MD', 'CTO']:
            return True
        
        # Get the procurement object ID from the URL
        procurement_id = view.kwargs.get('procurement_id')
        if procurement_id:
            procurement = Procurement.objects.get(id=procurement_id)
            creator_role = procurement.created_by.role

            # Check if the user’s role is a parent of the creator's role
            user_role = request.user.role
            # Get all ancestor roles of the current user
            user_role_hierarchy = user_role.get_hierarchy()
            
            # If the user’s role is in the creator’s hierarchy, allow access
            if creator_role.role_name in user_role_hierarchy:
                return True

        return False



class IsProcurementMember(permissions.BasePermission):
    """
    Custom permission to allow users who are members of a procurement to access it.
    """
    def has_permission(self, request, view):
        procurement_id = view.kwargs.get('procurement_id')
        if procurement_id:
            # Check if the user is a member of the procurement
            return ProcurementMember.objects.filter(user=request.user, procurement_id=procurement_id).exists()
        return False
