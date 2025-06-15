# backend/external-agency/models.py
from django.db import models
from django.utils import timezone
from users.models import CustomUser
import os

def get_file_path(instance, filename):
    """Generate a unique file path for uploaded documents"""
    ext = filename.split('.')[-1]
    filename = f"{instance.project.id}_{timezone.now().strftime('%Y%m%d%H%M%S')}.{ext}"
    return os.path.join('project_documents', filename)

class Project(models.Model):
    STATUS_CHOICES = (
        ('approved', 'Approved'),
        ('pending', 'Pending'),
        ('rejected', 'Rejected'),
    )
    
    title = models.CharField(max_length=100)
    one_line_description = models.CharField(max_length=200)
    description = models.TextField(max_length=500)
    program = models.CharField(max_length=100)
    start_date = models.DateField()
    deadline_date = models.DateField()
    identification_no = models.CharField(max_length=100)
    selected_contractor = models.CharField(max_length=100)
    remarks = models.TextField(max_length=400, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(CustomUser, related_name='agency_app_created_projects', on_delete=models.CASCADE, null=True)
    procurement_plan = models.OneToOneField(
        'procurement.ProcurementPlan',
        related_name='agency_project',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    def __str__(self):
        return self.title

class Document(models.Model):
    project = models.ForeignKey(Project, related_name='documents', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to=get_file_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.project.title}"

class Comment(models.Model):
    project = models.ForeignKey(Project, related_name='comments', on_delete=models.CASCADE)
    author = models.CharField(max_length=100)
    content = models.TextField()
    role = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    attachments = models.ManyToManyField(Document, related_name='comments', blank=True)
    user = models.ForeignKey(CustomUser, related_name='agency_app_comments', on_delete=models.CASCADE, null=True)
    
    def __str__(self):
        return f"Comment by {self.author} on {self.project.title}"


# from django.db import models
# from django.utils import timezone
# from users.models import CustomUser
# import os

# def get_file_path(instance, filename):
#     """Generate a unique file path for uploaded documents"""
#     ext = filename.split('.')[-1]
#     filename = f"{instance.project.id}_{timezone.now().strftime('%Y%m%d%H%M%S')}.{ext}"
#     return os.path.join('project_documents', filename)

# class Project(models.Model):
#     STATUS_CHOICES = (
#         ('approved', 'Approved'),
#         ('pending', 'Pending'),
#         ('rejected', 'Rejected'),
#     )
    
#     title = models.CharField(max_length=100)
#     one_line_description = models.CharField(max_length=200)
#     description = models.TextField(max_length=500)
#     program = models.CharField(max_length=100)
#     start_date = models.DateField()
#     deadline_date = models.DateField()
#     identification_no = models.CharField(max_length=100)
#     selected_contractor = models.CharField(max_length=100)
#     remarks = models.TextField(max_length=400, blank=True)
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     created_by = models.ForeignKey(CustomUser, related_name='agency_app_created_projects', on_delete=models.CASCADE, null=True)
#     procurement_plan = models.ForeignKey(
#         'procurement.ProcurementPlan',
#         related_name='agency_projects',
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True
#     )
    
#     def __str__(self):
#         return self.title

# class Document(models.Model):
#     project = models.ForeignKey(Project, related_name='documents', on_delete=models.CASCADE)
#     name = models.CharField(max_length=255)
#     file = models.FileField(upload_to=get_file_path)
#     uploaded_at = models.DateTimeField(auto_now_add=True)
    
#     def __str__(self):
#         return f"{self.name} - {self.project.title}"

# class Comment(models.Model):
#     project = models.ForeignKey(Project, related_name='comments', on_delete=models.CASCADE)
#     author = models.CharField(max_length=100)
#     content = models.TextField()
#     role = models.CharField(max_length=50, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     attachments = models.ManyToManyField(Document, related_name='comments', blank=True)
#     user = models.ForeignKey(CustomUser, related_name='agency_app_comments', on_delete=models.CASCADE, null=True)
    
#     def __str__(self):
#         return f"Comment by {self.author} on {self.project.title}"

