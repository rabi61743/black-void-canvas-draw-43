from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Tender
from .serializers import TenderSerializer
from procurement.models import ProcurementPlan

class TenderListCreateView(generics.ListCreateAPIView):
    queryset = Tender.objects.all()
    serializer_class = TenderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not user.role:
            return Tender.objects.none()
        allowed_roles = user.get_allowed_roles()
        allowed_role_ids = [role.id for role in allowed_roles]
        return Tender.objects.filter(procurement_plan__owner__role__id__in=allowed_role_ids).order_by('-created_at')

    def perform_create(self, serializer):
        procurement_plan_id = self.request.data.get('procurement_plan')
        specification_id = self.request.data.get('specification')
        plan = ProcurementPlan.objects.get(id=procurement_plan_id)
        serializer.save(procurement_plan=plan)

class TenderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tender.objects.all()
    serializer_class = TenderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not user.role:
            return Tender.objects.none()
        allowed_roles = user.get_allowed_roles()
        allowed_role_ids = [role.id for role in allowed_roles]
        return Tender.objects.filter(procurement_plan__owner__role__id__in=allowed_role_ids)

    def get(self, request, *args, **kwargs):
        if not request.user.role:
            return Response(
                {'error': 'User must have a role to view tenders.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().get(request, *args, **kwargs)