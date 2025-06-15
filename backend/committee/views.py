# committee/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .permissions import CommitteePermission
from .models import Committee, CommitteeMembership
from .serializers import CommitteeSerializer
from users.models import CustomUser
from procurement.models import ProcurementPlan
from django.core.exceptions import ObjectDoesNotExist
from django.utils.dateparse import parse_date
from django.http import HttpResponse
from django.conf import settings
import os
import json
import logging
from django.db import models

logger = logging.getLogger(__name__)

class CreateCommitteeView(APIView):
    permission_classes = [CommitteePermission]

    def post(self, request):
        logger.debug(f"CreateCommitteeView called with data: {dict(request.data)}")
        logger.debug(f"Authenticated user: {request.user}")

        serializer_data = {
            'name': request.data.get('name'),
            'purpose': request.data.get('purpose'),
            'committee_type': request.data.get('committee_type'),
            'procurement_plan': request.data.get('procurement_plan'),
            'formation_date': request.data.get('formation_date'),
            'deadline': request.data.get('deadline'),  # Updated to use deadline
            'should_notify': request.data.get('should_notify') == 'true',
            'members': json.loads(request.data.get('members', '[]')),
            'formation_letter': request.FILES.get('formation_letter'),
            'approval_status': request.data.get('approval_status', 'active'),
        }

        logger.debug(f"Serializer data: {serializer_data}")
        serializer = CommitteeSerializer(data=serializer_data, context={'request': request})
        if serializer.is_valid():
            try:
                committee = serializer.save()
                if committee.procurement_plan:
                    procurement_plan = committee.procurement_plan
                    procurement_plan.committee = committee
                    procurement_plan.save()
                    logger.debug(f"Updated ProcurementPlan {procurement_plan.id} with committee {committee.id}")
                logger.debug(f"Committee created: {committee.id}")
                return Response(
                    {"status": "success", "data": {"committee": CommitteeSerializer(committee).data}},
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                logger.error(f"Failed to save committee: {str(e)}")
                return Response(
                    {"status": "error", "message": f"Failed to save committee: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        logger.error(f"Serializer errors: {serializer.errors}")
        return Response(
            {"status": "error", "message": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

class UpdateCommitteeView(APIView):
    permission_classes = [CommitteePermission]

    def patch(self, request, committee_id):
        logger.debug(f"UpdateCommitteeView called with committee_id: {committee_id}, data: {dict(request.data)}")
        logger.debug(f"Authenticated user: {request.user}")

        try:
            committee = Committee.objects.get(id=committee_id)
        except Committee.DoesNotExist:
            logger.error(f"Committee not found: {committee_id}")
            return Response(
                {"status": "error", "message": "Committee not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        self.check_object_permissions(request, committee)

        serializer_data = {
            'name': request.data.get('name'),
            'purpose': request.data.get('purpose'),
            'committee_type': request.data.get('committee_type'),
            'procurement_plan': request.data.get('procurement_plan'),
            'formation_date': request.data.get('formation_date'),
            'deadline': request.data.get('deadline'),  # Updated to use deadline
            'should_notify': request.data.get('should_notify') == 'true' if request.data.get('should_notify') else None,
            'members': json.loads(request.data.get('members', '[]')),
            'formation_letter': request.FILES.get('formation_letter'),
            'approval_status': request.data.get('approval_status'),
        }

        logger.debug(f"Serializer data: {serializer_data}")
        serializer = CommitteeSerializer(
            instance=committee,
            data=serializer_data,
            partial=True,
            context={'request': request}
        )

        if serializer.is_valid():
            try:
                committee = serializer.save()
                if 'procurement_plan' in serializer.validated_data and committee.procurement_plan:
                    procurement_plan = committee.procurement_plan
                    procurement_plan.committee = committee
                    procurement_plan.save()
                    logger.debug(f"Updated ProcurementPlan {procurement_plan.id} with committee {committee.id}")
                logger.debug(f"Committee updated: {committee.id}")
                return Response(
                    {"status": "success", "data": {"committee": CommitteeSerializer(committee).data}},
                    status=status.HTTP_200_OK
                )
            except Exception as e:
                logger.error(f"Failed to update committee: {str(e)}")
                return Response(
                    {"status": "error", "message": f"Failed to update committee: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        logger.error(f"Serializer errors: {serializer.errors}")
        return Response(
            {"status": "error", "message": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

class GetAllCommitteesView(APIView):
    permission_classes = [CommitteePermission]

    def get(self, request):
        try:
            if request.user.role and request.user.role.role_name == 'SUPERADMIN':
                committees = Committee.objects.all()
            else:
                committees = Committee.objects.filter(
                    models.Q(created_by=request.user) |
                    models.Q(memberships__user=request.user) |
                    models.Q(created_by__role__in=request.user.role.get_all_descendants())
                ).distinct()

            serializer = CommitteeSerializer(committees, many=True, context={'request': request})
            logger.debug(f"Fetched committees: {len(serializer.data)}")
            return Response(
                {
                    "status": "success",
                    "results": len(serializer.data),
                    "data": {"committees": serializer.data}
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Failed to fetch committees: {str(e)}")
            return Response(
                {
                    "status": "error",
                    "message": f"Failed to fetch committees: {str(e)}"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class GetCommitteeByIdView(APIView):
    permission_classes = [CommitteePermission]

    def get(self, request, committee_id):
        try:
            committee = Committee.objects.get(id=committee_id)
            self.check_object_permissions(request, committee)
            serializer = CommitteeSerializer(committee, context={'request': request})
            logger.debug(f"Fetched committee with ID: {committee.id}")
            return Response(
                {"status": "success", "data": {"committee": serializer.data}},
                status=status.HTTP_200_OK
            )
        except ObjectDoesNotExist:
            logger.error(f"Committee with ID {committee_id} not found")
            return Response(
                {"status": "error", "message": "Committee not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.exception(f"An unexpected error occurred while fetching committee with ID {committee_id}: {str(e)}")
            return Response(
                {"status": "error", "message": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DeleteCommitteeView(APIView):
    permission_classes = [CommitteePermission]

    def delete(self, request, committee_id):
        try:
            committee = Committee.objects.get(id=committee_id)
            self.check_object_permissions(request, committee)
            committee.delete()
            logger.debug(f"Committee deleted: {committee_id}")
            return Response(
                {"status": "success", "message": "Committee deleted successfully"},
                status=status.HTTP_200_OK
            )
        except ObjectDoesNotExist:
            logger.error(f"Committee {committee_id} not found")
            return Response(
                {"status": "error", "message": "Committee not found"},
                status=status.HTTP_404_NOT_FOUND
            )

class AddMemberView(APIView):
    permission_classes = [CommitteePermission]

    def post(self, request, committee_id):
        try:
            committee = Committee.objects.get(id=committee_id)
            self.check_object_permissions(request, committee)

            employee_id = request.data.get('employeeId')
            committee_role = request.data.get('committeeRole', 'member')
            valid_roles = [r[0] for r in CommitteeMembership.COMMITTEE_ROLES]
            if committee_role not in valid_roles:
                logger.error(f"Invalid role: {committee_role}")
                return Response(
                    {"status": "error", "message": f"Invalid role: {committee_role}. Must be one of {valid_roles}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                user = CustomUser.objects.get(employee_id=employee_id)
            except CustomUser.DoesNotExist:
                logger.error(f"User {employee_id} not found")
                return Response(
                    {"status": "error", "message": "User not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            if CommitteeMembership.objects.filter(committee=committee, user=user).exists():
                logger.error(f"User {employee_id} is already a member of committee {committee_id}")
                return Response(
                    {"status": "error", "message": "User is already a member of this committee"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            CommitteeMembership.objects.create(committee=committee, user=user, committee_role=committee_role)
            serializer = CommitteeSerializer(committee, context={'request': request})
            logger.debug(f"Member {employee_id} added to committee {committee_id}")
            return Response(
                {"status": "success", "data": {"committee": serializer.data}},
                status=status.HTTP_200_OK
            )
        except ObjectDoesNotExist:
            logger.error(f"Committee {committee_id} not found")
            return Response(
                {"status": "error", "message": "Committee not found"},
                status=status.HTTP_404_NOT_FOUND
            )

class RemoveMemberView(APIView):
    permission_classes = [CommitteePermission]

    def delete(self, request, committee_id, employee_id):
        logger.debug(f"RemoveMemberView called with committee_id: {committee_id}, employee_id: {employee_id}")
        try:
            committee = Committee.objects.get(id=committee_id)
            self.check_object_permissions(request, committee)
            try:
                user = CustomUser.objects.get(employee_id=employee_id)
            except CustomUser.DoesNotExist:
                logger.error(f"User {employee_id} not found")
                return Response(
                    {"status": "error", "message": "User not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            membership = CommitteeMembership.objects.filter(committee=committee, user=user).first()
            if not membership:
                logger.error(f"User {employee_id} is not a member of committee {committee_id}")
                return Response(
                    {"status": "error", "message": "User is not a member of this committee"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            membership.delete()
            serializer = CommitteeSerializer(committee, context={'request': request})
            logger.debug(f"Member {employee_id} removed from committee {committee_id}")
            return Response(
                {"status": "success", "data": {"committee": serializer.data}},
                status=status.HTTP_200_OK
            )
        except Committee.DoesNotExist:
            logger.error(f"Committee {committee_id} not found")
            return Response(
                {"status": "error", "message": "Committee not found"},
                status=status.HTTP_404_NOT_FOUND
            )

class GetCommitteesByMemberView(APIView):
    permission_classes = [CommitteePermission]

    def get(self, request, employee_id):
        try:
            user = CustomUser.objects.get(employee_id=employee_id)
            memberships = CommitteeMembership.objects.filter(user=user)
            committees = [membership.committee for membership in memberships]
            serializer = CommitteeSerializer(committees, many=True, context={'request': request})
            logger.debug(f"Fetched {len(committees)} committees for user {employee_id}")
            return Response(
                {
                    "status": "success",
                    "results": len(serializer.data),
                    "data": {"committees": serializer.data}
                },
                status=status.HTTP_200_OK
            )
        except CustomUser.DoesNotExist:
            logger.error(f"User {employee_id} not found")
            return Response(
                {"status": "error", "message": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

class GetCommitteesByDateRangeView(APIView):
    permission_classes = [CommitteePermission]

    def get(self, request):
        start_date = request.query_params.get('startDate')
        end_date = request.query_params.get('endDate')

        if not start_date or not end_date:
            logger.error("Missing startDate or endDate")
            return Response(
                {"status": "error", "message": "startDate and endDate are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        start_date = parse_date(start_date)
        end_date = parse_date(end_date)

        if not start_date or not end_date:
            logger.error("Invalid date format")
            return Response(
                {"status": "error", "message": "Invalid date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )

        committees = Committee.objects.filter(formation_date__range=[start_date, end_date])
        if not (request.user.role and request.user.role.role_name == 'SUPERADMIN'):
            committees = committees.filter(
                models.Q(created_by=request.user) |
                models.Q(memberships__user=request.user) |
                models.Q(created_by__role__in=request.user.role.get_all_descendants())
            ).distinct()

        serializer = CommitteeSerializer(committees, many=True, context={'request': request})
        logger.debug(f"Fetched {len(committees)} committees in date range")
        return Response(
            {
                "status": "success",
                "results": len(serializer.data),
                "data": {"committees": serializer.data}
            },
            status=status.HTTP_200_OK
        )

class DownloadFormationLetterView(APIView):
    permission_classes = [CommitteePermission]

    def get(self, request, committee_id):
        try:
            committee = Committee.objects.get(id=committee_id)
            self.check_object_permissions(request, committee)

            if not committee.formation_letter:
                logger.error(f"No formation letter for committee {committee_id}")
                return Response(
                    {"status": "error", "message": "No formation letter available"},
                    status=status.HTTP_404_NOT_FOUND
                )
            file_path = os.path.join(settings.MEDIA_ROOT, committee.formation_letter.name)
            with open(file_path, 'rb') as f:
                response = HttpResponse(f.read(), content_type=committee.formation_letter.file.content_type)
                response['Content-Disposition'] = f'attachment; filename="{committee.formation_letter.name.split("/")[-1]}"'
                logger.debug(f"Formation letter downloaded for committee {committee_id}")
                return response
        except ObjectDoesNotExist:
            logger.error(f"Committee {committee_id} not found")
            return Response(
                {"status": "error", "message": "Committee not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except FileNotFoundError:
            logger.error(f"Formation letter file not found for committee {committee_id}")
            return Response(
                {"status": "error", "message": "Formation letter file not found"},
                status=status.HTTP_404_NOT_FOUND
            )


# # committee/views.py
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from .permissions import CommitteePermission
# from .models import Committee, CommitteeMembership
# from .serializers import CommitteeSerializer
# from users.models import CustomUser
# from procurement.models import ProcurementPlan
# from django.core.exceptions import ObjectDoesNotExist
# from django.utils.dateparse import parse_date
# from django.http import HttpResponse
# from django.conf import settings
# import os
# import json
# import logging
# from django.db import models

# logger = logging.getLogger(__name__)


# class CreateCommitteeView(APIView):
#     permission_classes = [CommitteePermission]

#     def post(self, request):
#         logger.debug(f"CreateCommitteeView called with data: {dict(request.data)}")
#         logger.debug(f"Authenticated user: {request.user}")

#         serializer_data = {
#             'name': request.data.get('name'),
#             'purpose': request.data.get('purpose'),
#             'committee_type': request.data.get('committee_type'),
#             'procurement_plan': request.data.get('procurement_plan'),
#             'formation_date': request.data.get('formation_date'),
#             'specification_submission_date': request.data.get('specification_submission_date'),
#             'review_date': request.data.get('review_date'),
#             'schedule': request.data.get('schedule'),
#             'should_notify': request.data.get('should_notify') == 'true',
#             'members': json.loads(request.data.get('members', '[]')),
#             'formation_letter': request.FILES.get('formation_letter'),
#             'approval_status': request.data.get('approval_status', 'active'),
#         }

#         logger.debug(f"Serializer data: {serializer_data}")
#         serializer = CommitteeSerializer(data=serializer_data, context={'request': request})
#         if serializer.is_valid():
#             try:
#                 committee = serializer.save()
#                 if committee.procurement_plan:
#                     procurement_plan = committee.procurement_plan
#                     if procurement_plan.stage != 'tender':
#                         return Response(
#                             {"status": "error", "message": "Tender must be created before forming a committee."},
#                             status=status.HTTP_400_BAD_REQUEST
#                         )
#                     procurement_plan.committee = committee
#                     procurement_plan.stage = 'committee'  # Update the stage
#                     procurement_plan.save()
#                     logger.debug(f"Updated ProcurementPlan {procurement_plan.id} with committee {committee.id}")
#                 logger.debug(f"Committee created: {committee.id}")
#                 return Response(
#                     {"status": "success", "data": {"committee": CommitteeSerializer(committee).data}},
#                     status=status.HTTP_201_CREATED
#                 )
#             except Exception as e:
#                 logger.error(f"Failed to save committee: {str(e)}")
#                 return Response(
#                     {"status": "error", "message": f"Failed to save committee: {str(e)}"},
#                     status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                 )
#         logger.error(f"Serializer errors: {serializer.errors}")
#         return Response(
#             {"status": "error", "message": serializer.errors},
#             status=status.HTTP_400_BAD_REQUEST
#         )

# class UpdateCommitteeView(APIView):
#     permission_classes = [CommitteePermission]

#     def patch(self, request, committee_id):
#         logger.debug(f"UpdateCommitteeView called with committee_id: {committee_id}, data: {dict(request.data)}")
#         logger.debug(f"Authenticated user: {request.user}")

#         try:
#             committee = Committee.objects.get(id=committee_id)
#         except Committee.DoesNotExist:
#             logger.error(f"Committee not found: {committee_id}")
#             return Response(
#                 {"status": "error", "message": "Committee not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         self.check_object_permissions(request, committee)

#         serializer_data = {
#             'name': request.data.get('name'),
#             'purpose': request.data.get('purpose'),
#             'committee_type': request.data.get('committee_type'),
#             'procurement_plan': request.data.get('procurement_plan'),
#             'formation_date': request.data.get('formation_date'),
#             'specification_submission_date': request.data.get('specification_submission_date'),
#             'review_date': request.data.get('review_date'),
#             'schedule': request.data.get('schedule'),
#             'should_notify': request.data.get('should_notify') == 'true' if request.data.get('should_notify') else None,
#             'members': json.loads(request.data.get('members', '[]')),
#             'formation_letter': request.FILES.get('formation_letter'),
#             'approval_status': request.data.get('approval_status'),
#         }

#         logger.debug(f"Serializer data: {serializer_data}")
#         serializer = CommitteeSerializer(
#             instance=committee,
#             data=serializer_data,
#             partial=True,
#             context={'request': request}
#         )

#         if serializer.is_valid():
#             try:
#                 committee = serializer.save()
#                 if 'procurement_plan' in serializer.validated_data and committee.procurement_plan:
#                     procurement_plan = committee.procurement_plan
#                     if procurement_plan.stage != 'tender':
#                         return Response(
#                             {"status": "error", "message": "Tender must be created before forming a committee."},
#                             status=status.HTTP_400_BAD_REQUEST
#                         )
#                     procurement_plan.committee = committee
#                     procurement_plan.stage = 'committee'  # Update the stage
#                     procurement_plan.save()
#                     logger.debug(f"Updated ProcurementPlan {procurement_plan.id} with committee {committee.id}")
#                 logger.debug(f"Committee updated: {committee.id}")
#                 return Response(
#                     {"status": "success", "data": {"committee": CommitteeSerializer(committee).data}},
#                     status=status.HTTP_200_OK
#                 )
#             except Exception as e:
#                 logger.error(f"Failed to update committee: {str(e)}")
#                 return Response(
#                     {"status": "error", "message": f"Failed to update committee: {str(e)}"},
#                     status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                 )
#         logger.error(f"Serializer errors: {serializer.errors}")
#         return Response(
#             {"status": "error", "message": serializer.errors},
#             status=status.HTTP_400_BAD_REQUEST
#         )

# # committee/views.py (only the CreateCommitteeView class is changed)
# # class CreateCommitteeView(APIView):
# #     permission_classes = [CommitteePermission]

# #     def post(self, request):
# #         logger.debug(f"CreateCommitteeView called with data: {dict(request.data)}")
# #         logger.debug(f"Authenticated user: {request.user}")

# #         serializer_data = {
# #             'name': request.data.get('name'),
# #             'purpose': request.data.get('purpose'),
# #             'committee_type': request.data.get('committee_type'),
# #             'procurement_plan': request.data.get('procurement_plan'),
# #             'formation_date': request.data.get('formation_date'),
# #             'specification_submission_date': request.data.get('specification_submission_date'),
# #             'review_date': request.data.get('review_date'),
# #             'schedule': request.data.get('schedule'),
# #             'should_notify': request.data.get('should_notify') == 'true',
# #             'members': json.loads(request.data.get('members', '[]')),
# #             'formation_letter': request.FILES.get('formation_letter'),
# #             'approval_status': request.data.get('approval_status', 'active'),
# #         }

# #         logger.debug(f"Serializer data: {serializer_data}")
# #         serializer = CommitteeSerializer(data=serializer_data, context={'request': request})
# #         if serializer.is_valid():
# #             try:
# #                 committee = serializer.save()
# #                 if committee.procurement_plan:
# #                     procurement_plan = committee.procurement_plan
# #                     procurement_plan.committee = committee
# #                     procurement_plan.save()
# #                     logger.debug(f"Updated ProcurementPlan {procurement_plan.id} with committee {committee.id}")
# #                 logger.debug(f"Committee created: {committee.id}")
# #                 return Response(
# #                     {"status": "success", "data": {"committee": CommitteeSerializer(committee).data}},
# #                     status=status.HTTP_201_CREATED
# #                 )
# #             except Exception as e:
# #                 logger.error(f"Failed to save committee: {str(e)}")
# #                 return Response(
# #                     {"status": "error", "message": f"Failed to save committee: {str(e)}"},
# #                     status=status.HTTP_500_INTERNAL_SERVER_ERROR
# #                 )
# #         logger.error(f"Serializer errors: {serializer.errors}")
# #         return Response(
# #             {"status": "error", "message": serializer.errors},
# #             status=status.HTTP_400_BAD_REQUEST
# #         )

# # class UpdateCommitteeView(APIView):
# #     permission_classes = [CommitteePermission]

# #     def patch(self, request, committee_id):
# #         logger.debug(f"UpdateCommitteeView called with committee_id: {committee_id}, data: {dict(request.data)}")
# #         logger.debug(f"Authenticated user: {request.user}")

# #         try:
# #             committee = Committee.objects.get(id=committee_id)
# #         except Committee.DoesNotExist:
# #             logger.error(f"Committee not found: {committee_id}")
# #             return Response(
# #                 {"status": "error", "message": "Committee not found"},
# #                 status=status.HTTP_404_NOT_FOUND
# #             )

# #         self.check_object_permissions(request, committee)

# #         serializer_data = {
# #             'name': request.data.get('name'),
# #             'purpose': request.data.get('purpose'),
# #             'committee_type': request.data.get('committee_type'),
# #             'procurement_plan': request.data.get('procurement_plan'),
# #             'formation_date': request.data.get('formation_date'),
# #             'specification_submission_date': request.data.get('specification_submission_date'),
# #             'review_date': request.data.get('review_date'),
# #             'schedule': request.data.get('schedule'),
# #             'should_notify': request.data.get('should_notify') == 'true' if request.data.get('should_notify') else None,
# #             'members': json.loads(request.data.get('members', '[]')),
# #             'formation_letter': request.FILES.get('formation_letter'),
# #             'approval_status': request.data.get('approval_status'),
# #         }

# #         logger.debug(f"Serializer data: {serializer_data}")
# #         serializer = CommitteeSerializer(
# #             instance=committee,
# #             data=serializer_data,
# #             partial=True,
# #             context={'request': request}
# #         )

# #         if serializer.is_valid():
# #             try:
# #                 committee = serializer.save()
# #                 if 'procurement_plan' in serializer.validated_data and committee.procurement_plan:
# #                     procurement_plan = committee.procurement_plan
# #                     procurement_plan.committee = committee
# #                     procurement_plan.save()
# #                     logger.debug(f"Updated ProcurementPlan {procurement_plan.id} with committee {committee.id}")
# #                 logger.debug(f"Committee updated: {committee.id}")
# #                 return Response(
# #                     {"status": "success", "data": {"committee": CommitteeSerializer(committee).data}},
# #                     status=status.HTTP_200_OK
# #                 )
# #             except Exception as e:
# #                 logger.error(f"Failed to update committee: {str(e)}")
# #                 return Response(
# #                     {"status": "error", "message": f"Failed to update committee: {str(e)}"},
# #                     status=status.HTTP_500_INTERNAL_SERVER_ERROR
# #                 )
# #         logger.error(f"Serializer errors: {serializer.errors}")
# #         return Response(
# #             {"status": "error", "message": serializer.errors},
# #             status=status.HTTP_400_BAD_REQUEST
# #         )

# class GetAllCommitteesView(APIView):
#     permission_classes = [CommitteePermission]

#     def get(self, request):
#         try:
#             if request.user.role and request.user.role.role_name == 'SUPERADMIN':
#                 committees = Committee.objects.all()
#             else:
#                 committees = Committee.objects.filter(
#                     models.Q(created_by=request.user) |
#                     models.Q(memberships__user=request.user) |
#                     models.Q(created_by__role__in=request.user.role.get_all_descendants())
#                 ).distinct()

#             serializer = CommitteeSerializer(committees, many=True, context={'request': request})
#             logger.debug(f"Fetched committees: {len(serializer.data)}")
#             return Response(
#                 {
#                     "status": "success",
#                     "results": len(serializer.data),
#                     "data": {"committees": serializer.data}
#                 },
#                 status=status.HTTP_200_OK
#             )
#         except Exception as e:
#             logger.error(f"Failed to fetch committees: {str(e)}")
#             return Response(
#                 {
#                     "status": "error",
#                     "message": f"Failed to fetch committees: {str(e)}"
#                 },
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class GetCommitteeByIdView(APIView):
#     permission_classes = [CommitteePermission]

#     def get(self, request, committee_id):
#         try:
#             committee = Committee.objects.get(id=committee_id)
#             self.check_object_permissions(request, committee)
#             serializer = CommitteeSerializer(committee, context={'request': request})
#             logger.debug(f"Fetched committee with ID: {committee.id}")
#             return Response(
#                 {"status": "success", "data": {"committee": serializer.data}},
#                 status=status.HTTP_200_OK
#             )
#         except ObjectDoesNotExist:
#             logger.error(f"Committee with ID {committee_id} not found")
#             return Response(
#                 {"status": "error", "message": "Committee not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.exception(f"An unexpected error occurred while fetching committee with ID {committee_id}: {str(e)}")
#             return Response(
#                 {"status": "error", "message": "An unexpected error occurred"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class DeleteCommitteeView(APIView):
#     permission_classes = [CommitteePermission]

#     def delete(self, request, committee_id):
#         try:
#             committee = Committee.objects.get(id=committee_id)
#             self.check_object_permissions(request, committee)
#             committee.delete()
#             logger.debug(f"Committee deleted: {committee_id}")
#             return Response(
#                 {"status": "success", "message": "Committee deleted successfully"},
#                 status=status.HTTP_200_OK
#             )
#         except ObjectDoesNotExist:
#             logger.error(f"Committee {committee_id} not found")
#             return Response(
#                 {"status": "error", "message": "Committee not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )

# class AddMemberView(APIView):
#     permission_classes = [CommitteePermission]

#     def post(self, request, committee_id):
#         try:
#             committee = Committee.objects.get(id=committee_id)
#             self.check_object_permissions(request, committee)

#             employee_id = request.data.get('employeeId')
#             committee_role = request.data.get('committeeRole', 'member')
#             valid_roles = [r[0] for r in CommitteeMembership.COMMITTEE_ROLES]
#             if committee_role not in valid_roles:
#                 logger.error(f"Invalid role: {committee_role}")
#                 return Response(
#                     {"status": "error", "message": f"Invalid role: {committee_role}. Must be one of {valid_roles}"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             try:
#                 user = CustomUser.objects.get(employee_id=employee_id)
#             except CustomUser.DoesNotExist:
#                 logger.error(f"User {employee_id} not found")
#                 return Response(
#                     {"status": "error", "message": "User not found"},
#                     status=status.HTTP_404_NOT_FOUND
#                 )

#             if CommitteeMembership.objects.filter(committee=committee, user=user).exists():
#                 logger.error(f"User {employee_id} is already a member of committee {committee_id}")
#                 return Response(
#                     {"status": "error", "message": "User is already a member of this committee"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             CommitteeMembership.objects.create(committee=committee, user=user, committee_role=committee_role)
#             serializer = CommitteeSerializer(committee, context={'request': request})
#             logger.debug(f"Member {employee_id} added to committee {committee_id}")
#             return Response(
#                 {"status": "success", "data": {"committee": serializer.data}},
#                 status=status.HTTP_200_OK
#             )
#         except ObjectDoesNotExist:
#             logger.error(f"Committee {committee_id} not found")
#             return Response(
#                 {"status": "error", "message": "Committee not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )


# # committee/views.py
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from .models import Committee, CommitteeMembership
# from users.models import CustomUser
# from .serializers import CommitteeSerializer
# from .permissions import CommitteePermission
# import logging

# logger = logging.getLogger(__name__)

# class RemoveMemberView(APIView):
#     permission_classes = [CommitteePermission]

#     def delete(self, request, committee_id, employee_id):
#         logger.debug(f"RemoveMemberView called with committee_id: {committee_id}, employee_id: {employee_id}")
#         try:
#             committee = Committee.objects.get(id=committee_id)
#             self.check_object_permissions(request, committee)
#             try:
#                 user = CustomUser.objects.get(employee_id=employee_id)
#             except CustomUser.DoesNotExist:
#                 logger.error(f"User {employee_id} not found")
#                 return Response(
#                     {"status": "error", "message": "User not found"},
#                     status=status.HTTP_404_NOT_FOUND
#                 )
#             membership = CommitteeMembership.objects.filter(committee=committee, user=user).first()
#             if not membership:
#                 logger.error(f"User {employee_id} is not a member of committee {committee_id}")
#                 return Response(
#                     {"status": "error", "message": "User is not a member of this committee"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
#             membership.delete()
#             serializer = CommitteeSerializer(committee, context={'request': request})
#             logger.debug(f"Member {employee_id} removed from committee {committee_id}")
#             return Response(
#                 {"status": "success", "data": {"committee": serializer.data}},
#                 status=status.HTTP_200_OK
#             )
#         except Committee.DoesNotExist:
#             logger.error(f"Committee {committee_id} not found")
#             return Response(
#                 {"status": "error", "message": "Committee not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )


# class GetCommitteesByMemberView(APIView):
#     permission_classes = [CommitteePermission]

#     def get(self, request, employee_id):
#         try:
#             user = CustomUser.objects.get(employee_id=employee_id)
#             memberships = CommitteeMembership.objects.filter(user=user)
#             committees = [membership.committee for membership in memberships]
#             serializer = CommitteeSerializer(committees, many=True, context={'request': request})
#             logger.debug(f"Fetched {len(committees)} committees for user {employee_id}")
#             return Response(
#                 {
#                     "status": "success",
#                     "results": len(serializer.data),
#                     "data": {"committees": serializer.data}
#                 },
#                 status=status.HTTP_200_OK
#             )
#         except CustomUser.DoesNotExist:
#             logger.error(f"User {employee_id} not found")
#             return Response(
#                 {"status": "error", "message": "User not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )

# class GetCommitteesByDateRangeView(APIView):
#     permission_classes = [CommitteePermission]

#     def get(self, request):
#         start_date = request.query_params.get('startDate')
#         end_date = request.query_params.get('endDate')

#         if not start_date or not end_date:
#             logger.error("Missing startDate or endDate")
#             return Response(
#                 {"status": "error", "message": "startDate and endDate are required"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         start_date = parse_date(start_date)
#         end_date = parse_date(end_date)

#         if not start_date or not end_date:
#             logger.error("Invalid date format")
#             return Response(
#                 {"status": "error", "message": "Invalid date format. Use YYYY-MM-DD"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         committees = Committee.objects.filter(formation_date__range=[start_date, end_date])
#         if not (request.user.role and request.user.role.role_name == 'SUPERADMIN'):
#             committees = committees.filter(
#                 models.Q(created_by=request.user) |
#                 models.Q(memberships__user=request.user) |
#                 models.Q(created_by__role__in=request.user.role.get_all_descendants())
#             ).distinct()

#         serializer = CommitteeSerializer(committees, many=True, context={'request': request})
#         logger.debug(f"Fetched {len(committees)} committees in date range")
#         return Response(
#             {
#                 "status": "success",
#                 "results": len(serializer.data),
#                 "data": {"committees": serializer.data}
#             },
#             status=status.HTTP_200_OK
#         )

# class DownloadFormationLetterView(APIView):
#     permission_classes = [CommitteePermission]

#     def get(self, request, committee_id):
#         try:
#             committee = Committee.objects.get(id=committee_id)
#             self.check_object_permissions(request, committee)

#             if not committee.formation_letter:
#                 logger.error(f"No formation letter for committee {committee_id}")
#                 return Response(
#                     {"status": "error", "message": "No formation letter available"},
#                     status=status.HTTP_404_NOT_FOUND
#                 )
#             file_path = os.path.join(settings.MEDIA_ROOT, committee.formation_letter.name)
#             with open(file_path, 'rb') as f:
#                 response = HttpResponse(f.read(), content_type=committee.formation_letter.file.content_type)
#                 response['Content-Disposition'] = f'attachment; filename="{committee.formation_letter.name.split("/")[-1]}"'
#                 logger.debug(f"Formation letter downloaded for committee {committee_id}")
#                 return response
#         except ObjectDoesNotExist:
#             logger.error(f"Committee {committee_id} not found")
#             return Response(
#                 {"status": "error", "message": "Committee not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except FileNotFoundError:
#             logger.error(f"Formation letter file not found for committee {committee_id}")
#             return Response(
#                 {"status": "error", "message": "Formation letter file not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )

