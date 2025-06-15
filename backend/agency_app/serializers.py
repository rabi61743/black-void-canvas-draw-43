# backend/agency/serializers.py
from rest_framework import serializers
from .models import Project, Document, Comment
from users.models import CustomUser
from procurement.models import ProcurementPlan
from procurement.serializers import ProcurementPlanSerializer

class DocumentSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = ['id', 'name', 'url', 'uploaded_at']
        
    def get_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None

class CommentSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()
    attachments = DocumentSerializer(many=True, read_only=True)
    user_email = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'author', 'content', 'role', 'date', 'created_at', 'attachments', 'user_email', 'user_role']
        read_only_fields = ['id', 'created_at', 'user_email', 'user_role']
    
    def get_date(self, obj):
        return obj.created_at.strftime("%Y/%m/%d")
    
    def get_user_email(self, obj):
        return obj.user.email if obj.user else None
    
    def get_user_role(self, obj):
        return obj.user.role.role_name if obj.user and obj.user.role else None

class ProjectListSerializer(serializers.ModelSerializer):
    document_count = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    documents = DocumentSerializer(many=True, read_only=True)
    created_by_email = serializers.SerializerMethodField()
    procurement_plan = ProcurementPlanSerializer(read_only=True)
    
    class Meta:
        model = Project
        fields = ['id', 'title', 'status', 'date', 'one_line_description', 'document_count', 'documents', 'created_by_email', 'procurement_plan']
    
    def get_document_count(self, obj):
        return obj.documents.count()
    
    def get_date(self, obj):
        return obj.created_at.strftime("%Y/%m/%d")
        
    def get_created_by_email(self, obj):
        return obj.created_by.email if obj.created_by else None

class ProjectDetailSerializer(serializers.ModelSerializer):
    documents = DocumentSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    date = serializers.SerializerMethodField()
    document_count = serializers.SerializerMethodField()
    start_date_formatted = serializers.SerializerMethodField()
    deadline_date_formatted = serializers.SerializerMethodField()
    created_by_email = serializers.SerializerMethodField()
    created_by_role = serializers.SerializerMethodField()
    procurement_plan = ProcurementPlanSerializer(read_only=True, allow_null=False)  # Added allow_null=False
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'one_line_description', 'description', 'program',
            'start_date', 'start_date_formatted', 'deadline_date', 'deadline_date_formatted',
            'identification_no', 'selected_contractor', 'remarks', 'status',
            'date', 'document_count', 'documents', 'comments', 'created_by_email', 'created_by_role', 'procurement_plan'
        ]
    
    def get_document_count(self, obj):
        return obj.documents.count()
    
    def get_date(self, obj):
        return obj.created_at.strftime("%Y/%m/%d")
    
    def get_start_date_formatted(self, obj):
        return obj.start_date.strftime("%Y/%m/%d")
    
    def get_deadline_date_formatted(self, obj):
        return obj.deadline_date.strftime("%Y/%m/%d")
        
    def get_created_by_email(self, obj):
        return obj.created_by.email if obj.created_by else None
        
    def get_created_by_role(self, obj):
        return obj.created_by.role.role_name if obj.created_by and obj.created_by.role else None

class ProjectCreateSerializer(serializers.ModelSerializer):
    procurement_plan = serializers.PrimaryKeyRelatedField(
        queryset=ProcurementPlan.objects.all(),
        required=True,  # Changed to required=True
        allow_null=False  # Added allow_null=False
    )
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'one_line_description', 'description', 'program',
            'start_date', 'deadline_date', 'identification_no',
            'selected_contractor', 'remarks', 'procurement_plan'
        ]
        read_only_fields = ['id']
    
    def create(self, validated_data):
        user = self.context.get('request').user if self.context.get('request') else None
        project = Project.objects.create(**validated_data, created_by=user)
        return project


# # backend/agency/serializers.py
# from rest_framework import serializers
# from .models import Project, Document, Comment
# from users.models import CustomUser
# from procurement.models import ProcurementPlan
# from procurement.serializers import ProcurementPlanSerializer  # Use existing serializer

# class DocumentSerializer(serializers.ModelSerializer):
#     url = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Document
#         fields = ['id', 'name', 'url', 'uploaded_at']
        
