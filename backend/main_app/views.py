from rest_framework import viewsets
# from .serializers import DepartmentSerializer
from users.permissions import HierarchyPermission

# class DepartmentViewSet(viewsets.ModelViewSet):
#     serializer_class = DepartmentSerializer
#     permission_classes = [HierarchyPermission]

#     def get_queryset(self):
#         return Department.objects.filter(
#             created_by__hierarchy_level__lte=self.request.user.hierarchy_level
#         )

#     def perform_create(self, serializer):
#         serializer.save(created_by=self.request.user)

from django.shortcuts import render

def home(request):
    return render(request, 'home.html')  # Make sure you create a 'home.html' template


from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Procurement, ProcurementMember
from .serializers import ProcurementSerializer, ProcurementMemberSerializer
# from .permissions import HierarchyPermission

class ProcurementListCreateView(generics.ListCreateAPIView):
    """
    Allows users to create procurement and view procurements they are part of or within their hierarchy.
    """
    serializer_class = ProcurementSerializer
    permission_classes = [IsAuthenticated, HierarchyPermission]

    def get_queryset(self):
        user = self.request.user
        allowed_roles = user.get_allowed_roles()
        return Procurement.objects.filter(created_by__role__in=allowed_roles)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class ProcurementMemberAddView(generics.CreateAPIView):
    """
    Allows adding a user to a procurement with a role.
    """
    serializer_class = ProcurementMemberSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        procurement_id = request.data.get("procurement")
        user_id = request.data.get("user_id")
        role = request.data.get("role")

        if not procurement_id or not user_id or not role:
            return Response({"error": "Procurement, user_id, and role are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            procurement = Procurement.objects.get(id=procurement_id)
            user = CustomUser.objects.get(id=user_id)

            # Only allow adding members within user's allowed hierarchy
            if user.role not in request.user.get_allowed_roles():
                return Response({"error": "You cannot add this user"}, status=status.HTTP_403_FORBIDDEN)

            ProcurementMember.objects.create(procurement=procurement, user=user, role=role)
            return Response({"message": "User added successfully"}, status=status.HTTP_201_CREATED)
        except Procurement.DoesNotExist:
            return Response({"error": "Procurement not found"}, status=status.HTTP_404_NOT_FOUND)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

# views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Procurement, ProcurementMember, CustomUser
from .serializers import ProcurementSerializer
from .permissions import IsRoleHierarchical, IsProcurementMember
from django.db.models import Q

class ProcurementListView(APIView):
    permission_classes = [IsAuthenticated, IsRoleHierarchical]  # Use the new IsRoleHierarchical permission

    def get(self, request):
        # MD and CTO can see all procurements
        if request.user.role.role_name in ['MD', 'CTO']:
            procurements = Procurement.objects.all()
        else:
            # Regular users can see procurements they're part of or created by subordinates
            # user_procurements = ProcurementMember.objects.filter(user=request.user).values_list('procurement_id', flat=True)
            user_procurements = Procurement.objects.filter(
                Q(created_by=request.user) | Q(procurementmember__user=request.user)
            ).distinct()
            procurements = Procurement.objects.filter(id__in=user_procurements)

        serializer = ProcurementSerializer(procurements, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProcurementDetailView(APIView):
    permission_classes = [IsAuthenticated, IsRoleHierarchical | IsProcurementMember]  # Check both role hierarchy and membership

    def get(self, request, procurement_id):
        try:
            procurement = Procurement.objects.get(id=procurement_id)
        except Procurement.DoesNotExist:
            return Response({'detail': 'Procurement not found'}, status=status.HTTP_404_NOT_FOUND)

        # Allow MD/CTO to access all procurements, or the user must be a member or a parent role of the creator
        if request.user.role.role_name in ['MD', 'CTO']:
            serializer = ProcurementSerializer(procurement)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Check if the user created this procurement or if they are part of the procurement
        if procurement.created_by == request.user or ProcurementMember.objects.filter(user=request.user, procurement=procurement).exists():
            serializer = ProcurementSerializer(procurement)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Allow access if the user is a parent role of the creator (ensure the hierarchy check is correct)
        user_role_hierarchy = request.user.role.get_hierarchy()
        if procurement.created_by.role.role_name in user_role_hierarchy:
            serializer = ProcurementSerializer(procurement)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response({'detail': 'You do not have permission to view this procurement.'}, status=status.HTTP_403_FORBIDDEN)
