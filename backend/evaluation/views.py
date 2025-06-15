from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Evaluation
from .serializers import EvaluationSerializer

class EvaluationListCreateView(generics.ListCreateAPIView):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not user.role:
            return Evaluation.objects.none()
        allowed_roles = user.get_allowed_roles()
        allowed_role_ids = [role.id for role in allowed_roles]
        return Evaluation.objects.filter(bid__tender__procurement_plan__owner__role__id__in=allowed_role_ids).order_by('-evaluation_date')

class EvaluationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not user.role:
            return Evaluation.objects.none()
        allowed_roles = user.get_allowed_roles()
        allowed_role_ids = [role.id for role in allowed_roles]
        return Evaluation.objects.filter(bid__tender__procurement_plan__owner__role__id__in=allowed_role_ids)