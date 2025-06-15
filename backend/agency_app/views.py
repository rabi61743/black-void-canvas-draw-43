# backend/agency_app/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Project, Document, Comment
from .serializers import (
    ProjectListSerializer, ProjectDetailSerializer, ProjectCreateSerializer,
    DocumentSerializer, CommentSerializer
)
from .permissions import IsAdminUser, IsManagerUser, IsContractorOrHigher
import os
from django.conf import settings
from procurement.models import ProcurementPlan

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('-created_at')
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        project = serializer.save()
        detail_serializer = ProjectDetailSerializer(project, context=self.get_serializer_context())
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ProjectCreateSerializer
        if self.action == 'retrieve' or self.action == 'update':
            return ProjectDetailSerializer
        return ProjectListSerializer
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        search_query = request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(title__icontains=search_query)
        status_filter = request.query_params.get('status', None)
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)
            
        sort_by = request.query_params.get('sort', None)
        if sort_by:
            if sort_by == 'newest':
                queryset = queryset.order_by('-created_at')
            elif sort_by == 'oldest':
                queryset = queryset.order_by('created_at')
            elif sort_by == 'name':
                queryset = queryset.order_by('title')
        
        procurement_plan_id = request.query_params.get('procurement_plan_id', None)
        if procurement_plan_id:
            queryset = queryset.filter(procurement_plan_id=procurement_plan_id)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def get_object(self):
        return super().get_object()
    
    @action(detail=True, methods=['post'], url_path='upload-documents')
    def upload_documents(self, request, pk=None):
        project = self.get_object()
        files = request.FILES.getlist('files')
        if not files:
            return Response({'error': 'No files were provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        documents = []
        for file in files:
            document = Document(project=project, name=file.name, file=file)
            document.save()
            documents.append(document)
        serializer = DocumentSerializer(documents, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        project = self.get_object()
        new_status = request.data.get('status')
        if new_status not in [s[0] for s in Project.STATUS_CHOICES]:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        project.status = new_status
        project.save()
        return Response({'status': project.status}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get', 'post'], url_path='comments')
    def comments(self, request, pk=None):
        project = self.get_object()
        if request.method == 'GET':
            comments = Comment.objects.filter(project=project).order_by('created_at')
            serializer = CommentSerializer(comments, many=True, context={'request': request})
            return Response(serializer.data)
        elif request.method == 'POST':
            author = request.user.name or request.user.employee_id
            content = request.data.get('content')
            role = request.user.role.role_name if request.user.role else ''
            if not content:
                return Response({'error': 'Comment content is required'}, status=status.HTTP_400_BAD_REQUEST)
            comment = Comment(project=project, author=author, content=content, role=role, user=request.user)
            comment.save()
            serializer = CommentSerializer(comment, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    @action(detail=True, methods=['post'], url_path='comments/with-attachments')
    def comments_with_attachments(self, request, pk=None):
        project = self.get_object()
        author = request.user.name or request.user.employee_id
        content = request.data.get('content')
        role = request.user.role.role_name if request.user.role else ''
        if not content:
            return Response({'error': 'Comment content is required'}, status=status.HTTP_400_BAD_REQUEST)
        comment = Comment(project=project, author=author, content=content, role=role, user=request.user)
        comment.save()
        files = request.FILES.getlist('files')
        if files:
            for file in files:
                document = Document(project=project, name=file.name, file=file)
                document.save()
                comment.attachments.add(document)
        serializer = CommentSerializer(comment, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        comment = self.get_object()
        if comment.user != request.user and not (request.user.role and request.user.role.role_name == 'SUPERADMIN'):
            return Response({'error': 'You do not have permission to update this comment'}, 
                            status=status.HTTP_403_FORBIDDEN)
        if 'content' in request.data:
            comment.content = request.data['content']
            comment.save()
        serializer = self.get_serializer(comment)
        return Response(serializer.data)

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
        
    def destroy(self, request, *args, **kwargs):
        document = self.get_object()
        project = document.project
        if request.user.role and request.user.role.role_name not in ['SUPERADMIN', 'MANAGER'] and project.created_by != request.user:
            return Response({'error': 'You do not have permission to delete this document'}, 
                            status=status.HTTP_403_FORBIDDEN)
        if document.file and os.path.isfile(document.file.path):
            os.remove(document.file.path)
        self.perform_destroy(document)
        return Response(status=status.HTTP_204_NO_CONTENT)


# # backend/agency/views.py
# from rest_framework import viewsets, status, permissions
# from rest_framework.response import Response
# from rest_framework.decorators import action
# from .models import Project, Document, Comment
# from .serializers import (
#     ProjectListSerializer, ProjectDetailSerializer, ProjectCreateSerializer,
#     DocumentSerializer, CommentSerializer
# )
# from .permissions import IsAdminUser, IsManagerUser, IsContractorOrHigher
# import os
# from django.conf import settings
# from procurement.models import ProcurementPlan

# class ProjectViewSet(viewsets.ModelViewSet):
#     queryset = Project.objects.all().order_by('-created_at')
#     permission_classes = [permissions.IsAuthenticated]
    
#     def create(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
        
#         # Validate procurement_plan access
#         procurement_plan = serializer.validated_data.get('procurement_plan')
#         if procurement_plan:
#             pass
        
#         project = serializer.save()
#         detail_serializer = ProjectDetailSerializer(project, context=self.get_serializer_context())
#         return Response(detail_serializer.data, status=status.HTTP_201_CREATED)
    
#     def get_serializer_class(self):
#         if self.action == 'create':
#             return ProjectCreateSerializer
#         if self.action == 'retrieve' or self.action == 'update':
#             return ProjectDetailSerializer
#         return ProjectListSerializer
    
#     def list(self, request, *args, **kwargs):
#         queryset = self.get_queryset()
#         search_query = request.query_params.get('search', None)
#         if search_query:
#             queryset = queryset.filter(title__icontains=search_query)
#         status_filter = request.query_params.get('status', None)
#         if status_filter and status_filter != 'all':
#             queryset = queryset.filter(status=status_filter)
            
#         sort_by = request.query_params.get('sort', None)
#         if sort_by:
#             if sort_by == 'newest':
#                 queryset = queryset.order_by('-created_at')
#             elif sort_by == 'oldest':
#                 queryset = queryset.order_by('created_at')
#             elif sort_by == 'name':
#                 queryset = queryset.order_by('title')
        
#         serializer = self.get_serializer(queryset, many=True)
#         return Response(serializer.data)
    
#     def get_object(self):
#         return super().get_object()
    
#     @action(detail=True, methods=['post'], url_path='upload-documents')
#     def upload_documents(self, request, pk=None):
#         project = self.get_object()
#         files = request.FILES.getlist('files')
#         if not files:
#             return Response({'error': 'No files were provided'}, status=status.HTTP_400_BAD_REQUEST)
        
#         documents = []
#         for file in files:
#             document = Document(project=project, name=file.name, file=file)
#             document.save()
#             documents.append(document)
#         serializer = DocumentSerializer(documents, many=True, context={'request': request})
#         return Response(serializer.data, status=status.HTTP_201_CREATED)
        
#     @action(detail=True, methods=['post'], url_path='update-status')
#     def update_status(self, request, pk=None):
#         project = self.get_object()
#         new_status = request.data.get('status')
#         if new_status not in [s[0] for s in Project.STATUS_CHOICES]:
#             return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
#         project.status = new_status
#         project.save()
#         return Response({'status': project.status}, status=status.HTTP_200_OK)
    
#     @action(detail=True, methods=['get', 'post'], url_path='comments')
#     def comments(self, request, pk=None):
#         project = self.get_object()
#         if request.method == 'GET':
#             comments = Comment.objects.filter(project=project).order_by('created_at')
#             serializer = CommentSerializer(comments, many=True, context={'request': request})
#             return Response(serializer.data)
#         elif request.method == 'POST':
#             author = request.user.name or request.user.employee_id
#             content = request.data.get('content')
#             role = request.user.role.role_name if request.user.role else ''
#             if not content:
#                 return Response({'error': 'Comment content is required'}, status=status.HTTP_400_BAD_REQUEST)
#             comment = Comment(project=project, author=author, content=content, role=role, user=request.user)
#             comment.save()
#             serializer = CommentSerializer(comment, context={'request': request})
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
        
#     @action(detail=True, methods=['post'], url_path='comments/with-attachments')
#     def comments_with_attachments(self, request, pk=None):
#         project = self.get_object()
#         author = request.user.name or request.user.employee_id
#         content = request.data.get('content')
#         role = request.user.role.role_name if request.user.role else ''
#         if not content:
#             return Response({'error': 'Comment content is required'}, status=status.HTTP_400_BAD_REQUEST)
#         comment = Comment(project=project, author=author, content=content, role=role, user=request.user)
#         comment.save()
#         files = request.FILES.getlist('files')
#         if files:
#             for file in files:
#                 document = Document(project=project, name=file.name, file=file)
#                 document.save()
#                 comment.attachments.add(document)
#         serializer = CommentSerializer(comment, context={'request': request})
#         return Response(serializer.data, status=status.HTTP_201_CREATED)

# class CommentViewSet(viewsets.ModelViewSet):
#     queryset = Comment.objects.all()
#     serializer_class = CommentSerializer
#     permission_classes = [permissions.IsAuthenticated]
    
#     def update(self, request, *args, **kwargs):
#         comment = self.get_object()
#         if comment.user != request.user and not (request.user.role and request.user.role.role_name == 'SUPERADMIN'):
#             return Response({'error': 'You do not have permission to update this comment'}, 
#                             status=status.HTTP_403_FORBIDDEN)
#         if 'content' in request.data:
#             comment.content = request.data['content']
#             comment.save()
#         serializer = self.get_serializer(comment)
#         return Response(serializer.data)

# class DocumentViewSet(viewsets.ModelViewSet):
#     queryset = Document.objects.all()
#     serializer_class = DocumentSerializer
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get_serializer_context(self):
#         context = super().get_serializer_context()
#         context.update({"request": self.request})
#         return context
        
#     def destroy(self, request, *args, **kwargs):
#         document = self.get_object()
#         project = document.project
#         if request.user.role and request.user.role.role_name not in ['SUPERADMIN', 'MANAGER'] and project.created_by != request.user:
#             return Response({'error': 'You do not have permission to delete this document'}, 
#                             status=status.HTTP_403_FORBIDDEN)
#         if document.file and os.path.isfile(document.file.path):
#             os.remove(document.file.path)
#         self.perform_destroy(document)
#         return Response(status=status.HTTP_204_NO_CONTENT)

