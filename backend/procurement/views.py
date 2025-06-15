from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import ProcurementPlan
from .serializers import ProcurementPlanSerializer, ProcurementPlanDropdownSerializer
from users.models import CustomUser, RoleHierarchy

# procurement/views.py
class ProcurementPlanListCreateView(generics.ListCreateAPIView):
    queryset = ProcurementPlan.objects.all()
    serializer_class = ProcurementPlanSerializer  # Use full serializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not user.role:
            return ProcurementPlan.objects.none()
        allowed_roles = user.get_allowed_roles()
        allowed_role_ids = [role.id for role in allowed_roles]
        return ProcurementPlan.objects.filter(owner__role__id__in=allowed_role_ids).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get(self, request, *args, **kwargs):
        if not request.user.role:
            return Response(
                {'error': 'User must have a role to view procurement plans.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().get(request, *args, **kwargs)

class ProcurementPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProcurementPlan.objects.all()
    serializer_class = ProcurementPlanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not user.role:
            return ProcurementPlan.objects.none()

        allowed_roles = user.get_allowed_roles()
        allowed_role_ids = [role.id for role in allowed_roles]
        return ProcurementPlan.objects.filter(owner__role__id__in=allowed_role_ids)

    def get(self, request, *args, **kwargs):
        if not request.user.role:
            return Response(
                {'error': 'User must have a role to view procurement plans.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().get(request, *args, **kwargs)


# from rest_framework import generics
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response
# from rest_framework import status
# from .models import ProcurementPlan
# from .serializers import ProcurementPlanSerializer
# from users.models import CustomUser, RoleHierarchy

# class ProcurementPlanListCreateView(generics.ListCreateAPIView):
#     queryset = ProcurementPlan.objects.all()
#     serializer_class = ProcurementPlanSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user
#         if not user.is_authenticated or not user.role:
#             return ProcurementPlan.objects.none()

#         # Get all roles in the user's hierarchy (self + descendants)
#         allowed_roles = user.get_allowed_roles()
#         allowed_role_ids = [role.id for role in allowed_roles]

#         # Return plans owned by users with roles in the allowed hierarchy
#         return ProcurementPlan.objects.filter(owner__role__id__in=allowed_role_ids).order_by('-created_at')

#     def perform_create(self, serializer):
#         serializer.save(owner=self.request.user)

#     def get(self, request, *args, **kwargs):
#         # Optional: Restrict to users with a role
#         if not request.user.role:
#             return Response(
#                 {'error': 'User must have a role to view procurement plans.'},
#                 status=status.HTTP_403_FORBIDDEN
#             )
#         return super().get(request, *args, **kwargs)

# class ProcurementPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
#     queryset = ProcurementPlan.objects.all()
#     serializer_class = ProcurementPlanSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user
#         if not user.is_authenticated or not user.role:
#             return ProcurementPlan.objects.none()

#         # Get all roles in the user's hierarchy (self + descendants)
#         allowed_roles = user.get_allowed_roles()
#         allowed_role_ids = [role.id for role in allowed_roles]

#         # Return plans owned by users with roles in the allowed hierarchy
#         return ProcurementPlan.objects.filter(owner__role__id__in=allowed_role_ids)

#     def get(self, request, *args, **kwargs):
#         # Optional: Restrict to users with a role
#         if not request.user.role:
#             return Response(
#                 {'error': 'User must have a role to view procurement plans.'},
#                 status=status.HTTP_403_FORBIDDEN
#             )
#         return super().get(request, *args, **kwargs)



