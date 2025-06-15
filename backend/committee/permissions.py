from rest_framework.permissions import BasePermission
from .models import Committee, CommitteeMembership
from users.models import RoleHierarchy
import logging

logger = logging.getLogger(__name__)

class CommitteePermission(BasePermission):
    def has_permission(self, request, view):
        # Allow authenticated users to list or create committees
        if not request.user or not request.user.is_authenticated:
            logger.debug("Permission denied: User is not authenticated")
            return False

        # Map view classes to actions for permission checks
        view_action_map = {
            'GetAllCommitteesView': 'list',
            'CreateCommitteeView': 'create',
            'GetCommitteeByIdView': 'retrieve',
            'UpdateCommitteeView': 'update',
            'DeleteCommitteeView': 'destroy',
            'AddMemberView': 'update',
            'RemoveMemberView': 'update',
            'GetCommitteesByMemberView': 'list',
            'GetCommitteesByDateRangeView': 'list',
            'DownloadFormationLetterView': 'retrieve'
        }

        # Determine the action based on the view's class name
        view_class_name = view.__class__.__name__
        action = view_action_map.get(view_class_name, 'unknown')

        logger.debug(f"Checking permission for action: {action}, user: {request.user}")

        if action in ['list', 'create']:
            return True

        # For other actions, proceed to object-level permission checks
        return True

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            logger.debug("Permission denied: User is not authenticated")
            return False

        # Map view classes to actions for object permission checks
        view_action_map = {
            'GetCommitteeByIdView': 'retrieve',
            'UpdateCommitteeView': 'update',
            'DeleteCommitteeView': 'destroy',
            'AddMemberView': 'update',
            'RemoveMemberView': 'update',
            'DownloadFormationLetterView': 'retrieve'
        }

        view_class_name = view.__class__.__name__
        action = view_action_map.get(view_class_name, 'unknown')

        logger.debug(f"Checking object permission for action: {action}, user: {request.user}, object: {obj}")

        # SUPERADMIN has full access
        if request.user.role and request.user.role.role_name == 'SUPERADMIN':
            logger.debug("Permission granted: User is SUPERADMIN")
            return True

        # Allow creator to perform all actions
        if isinstance(obj, Committee) and obj.created_by == request.user:
            logger.debug("Permission granted: User is the creator")
            return True

        # Allow committee members to view
        if action == 'retrieve' and isinstance(obj, Committee):
            if CommitteeMembership.objects.filter(committee=obj, user=request.user).exists():
                logger.debug("Permission granted: User is a committee member")
                return True

        # Allow users with higher role hierarchy to perform actions
        if isinstance(obj, Committee) and obj.created_by.role:
            user_role = request.user.role
            if user_role and obj.created_by.role in user_role.get_all_descendants():
                logger.debug("Permission granted: User's role is higher in hierarchy")
                return True

        logger.debug("Permission denied: No matching permission criteria")
        return False


###### start of code
# from rest_framework import permissions
# from .models import Committee, CommitteeMembership
# from users.models import RoleHierarchy

# class CommitteePermission(permissions.BasePermission):
#     """
#     Custom permission to allow access to a committee if:
#     1. The user is a member of the committee.
#     2. The user created the committee.
#     3. The user is a parent in the role hierarchy of the creator.
#     """
    
#     def has_permission(self, request, view):
#         # Allow list and create actions only if authenticated
#         if view.action in ['list', 'create']:
#             return request.user and request.user.is_authenticated
#         return True  # Defer to object-level permission for retrieve/update/destroy

#     def has_object_permission(self, request, view, obj):
#         if not request.user or not request.user.is_authenticated:
#             return False

#         # 1. Check if the user is a member of the committee
#         is_member = CommitteeMembership.objects.filter(
#             committee=obj,
#             user=request.user
#         ).exists()
#         if is_member:
#             return True

#         # 2. Check if the user created the committee
#         if obj.created_by == request.user:
#             return True

#         # 3. Check if the user is a parent in the role hierarchy of the creator
#         if obj.created_by and obj.created_by.role:
#             creator_role = obj.created_by.role
#             user_role = request.user.role
            
#             if user_role and creator_role:
#                 # Get all descendants of the user's role
#                 user_descendants = user_role.get_all_descendants()
#                 # Check if the creator's role is a descendant of the user's role
#                 if creator_role in user_descendants:
#                     return True

#         return False