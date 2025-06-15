from django.contrib import admin
from .models import Specification

@admin.register(Specification)
class SpecificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'procurement_plan', 'created_at', 'updated_at', 'draft_status')
    list_filter = ('draft_status', 'created_at', 'updated_at')
    search_fields = ('title', 'procurement_plan__project_name', 'description')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at')  # These are auto-generated