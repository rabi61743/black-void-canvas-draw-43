from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Contract
from .serializers import ContractSerializer

class ContractListCreateView(generics.ListCreateAPIView):
    queryset = Contract.objects.all()
    serializer_class = ContractSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not user.role:
            return Contract.objects.none()
        allowed_roles = user.get_allowed_roles()
        allowed_role_ids = [role.id for role in allowed_roles]
        return Contract.objects.filter(bid__tender__procurement_plan__owner__role__id__in=allowed_role_ids).order_by('-award_date')

class ContractDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Contract.objects.all()
    serializer_class = ContractSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not user.role:
            return Contract.objects.none()
        allowed_roles = user.get_allowed_roles()
        allowed_role_ids = [role.id for role in allowed_roles]
        return Contract.objects.filter(bid__tender__procurement_plan__owner__role__id__in=allowed_role_ids)