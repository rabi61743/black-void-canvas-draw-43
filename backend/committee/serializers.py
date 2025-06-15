# committee/serializers.py
from rest_framework import serializers
from django.conf import settings
from .models import Committee, CommitteeMembership
from users.models import CustomUser
from procurement.models import ProcurementPlan
import logging

logger = logging.getLogger(__name__)

class CommitteeMemberSerializer(serializers.ModelSerializer):
    employeeId = serializers.CharField(source='employee_id')
    name = serializers.CharField(source='username')
    role = serializers.SerializerMethodField()
    email = serializers.EmailField()
    department = serializers.SerializerMethodField()
    designation = serializers.SerializerMethodField()
    _id = serializers.CharField(source='employee_id')

    class Meta:
        model = CustomUser
        fields = ['_id', 'employeeId', 'name', 'role', 'email', 'department', 'designation']

    def get_role(self, obj):
        membership = CommitteeMembership.objects.filter(
            user=obj, committee=self.context['committee']
        ).first()
        return membership.committee_role if membership else 'member'

    def get_department(self, obj):
        return getattr(obj, 'department', None)

    def get_designation(self, obj):
        return getattr(obj, 'designation', None)

class CommitteeSerializer(serializers.ModelSerializer):
    _id = serializers.CharField(source='id', read_only=True)
    createdBy = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    formationLetterURL = serializers.SerializerMethodField()
    membersList = serializers.SerializerMethodField()
    procurement_plan = serializers.PrimaryKeyRelatedField(
        queryset=ProcurementPlan.objects.all(),
        required=False,
        allow_null=True
    )
    formation_date = serializers.DateField(required=False, allow_null=True, input_formats=['%Y-%m-%d'])
    specification_submission_date = serializers.DateField(required=False, allow_null=True, input_formats=['%Y-%m-%d'])
    review_date = serializers.DateField(required=False, allow_null=True, input_formats=['%Y-%m-%d'])
    should_notify = serializers.BooleanField(required=False)
    members = serializers.JSONField(required=False, default=[])
    formation_letter = serializers.FileField(required=False, allow_null=True)
    committee_type = serializers.ChoiceField(choices=Committee.COMMITTEE_TYPES, required=True)
    approvalStatus = serializers.CharField(source='approval_status', required=False)
    deadline = serializers.DateField(required=False, allow_null=True, input_formats=['%Y-%m-%d'])

    class Meta:
        model = Committee
        fields = [
            '_id', 'name', 'purpose', 'committee_type', 'procurement_plan',
            'formation_date', 'specification_submission_date', 'review_date',
            'schedule', 'should_notify', 'formation_letter', 'formationLetterURL',
            'createdBy', 'createdAt', 'updatedAt', 'members', 'membersList',
            'approvalStatus', 'deadline'  # Added 'deadline'
        ]
        read_only_fields = [
            '_id', 'createdBy', 'createdAt', 'updatedAt',
            'formationLetterURL', 'membersList'
        ]

    def get_createdBy(self, obj):
        user = obj.created_by
        if not user:
            return None
        return {
            '_id': user.employee_id,
            'name': user.username,
            'email': user.email,
            'role': user.role.role_name if hasattr(user, 'role') and user.role else 'member',
            'employeeId': user.employee_id
        }

    def get_formationLetterURL(self, obj):
        if obj.formation_letter:
            return f'{settings.MEDIA_URL}{obj.formation_letter.name}'
        return None

    def get_membersList(self, obj):
        memberships = obj.memberships.all()
        return CommitteeMemberSerializer(
            [membership.user for membership in memberships],
            many=True,
            context={'committee': obj}
        ).data

    def validate_members(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Members must be a list.")
        valid_roles = [r[0] for r in CommitteeMembership.COMMITTEE_ROLES]
        employee_ids = []
        normalized_members = []

        for member in value:
            if isinstance(member, str):
                employee_id = member
                role = 'member'
                normalized_members.append({'employeeId': employee_id, 'role': role})
            elif isinstance(member, dict):
                employee_id = member.get('employeeId')
                role = member.get('role', 'member')
                normalized_members.append({'employeeId': employee_id, 'role': role})
            else:
                raise serializers.ValidationError("Each member must be a string or an object with employeeId.")

            if not employee_id:
                raise serializers.ValidationError("Each member must have an employeeId.")
            if role not in valid_roles:
                raise serializers.ValidationError(f"Invalid role: {role}. Must be one of {valid_roles}.")
            if not CustomUser.objects.filter(employee_id=employee_id).exists():
                raise serializers.ValidationError(f"User with employee_id {employee_id} not found.")
            employee_ids.append(employee_id)

        if len(employee_ids) != len(set(employee_ids)):
            raise serializers.ValidationError("Duplicate employee IDs are not allowed.")
        return normalized_members

    def validate_procurement_plan(self, value):
        if value and not ProcurementPlan.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Invalid procurement plan ID.")
        return value

    def create(self, validated_data):
        members = validated_data.pop('members', [])
        formation_letter = validated_data.pop('formation_letter', None)
        committee = Committee.objects.create(
            **validated_data,
            formation_letter=formation_letter,
            created_by=self.context['request'].user
        )
        for member in members:
            user = CustomUser.objects.get(employee_id=member['employeeId'])
            CommitteeMembership.objects.create(
                committee=committee,
                user=user,
                committee_role=member.get('role', 'member')
            )
        return committee

    def update(self, instance, validated_data):
        logger.debug(f"Updating committee with validated data: {validated_data}")
        members = validated_data.pop('members', None)
        formation_letter = validated_data.pop('formation_letter', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if formation_letter is not None:
            instance.formation_letter = formation_letter

        instance.save()

        if members is not None:
            CommitteeMembership.objects.filter(committee=instance).delete()
            for member in members:
                user = CustomUser.objects.get(employee_id=member['employeeId'])
                CommitteeMembership.objects.create(
                    committee=instance,
                    user=user,
                    committee_role=member.get('role', 'member')
                )
            logger.debug(f"Members updated: {[m['employeeId'] for m in members]}")

        return instance


# from rest_framework import serializers
# from django.conf import settings
# from .models import Committee, CommitteeMembership
# from users.models import CustomUser
# from procurement.models import ProcurementPlan
# import logging

# logger = logging.getLogger(__name__)

# class CommitteeMemberSerializer(serializers.ModelSerializer):
#     """Serializer for committee members, providing detailed user information."""
#     employeeId = serializers.CharField(source='employee_id')
#     name = serializers.CharField(source='username')
#     role = serializers.SerializerMethodField()
#     email = serializers.EmailField()
#     department = serializers.SerializerMethodField()
#     designation = serializers.SerializerMethodField()
#     _id = serializers.CharField(source='employee_id')

#     class Meta:
#         model = CustomUser
#         fields = ['_id', 'employeeId', 'name', 'role', 'email', 'department', 'designation']

#     def get_role(self, obj):
#         """Retrieve the role of the member within the committee."""
#         membership = CommitteeMembership.objects.filter(
#             user=obj, committee=self.context['committee']
#         ).first()
#         return membership.committee_role if membership else 'member'

#     def get_department(self, obj):
#         """Retrieve the user's department, if available."""
#         return getattr(obj, 'department', None)

#     def get_designation(self, obj):
#         """Retrieve the user's designation, if available."""
#         return getattr(obj, 'designation', None)

# class CommitteeSerializer(serializers.ModelSerializer):
#     """Serializer for the Committee model, handling creation and updates."""
#     _id = serializers.CharField(source='id', read_only=True)
#     createdBy = serializers.SerializerMethodField()
#     createdAt = serializers.DateTimeField(source='created_at', read_only=True)
#     updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
#     formationLetterURL = serializers.SerializerMethodField()
#     membersList = serializers.SerializerMethodField()
#     procurement_plan = serializers.PrimaryKeyRelatedField(
#         queryset=ProcurementPlan.objects.all(),
#         required=False,
#         allow_null=True
#     )
#     formation_date = serializers.DateField(required=False, allow_null=True, input_formats=['%Y-%m-%d'])
#     specification_submission_date = serializers.DateField(required=False, allow_null=True, input_formats=['%Y-%m-%d'])
#     review_date = serializers.DateField(required=False, allow_null=True, input_formats=['%Y-%m-%d'])
#     should_notify = serializers.BooleanField(required=False)
#     members = serializers.JSONField(required=False, default=[])
#     formation_letter = serializers.FileField(required=False, allow_null=True)
#     committee_type = serializers.ChoiceField(choices=Committee.COMMITTEE_TYPES, required=True)
#     approvalStatus = serializers.CharField(source='approval_status', required=False)
#     deadline = serializers.DateField(required=False, allow_null=True, input_formats=['%Y-%m-%d'])

#     class Meta:
#         model = Committee
#         fields = [
#             '_id', 'name', 'purpose', 'committee_type', 'procurement_plan',
#             'formation_date', 'specification_submission_date', 'review_date',
#             'schedule', 'should_notify', 'formation_letter', 'formationLetterURL',
#             'createdBy', 'createdAt', 'updatedAt', 'members', 'membersList',
#             'approvalStatus'
#         ]
#         read_only_fields = [
#             '_id', 'createdBy', 'createdAt', 'updatedAt',
#             'formationLetterURL', 'membersList'
#         ]

#     def get_createdBy(self, obj):
#         """Return detailed information about the committee creator."""
#         user = obj.created_by
#         if not user:
#             return None
#         return {
#             '_id': user.employee_id,
#             'name': user.username,
#             'email': user.email,
#             'role': user.role.role_name if hasattr(user, 'role') and user.role else 'member',
#             'employeeId': user.employee_id
#         }

#     def get_formationLetterURL(self, obj):
#         """Generate the URL for the formation letter file, if it exists."""
#         if obj.formation_letter:
#             return f'{settings.MEDIA_URL}{obj.formation_letter.name}'
#         return None

#     def get_membersList(self, obj):
#         """Serialize the list of committee members."""
#         memberships = obj.memberships.all()
#         return CommitteeMemberSerializer(
#             [membership.user for membership in memberships],
#             many=True,
#             context={'committee': obj}
#         ).data

#     def validate_members(self, value):
#         """Validate that the members list contains valid employee IDs and roles."""
#         if not isinstance(value, list):
#             raise serializers.ValidationError("Members must be a list.")
#         valid_roles = [r[0] for r in CommitteeMembership.COMMITTEE_ROLES]
#         employee_ids = []
#         normalized_members = []

#         for member in value:
#             if isinstance(member, str):
#                 # Handle list of employee IDs (e.g., ["EMP004", "EMP006"])
#                 employee_id = member
#                 role = 'member'
#                 normalized_members.append({'employeeId': employee_id, 'role': role})
#             elif isinstance(member, dict):
#                 # Handle list of objects (e.g., [{"employeeId": "EMP004", "role": "member"}])
#                 employee_id = member.get('employeeId')
#                 role = member.get('role', 'member')
#                 normalized_members.append({'employeeId': employee_id, 'role': role})
#             else:
#                 raise serializers.ValidationError("Each member must be a string or an object with employeeId.")

#             if not employee_id:
#                 raise serializers.ValidationError("Each member must have an employeeId.")
#             if role not in valid_roles:
#                 raise serializers.ValidationError(f"Invalid role: {role}. Must be one of {valid_roles}.")
#             if not CustomUser.objects.filter(employee_id=employee_id).exists():
#                 raise serializers.ValidationError(f"User with employee_id {employee_id} not found.")
#             employee_ids.append(employee_id)

#         if len(employee_ids) != len(set(employee_ids)):
#             raise serializers.ValidationError("Duplicate employee IDs are not allowed.")
#         return normalized_members

#     def validate_procurement_plan(self, value):
#         """Validate that the procurement plan exists, if provided."""
#         if value and not ProcurementPlan.objects.filter(id=value.id).exists():
#             raise serializers.ValidationError("Invalid procurement plan ID.")
#         return value

#     def create(self, validated_data):
#         """Create a new committee with memberships."""
#         members = validated_data.pop('members', [])
#         formation_letter = validated_data.pop('formation_letter', None)
#         committee = Committee.objects.create(
#             **validated_data,
#             formation_letter=formation_letter,
#             created_by=self.context['request'].user
#         )
#         for member in members:
#             user = CustomUser.objects.get(employee_id=member['employeeId'])
#             CommitteeMembership.objects.create(
#                 committee=committee,
#                 user=user,
#                 committee_role=member.get('role', 'member')
#             )
#         return committee

#     def update(self, instance, validated_data):
#         """Update an existing committee instance and its memberships."""
#         logger.debug(f"Updating committee with validated data: {validated_data}")
#         members = validated_data.pop('members', None)
#         formation_letter = validated_data.pop('formation_letter', None)

#         # Update instance fields
#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)

#         if formation_letter is not None:
#             instance.formation_letter = formation_letter

#         instance.save()

#         # Update memberships if provided
#         if members is not None:
#             CommitteeMembership.objects.filter(committee=instance).delete()
#             for member in members:
#                 user = CustomUser.objects.get(employee_id=member['employeeId'])
#                 CommitteeMembership.objects.create(
#                     committee=instance,
#                     user=user,
#                     committee_role=member.get('role', 'member')
#                 )
#             logger.debug(f"Members updated: {[m['employeeId'] for m in members]}")

#         return instance



