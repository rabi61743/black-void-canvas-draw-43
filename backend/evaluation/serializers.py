from rest_framework import serializers
from .models import Evaluation
from procurement.models import ProcurementPlan

class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = ['id', 'bid', 'committee', 'score', 'comments', 'evaluation_date', 'status']
        read_only_fields = ['id', 'evaluation_date']

    def validate(self, data):
        bid = data.get('bid')
        procurement_plan = bid.tender.procurement_plan
        if procurement_plan.stage != 'bidding':
            raise serializers.ValidationError("Bidding process must be completed before evaluation.")
        return data

    def create(self, validated_data):
        evaluation = Evaluation.objects.create(**validated_data)
        # Update the ProcurementPlan stage
        procurement_plan = validated_data['bid'].tender.procurement_plan
        procurement_plan.stage = 'evaluation'
        procurement_plan.save()
        return evaluation

    def update(self, instance, validated_data):
        instance.score = validated_data.get('score', instance.score)
        instance.comments = validated_data.get('comments', instance.comments)
        instance.status = validated_data.get('status', instance.status)
        instance.save()
        return instance