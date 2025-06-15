from rest_framework import serializers
from .models import Tender
from procurement.models import ProcurementPlan

class TenderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tender
        fields = ['id', 'procurement_plan', 'specification', 'title', 'description', 'publication_date', 'closing_date', 'created_at', 'updated_at', 'is_published']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        procurement_plan = data.get('procurement_plan')
        specification = data.get('specification')

        if procurement_plan.stage != 'specification':
            raise serializers.ValidationError("Procurement plan must be in the 'specification' stage to create a tender.")
        if specification.draft_status:
            raise serializers.ValidationError("Specification must be finalized (draft_status=False) to create a tender.")
        if data.get('publication_date') >= data.get('closing_date'):
            raise serializers.ValidationError("Publication date must be before closing date.")
        return data

    def create(self, validated_data):
        tender = Tender.objects.create(**validated_data)
        # Update the ProcurementPlan stage
        procurement_plan = validated_data['procurement_plan']
        procurement_plan.stage = 'tender'
        procurement_plan.save()
        return tender

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.publication_date = validated_data.get('publication_date', instance.publication_date)
        instance.closing_date = validated_data.get('closing_date', instance.closing_date)
        instance.is_published = validated_data.get('is_published', instance.is_published)
        instance.save()
        return instance