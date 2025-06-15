from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, RoleHierarchy, EmployeeDetail
from django.utils.html import format_html

# Register RoleHierarchy Admin
class RoleHierarchyAdmin(admin.ModelAdmin):
    list_display = ('role_name', 'parent_role', 'view_hierarchy')
    search_fields = ('role_name',)
    list_filter = ('parent',)
    ordering = ('role_name',)

    def parent_role(self, obj):
        return obj.parent.role_name if obj.parent else None

    def view_hierarchy(self, obj):
        hierarchy = obj.get_hierarchy()
        return format_html(" -> ".join(hierarchy))

try:
    admin.site.register(RoleHierarchy, RoleHierarchyAdmin)
except admin.sites.AlreadyRegistered:
    pass

# Register CustomUser Admin
class CustomUserAdmin(UserAdmin):
    list_display = ('employee_id', 'username', 'email', 'role', 'is_active', 'is_superuser', 'last_login', 'date_joined')  # Changed id to employee_id
    search_fields = ('employee_id', 'username', 'email')  # Changed to employee_id
    list_filter = ('role', 'is_active', 'is_superuser')
    
    fieldsets = (
        (None, {'fields': ('employee_id', 'password')}),  # Changed username to employee_id
        ('Personal Info', {'fields': ('username', 'first_name', 'last_name', 'email', 'phone', 'department')}),  # Added phone, department
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Role', {'fields': ('role',)}),
        ('Important Dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('employee_id', 'username', 'password1', 'password2', 'role', 'email', 'phone', 'department')  # Changed to employee_id
        }),
    )

    add_permission = True

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(EmployeeDetail)