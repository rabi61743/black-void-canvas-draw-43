from django.contrib import admin
from .models import Project, Document, Comment

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'program', 'start_date', 'deadline_date', 'created_at')
    list_filter = ('status',)
    search_fields = ('title', 'description', 'identification_no')
    date_hierarchy = 'created_at'

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('name', 'project', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('name', 'project__title')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'project', 'role', 'created_at')
    list_filter = ('created_at', 'role')
    search_fields = ('author', 'content', 'project__title')
