from rest_framework import serializers
from .models import Bid
from procurement.models import ProcurementPlan

class BidSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bid
        fields = ['id', 'tender', 'bidder', 'bid_amount', 'submission_date', 'documents', 'status']
        read_only_fields = ['id', 'submission_date', 'bidder']

    def validate(self, data):
        tender = data.get('tender')
        procurement_plan = tender.procurement_plan
        if procurement_plan.stage != 'committee':
            raise serializers.ValidationError("Committee must be formed before submitting a bid.")
        if not tender.is_published:
            raise serializers.ValidationError("Tender must be published to accept bids.")
        if tender.closing_date < timezone.now():
            raise serializers.ValidationError("Tender has closed. No more bids are accepted.")
        return data

    def create(self, validated_data):
        validated_data['bidder'] = self.context['request'].user
        bid = Bid.objects.create(**validated_data)
        # Update the ProcurementPlan stage
        procurement_plan = validated_data['tender'].procurement_plan
        procurement_plan.stage = 'bidding'
        procurement_plan.save()
        return bid

    def update(self, instance, validated_data):
        instance.bid_amount = validated_data.get('bid_amount', instance.bid_amount)
        instance.documents = validated_data.get('documents', instance.documents)
        instance.status = validated_data.get('status', instance.status)
        instance.save()
        return instance