#     def get_url(self, obj):
#         if obj.file:
#             request = self.context.get('request')
#             if request:
#                 return request.build_absolute_uri(obj.file.url)
#         return None

# class CommentSerializer(serializers.ModelSerializer):
#     date = serializers.SerializerMethodField()
#     attachments = DocumentSerializer(many=True, read_only=True)
#     user_email = serializers.SerializerMethodField()
#     user_role = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Comment
#         fields = ['id', 'author', 'content', 'role', 'date', 'created_at', 'attachments', 'user_email', 'user_role']
#         read_only_fields = ['id', 'created_at', 'user_email', 'user_role']
    
#     def get_date(self, obj):
#         return obj.created_at.strftime("%Y/%m/%d")
    
#     def get_user_email(self, obj):
#         return obj.user.email if obj.user else None
    
#     def get_user_role(self, obj):
#         return obj.user.role.role_name if obj.user and obj.user.role else None

# class ProjectListSerializer(serializers.ModelSerializer):
#     document_count = serializers.SerializerMethodField()
#     date = serializers.SerializerMethodField()
#     documents = DocumentSerializer(many=True, read_only=True)
#     created_by_email = serializers.SerializerMethodField()
#     procurement_plan = ProcurementPlanSerializer(read_only=True)  # Use existing serializer
    
#     class Meta:
#         model = Project
#         fields = ['id', 'title', 'status', 'date', 'one_line_description', 'document_count', 'documents', 'created_by_email', 'procurement_plan']
    
#     def get_document_count(self, obj):
#         return obj.documents.count()
    
#     def get_date(self, obj):
#         return obj.created_at.strftime("%Y/%m/%d")
        
#     def get_created_by_email(self, obj):
#         return obj.created_by.email if obj.created_by else None

# class ProjectDetailSerializer(serializers.ModelSerializer):
#     documents = DocumentSerializer(many=True, read_only=True)
#     comments = CommentSerializer(many=True, read_only=True)
#     date = serializers.SerializerMethodField()
#     document_count = serializers.SerializerMethodField()
#     start_date_formatted = serializers.SerializerMethodField()
#     deadline_date_formatted = serializers.SerializerMethodField()
#     created_by_email = serializers.SerializerMethodField()
#     created_by_role = serializers.SerializerMethodField()
#     procurement_plan = ProcurementPlanSerializer(read_only=True)  # Use existing serializer
    
#     class Meta:
#         model = Project
#         fields = [
#             'id', 'title', 'one_line_description', 'description', 'program',
#             'start_date', 'start_date_formatted', 'deadline_date', 'deadline_date_formatted',
#             'identification_no', 'selected_contractor', 'remarks', 'status',
#             'date', 'document_count', 'documents', 'comments', 'created_by_email', 'created_by_role', 'procurement_plan'
#         ]
    
#     def get_document_count(self, obj):
#         return obj.documents.count()
    
#     def get_date(self, obj):
#         return obj.created_at.strftime("%Y/%m/%d")
    
#     def get_start_date_formatted(self, obj):
#         return obj.start_date.strftime("%Y/%m/%d")
    
#     def get_deadline_date_formatted(self, obj):
#         return obj.deadline_date.strftime("%Y/%m/%d")
        
#     def get_created_by_email(self, obj):
#         return obj.created_by.email if obj.created_by else None
        
#     def get_created_by_role(self, obj):
#         return obj.created_by.role.role_name if obj.created_by and obj.created_by.role else None

# class ProjectCreateSerializer(serializers.ModelSerializer):
#     procurement_plan = serializers.PrimaryKeyRelatedField(
#         queryset=ProcurementPlan.objects.all(),
#         required=False,
#         allow_null=True
#     )  # Allow selecting a ProcurementPlan by ID
    
#     class Meta:
#         model = Project
#         fields = [
#             'id', 'title', 'one_line_description', 'description', 'program',
#             'start_date', 'deadline_date', 'identification_no',
#             'selected_contractor', 'remarks', 'procurement_plan'
#         ]
#         read_only_fields = ['id']
    
#     def create(self, validated_data):
#         user = self.context.get('request').user if self.context.get('request') else None
#         project = Project.objects.create(**validated_data, created_by=user)
#         return project

