from rest_framework import serializers
from .models import Contract
from procurement.models import ProcurementPlan

class ContractSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contract
        fields = ['id', 'bid', 'contract_amount', 'award_date', 'contract_document', 'status']
        read_only_fields = ['id', 'award_date']

    def validate(self, data):
        bid = data.get('bid')
        procurement_plan = bid.tender.procurement_plan
        if procurement_plan.stage != 'evaluation':
            raise serializers.ValidationError("Evaluation must be completed before awarding a contract.")
        if not bid.evaluation or bid.evaluation.status != 'approved':
            raise serializers.ValidationError("Bid must be evaluated and approved before awarding a contract.")
        return data

    def create(self, validated_data):
        contract = Contract.objects.create(**validated_data)
        # Update the ProcurementPlan stage
        procurement_plan = validated_data['bid'].tender.procurement_plan
        procurement_plan.stage = 'contract'
        procurement_plan.save()
        return contract

    def update(self, instance, validated_data):
        instance.contract_amount = validated_data.get('contract_amount', instance.contract_amount)
        instance.contract_document = validated_data.get('contract_document', instance.contract_document)
        instance.status = validated_data.get('status', instance.status)
        instance.save()
        return instance