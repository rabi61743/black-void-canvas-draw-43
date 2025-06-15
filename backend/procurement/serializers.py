from rest_framework import serializers
from .models import ProcurementPlan, QuarterlyTarget
from committee.models import Committee
from committee.serializers import CommitteeSerializer

class QuarterlyTargetSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuarterlyTarget
        fields = ['id', 'quarter', 'target_details', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']

class ProcurementPlanDropdownSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcurementPlan
        fields = ['id', 'project_name', 'policy_number']

class ProcurementPlanSerializer(serializers.ModelSerializer):
    quarterly_targets = QuarterlyTargetSerializer(many=True, required=False)
    committee = CommitteeSerializer(read_only=True)
    proposed_budget_percentage = serializers.SerializerMethodField()

    class Meta:
        model = ProcurementPlan
        fields = [
            'id', 'policy_number', 'department', 'dept_index', 'project_name', 
            'project_description', 'estimated_cost', 'budget', 'proposed_budget_percentage',
            'created_at', 'owner', 'committee', 'quarterly_targets', 'stage'
        ]
        read_only_fields = ['id', 'created_at', 'owner', 'proposed_budget_percentage', 'stage']

    def get_proposed_budget_percentage(self, obj):
        return obj.proposed_budget_percentage()

    def create(self, validated_data):
        quarterly_targets_data = validated_data.pop('quarterly_targets', [])
        plan = ProcurementPlan.objects.create(**validated_data)
        for target_data in quarterly_targets_data:
            QuarterlyTarget.objects.create(procurement_plan=plan, **target_data)
        return plan

    def update(self, instance, validated_data):
        quarterly_targets_data = validated_data.pop('quarterly_targets', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if quarterly_targets_data is not None:
            instance.quarterly_targets.all().delete()
            for target_data in quarterly_targets_data:
                QuarterlyTarget.objects.create(procurement_plan=instance, **target_data)

        return instance



# from rest_framework import serializers
# from .models import ProcurementPlan, QuarterlyTarget
# from committee.models import Committee
# from committee.serializers import CommitteeSerializer

# class QuarterlyTargetSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = QuarterlyTarget
#         fields = ['id', 'quarter', 'target_details', 'status', 'created_at']
#         read_only_fields = ['id', 'created_at']

# # Serializer for dropdown use (minimal fields)
# class ProcurementPlanDropdownSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ProcurementPlan
#         fields = ['id', 'project_name', 'policy_number']

# class ProcurementPlanSerializer(serializers.ModelSerializer):
#     quarterly_targets = QuarterlyTargetSerializer(many=True, required=False)
#     committee = CommitteeSerializer(read_only=True)
#     proposed_budget_percentage = serializers.SerializerMethodField()

#     class Meta:
#         model = ProcurementPlan
#         fields = [
#             'id', 'policy_number', 'department', 'dept_index', 'project_name', 
#             'project_description', 'estimated_cost', 'budget', 'proposed_budget_percentage',
#             'created_at', 'owner', 'committee', 'quarterly_targets'
#         ]
#         read_only_fields = ['id', 'created_at', 'owner', 'proposed_budget_percentage']

#     def get_proposed_budget_percentage(self, obj):
#         return obj.proposed_budget_percentage()

#     def create(self, validated_data):
#         quarterly_targets_data = validated_data.pop('quarterly_targets', [])
#         plan = ProcurementPlan.objects.create(**validated_data)
#         for target_data in quarterly_targets_data:
#             QuarterlyTarget.objects.create(procurement_plan=plan, **target_data)
#         return plan

#     def update(self, instance, validated_data):
#         quarterly_targets_data = validated_data.pop('quarterly_targets', None)
#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)
#         instance.save()

#         if quarterly_targets_data is not None:
#             instance.quarterly_targets.all().delete()
#             for target_data in quarterly_targets_data:
#                 QuarterlyTarget.objects.create(procurement_plan=instance, **target_data)

#         return instance
    
    

