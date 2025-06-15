from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Bid
from .serializers import BidSerializer

class BidListCreateView(generics.ListCreateAPIView):
    queryset = Bid.objects.all()
    serializer_class = BidSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not user.role:
            return Bid.objects.none()
        allowed_roles = user.get_allowed_roles()
        allowed_role_ids = [role.id for role in allowed_roles]
        return Bid.objects.filter(tender__procurement_plan__owner__role__id__in=allowed_role_ids).order_by('-submission_date')

    def perform_create(self, serializer):
        serializer.save(bidder=self.request.user)

class BidDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Bid.objects.all()
    serializer_class = BidSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not user.role:
            return Bid.objects.none()
        allowed_roles = user.get_allowed_roles()
        allowed_role_ids = [role.id for role in allowed_roles]
        return Bid.objects.filter(tender__procurement_plan__owner__role__id__in=allowed_role_ids)