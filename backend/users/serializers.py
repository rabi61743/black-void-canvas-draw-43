# backend/users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import RoleHierarchy, CustomUser, EmployeeDetail

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    employee_id = serializers.CharField()  # Input field for employee_id or email

    def validate(self, attrs):
        identifier = attrs.get('employee_id')
        password = attrs.get('password')
        user = None
        try:
            user = User.objects.get(employee_id=identifier)
        except User.DoesNotExist:
            try:
                user = User.objects.get(email=identifier)
            except User.DoesNotExist:
                raise serializers.ValidationError('No active account found with the given credentials')
        credentials = {'employee_id': user.employee_id, 'password': password}
        user = authenticate(request=self.context.get('request'), **credentials)
        if not user:
            raise serializers.ValidationError('No active account found with the given credentials')
        data = super().validate(attrs)
        refresh = self.get_token(user)
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        data['user'] = {
            '_id': user._id,
            'name': user.name,
            'email': user.email,
            'employeeId': user.employee_id,
            'role': {
                'id': user.role.id if user.role else None,
                'role_name': user.role.role_name if user.role else None,
                'parent': user.role.parent_id if user.role and user.role.parent else None
            } if user.role else None,
            'department': user.department,
            'phoneNumber': user.phone,
            'designation': user.designation,
            'isActive': user.is_active,
            'otpEnabled': user.otp_enabled,
            'permissions': user.permissions or []
        }
        return data

class RoleSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='pk')
    role_name = serializers.CharField()
    parent = serializers.PrimaryKeyRelatedField(queryset=RoleHierarchy.objects.all(), allow_null=True)

    class Meta:
        model = RoleHierarchy
        fields = ['id', 'role_name', 'parent']

