

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Specification
from .serializers import SpecificationSerializer
from procurement.models import ProcurementPlan
import logging

logger = logging.getLogger(__name__)

class SpecificationListCreateView(generics.ListCreateAPIView):
    queryset = Specification.objects.all()
    serializer_class = SpecificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not user.role:
            logger.warning(f"User {user.username if user.is_authenticated else 'anonymous'} has no role, returning empty queryset")
            return Specification.objects.none()

        try:
            # Removed created_by filter since it's not a field
            user_specs = Specification.objects.filter()  # No created_by filter

            allowed_roles = user.get_allowed_roles()
            allowed_role_ids = [role.id for role in allowed_roles]
            logger.debug(f"Allowed role IDs for {user.username}: {allowed_role_ids}")

            role_specs = Specification.objects.filter(procurement_plan__owner__isnull=False, procurement_plan__owner__role__id__in=allowed_role_ids)
            logger.debug(f"Role specs for {user.username}: {list(role_specs.values('id', 'title'))}")

            combined_queryset = (user_specs | role_specs).distinct().order_by('-created_at')
            logger.info(f"Combined specs for {user.username}: {list(combined_queryset.values('id', 'title'))}")
            return combined_queryset
        except AttributeError as e:
            logger.error(f"AttributeError in get_queryset for user {user.username}: {str(e)}", exc_info=True)
            return Specification.objects.none()
        except Exception as e:
            logger.error(f"Unexpected error in get_queryset for user {user.username}: {str(e)}", exc_info=True)
            return Specification.objects.none()

    def perform_create(self, serializer):
        try:
            procurement_plan_id = self.request.data.get('procurement_plan')
            plan = ProcurementPlan.objects.get(id=procurement_plan_id)
            serializer.save(procurement_plan=plan)
            logger.info(f"Created specification for user {self.request.user.username} with plan {procurement_plan_id}")
        except ProcurementPlan.DoesNotExist:
            logger.error(f"ProcurementPlan with id {procurement_plan_id} does not exist")
            raise
        except Exception as e:
            logger.error(f"Error in perform_create: {str(e)}", exc_info=True)
            raise

class SpecificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Specification.objects.all()
    serializer_class = SpecificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not user.role:
            logger.warning(f"User {user.username if user.is_authenticated else 'anonymous'} has no role, returning empty queryset")
            return Specification.objects.none()

        try:
            # Removed created_by filter since it's not a field
            user_specs = Specification.objects.filter()  # No created_by filter

            allowed_roles = user.get_allowed_roles()
            allowed_role_ids = [role.id for role in allowed_roles]
            logger.debug(f"Allowed role IDs for {user.username}: {allowed_role_ids}")

            role_specs = Specification.objects.filter(procurement_plan__owner__isnull=False, procurement_plan__owner__role__id__in=allowed_role_ids)
            logger.debug(f"Role specs for {user.username}: {list(role_specs.values('id', 'title'))}")

            combined_queryset = (user_specs | role_specs).distinct()
            logger.info(f"Combined specs for {user.username}: {list(combined_queryset.values('id', 'title'))}")
            return combined_queryset
        except AttributeError as e:
            logger.error(f"AttributeError in get_queryset for user {user.username}: {str(e)}", exc_info=True)
            return Specification.objects.none()
        except Exception as e:
            logger.error(f"Unexpected error in get_queryset for user {user.username}: {str(e)}", exc_info=True)
            return Specification.objects.none()

    def get(self, request, *args, **kwargs):
        if not request.user.role:
            return Response(
                {'error': 'User must have a role to view specifications.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().get(request, *args, **kwargs)