from django.contrib import admin
from .models import ProcurementPlan, QuarterlyTarget

class QuarterlyTargetInline(admin.TabularInline):
    model = QuarterlyTarget
    extra = 1
    fields = ['quarter', 'target_details', 'status', 'created_at']
    readonly_fields = ['created_at']

class ProcurementPlanAdmin(admin.ModelAdmin):
    list_display = ['policy_number', 'project_name', 'department', 'estimated_cost', 'budget', 'created_at']
    list_filter = ['department', 'created_at']
    search_fields = ['policy_number', 'project_name', 'project_description']
    inlines = [QuarterlyTargetInline]
    readonly_fields = ['created_at', 'proposed_budget_percentage']
    fieldsets = (
        (None, {
            'fields': ('policy_number', 'department', 'dept_index', 'project_name', 'project_description')
        }),
        ('Financial Details', {
            'fields': ('estimated_cost', 'budget', 'proposed_budget_percentage')
        }),
        ('Metadata', {
            'fields': ('owner', 'created_at', 'committee')
        }),
    )

admin.site.register(ProcurementPlan, ProcurementPlanAdmin)
admin.site.register(QuarterlyTarget)