class UserSerializer(serializers.ModelSerializer):
    _id = serializers.CharField(source='employee_id')
    employeeId = serializers.CharField(source='employee_id')
    name = serializers.CharField(allow_null=True)
    phoneNumber = serializers.CharField(source='phone', allow_null=True)
    isActive = serializers.BooleanField(source='is_active')
    otpEnabled = serializers.BooleanField(source='otp_enabled', default=False)
    role = RoleSerializer(read_only=True, allow_null=True)
    department = serializers.CharField(allow_null=True)
    designation = serializers.CharField(allow_null=True)
    permissions = serializers.JSONField(default=list)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=RoleHierarchy.objects.all(),
        source='role',
        write_only=True,
        required=False
    )

    class Meta:
        model = CustomUser
        fields = [
            '_id', 'employeeId', 'name', 'email', 'phoneNumber', 'department', 'designation',
            'isActive', 'otpEnabled', 'permissions', 'role', 'role_id'
        ]
        extra_kwargs = {
            'email': {'read_only': True},
            'name': {'read_only': True},
            'employeeId': {'read_only': True},
            'department': {'read_only': True},
            'designation': {'read_only': True}
        }

    def update(self, instance, validated_data):
        role = validated_data.pop('role', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if role:
            instance.role = role
        instance.save()
        return instance

class EmployeeByIdSerializer(serializers.ModelSerializer):
    _id = serializers.CharField(source='employee_id')
    employeeId = serializers.CharField(source='employee_id')
    name = serializers.CharField()
    role = serializers.SerializerMethodField()
    phoneNumber = serializers.CharField(source='phone', allow_blank=True)
    isActive = serializers.BooleanField(source='is_active')
    otpEnabled = serializers.BooleanField(source='otp_enabled')
    department = serializers.CharField(allow_blank=True)
    designation = serializers.CharField(allow_blank=True)
    permissions = serializers.JSONField(default=list)

    class Meta:
        model = CustomUser
        fields = [
            '_id', 'name', 'email', 'role', 'employeeId', 'department',
            'phoneNumber', 'designation', 'isActive', 'otpEnabled', 'permissions'
        ]

    def get_role(self, obj):
        return obj.role.role_name if obj.role and hasattr(obj, 'role') else 'member'

class RegisterSerializer(serializers.ModelSerializer):
    role = serializers.PrimaryKeyRelatedField(queryset=RoleHierarchy.objects.all(), required=True)

    class Meta:
        model = CustomUser
        fields = ['employee_id', 'name', 'username', 'email', 'phone', 'department', 'password', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def validate(self, data):
        if CustomUser.objects.filter(employee_id=data['employee_id']).exists():
            raise serializers.ValidationError("A user with this employee ID already exists.")
        return data

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(write_only=True)

class EmployeeDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeDetail
        fields = ['employee_id', 'name', 'email', 'position', 'level', 'service', 'group', 'qualification', 'seniority', 'retirement', 'mno']



# # backend/users/serializers.py
# from rest_framework import serializers
# from django.contrib.auth import get_user_model, authenticate
# from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# from .models import RoleHierarchy, CustomUser, EmployeeDetail

# User = get_user_model()

# class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
#     employee_id = serializers.CharField()  # Input field for employee_id or email

#     def validate(self, attrs):
#         identifier = attrs.get('employee_id')
#         password = attrs.get('password')

#         # Try to find user by employee_id or email
#         user = None
#         try:
#             user = User.objects.get(employee_id=identifier)
#         except User.DoesNotExist:
#             try:
#                 user = User.objects.get(email=identifier)
#             except User.DoesNotExist:
#                 raise serializers.ValidationError('No active account found with the given credentials')

#         # Authenticate using the user's employee_id (USERNAME_FIELD)
#         credentials = {
#             'employee_id': user.employee_id,
#             'password': password
#         }
#         user = authenticate(request=self.context.get('request'), **credentials)

#         if not user:
#             raise serializers.ValidationError('No active account found with the given credentials')

#         # Generate tokens and user data
#         data = super().validate(attrs)
#         refresh = self.get_token(user)
#         data['refresh'] = str(refresh)
#         data['access'] = str(refresh.access_token)
#         data['user'] = {
#             '_id': user._id,
#             'name': user.name,
#             'email': user.email,
#             'employeeId': user.employee_id,
#             'role': {
#                 'id': user.role.id if user.role else None,
#                 'role_name': user.role.role_name if user.role else None,
#                 'parent': user.role.parent_id if user.role and user.role.parent else None
#             } if user.role else None,
#             'department': user.department,
#             'phoneNumber': user.phone,
#             'designation': user.designation,
#             'isActive': user.is_active,
#             'otpEnabled': user.otp_enabled,
#             'permissions': user.permissions or []
#         }
#         return data

# class RoleSerializer(serializers.ModelSerializer):
#     id = serializers.IntegerField(source='pk')
#     role_name = serializers.CharField()
#     parent = serializers.PrimaryKeyRelatedField(queryset=RoleHierarchy.objects.all(), allow_null=True)

#     class Meta:
#         model = RoleHierarchy
#         fields = ['id', 'role_name', 'parent']

# class UserSerializer(serializers.ModelSerializer):
#     _id = serializers.CharField(source='employee_id')
#     employeeId = serializers.CharField(source='employee_id')
#     name = serializers.CharField(allow_null=True)
#     phoneNumber = serializers.CharField(source='phone', allow_null=True)
#     isActive = serializers.BooleanField(source='is_active')
#     otpEnabled = serializers.BooleanField(source='otp_enabled', default=False)
#     role = RoleSerializer(read_only=True, allow_null=True)
#     department = serializers.CharField(allow_null=True)
#     designation = serializers.CharField(allow_null=True)
#     permissions = serializers.JSONField(default=list)
#     role_id = serializers.PrimaryKeyRelatedField(
#         queryset=RoleHierarchy.objects.all(),
#         source='role',
#         write_only=True,
#         required=False
#     )

#     class Meta:
#         model = CustomUser
#         fields = [
#             '_id', 'employeeId', 'name', 'email', 'phoneNumber', 'department', 'designation',
#             'isActive', 'otpEnabled', 'permissions', 'role', 'role_id', 'password'
#         ]
#         extra_kwargs = {
#             'password': {'write_only': True},
#             'email': {'allow_null': True}
#         }

#     def update(self, instance, validated_data):
#         password = validated_data.pop('password', None)
#         role = validated_data.pop('role', None)
#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)
#         if password:
#             instance.set_password(password)
#         if role:
#             instance.role = role
#         instance.save()
#         return instance

# class EmployeeByIdSerializer(serializers.ModelSerializer):
#     _id = serializers.CharField(source='employee_id')
#     employeeId = serializers.CharField(source='employee_id')
#     name = serializers.CharField()
#     role = serializers.SerializerMethodField()
#     phoneNumber = serializers.CharField(source='phone', allow_blank=True)
#     isActive = serializers.BooleanField(source='is_active')
#     otpEnabled = serializers.BooleanField(source='otp_enabled')
#     department = serializers.CharField(allow_blank=True)
#     designation = serializers.CharField(allow_blank=True)
#     permissions = serializers.JSONField(default=list)

#     class Meta:
#         model = CustomUser
#         fields = [
#             '_id', 'name', 'email', 'role', 'employeeId', 'department',
#             'phoneNumber', 'designation', 'isActive', 'otpEnabled', 'permissions'
#         ]

#     def get_role(self, obj):
#         return obj.role.role_name if obj.role and hasattr(obj, 'role') else 'member'

# class RegisterSerializer(serializers.ModelSerializer):
#     role = serializers.PrimaryKeyRelatedField(queryset=RoleHierarchy.objects.all(), required=True)

#     class Meta:
#         model = CustomUser
#         fields = ['employee_id', 'username', 'email', 'phone', 'department', 'password', 'role']
#         extra_kwargs = {
#             'password': {'write_only': True}
#         }

#     def create(self, validated_data):
#         password = validated_data.pop('password')
#         user = CustomUser(**validated_data)
#         user.set_password(password)
#         user.save()
#         return user

# class ForgotPasswordSerializer(serializers.Serializer):
#     email = serializers.EmailField()

# class ResetPasswordSerializer(serializers.Serializer):
#     token = serializers.CharField()
#     password = serializers.CharField(write_only=True)

# class EmployeeDetailSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = EmployeeDetail
#         fields = ['employee_id', 'name', 'email', 'position', 'level', 'service', 'group', 'qualification', 'seniority', 'retirement', 'mno']
