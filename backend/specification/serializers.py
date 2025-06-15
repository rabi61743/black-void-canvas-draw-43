from rest_framework import serializers
from .models import Specification
from procurement.models import ProcurementPlan

class SpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specification
        fields = ['id', 'procurement_plan', 'title', 'description', 'created_at', 'updated_at', 'draft_status']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_procurement_plan(self, value):
        if not value.committee:
            raise serializers.ValidationError("A committee must be formed before creating a specification.")
        if value.stage != 'planning':
            raise serializers.ValidationError("Procurement plan must be in the 'planning' stage to create a specification.")
        return value

    def create(self, validated_data):
        specification = Specification.objects.create(**validated_data)
        # Update the ProcurementPlan stage
        procurement_plan = validated_data['procurement_plan']
        procurement_plan.stage = 'specification'
        procurement_plan.save()
        return specification

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.draft_status = validated_data.get('draft_status', instance.draft_status)
        instance.save()
        return instance