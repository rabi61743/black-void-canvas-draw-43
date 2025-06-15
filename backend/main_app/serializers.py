from rest_framework import serializers
# from .models import Department
from users.models import CustomUser
from users.serializers import UserSerializer

# class DepartmentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Department
#         fields = '__all__'

from .models import Procurement, ProcurementMember   
class ProcurementMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), write_only=True)

    class Meta:
        model = ProcurementMember
        fields = ['id', 'user', 'user_id', 'role']

    def create(self, validated_data):
        user = validated_data.pop("user_id")
        return ProcurementMember.objects.create(user=user, **validated_data)

class ProcurementSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    members = ProcurementMemberSerializer(many=True, required=False)

    class Meta:
        model = Procurement
        fields = ['id', 'procurement_id', 'detail', 'created_by', 'status', 'date_created', 'members']

    def create(self, validated_data):
        members_data = validated_data.pop('members', [])
        procurement = Procurement.objects.create(**validated_data)
        
        for member_data in members_data:
            ProcurementMember.objects.create(procurement=procurement, **member_data)
        
