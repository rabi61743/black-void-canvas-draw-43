from django.contrib import admin

from django.contrib import admin
from .models import Procurement, ProcurementMember

# Inline to manage members within Procurement
class ProcurementMemberInline(admin.TabularInline):
    model = ProcurementMember
    extra = 1  # Show at least one empty row for adding members
    fields = ('user', 'role')  # Fields to be shown
    autocomplete_fields = ['user']  # Enable search for users
    verbose_name_plural = "Procurement Members"

# Register your models here.
from .models import Procurement, ProcurementMember
@admin.register(Procurement)
class ProcurementAdmin(admin.ModelAdmin):
    list_display = ('procurement_id', 'created_by', 'get_members')  
    search_fields = ('procurement_id', 'detail')  
    list_filter = ('created_by',)  
    ordering = ('procurement_id',)  

    def get_queryset(self, request):
        """ Restrict visible procurements based on user role """
        qs = super().get_queryset(request)

        if request.user.is_superuser:
            return qs  # Show all procurements for superusers

        # Get procurements where the user is a member
        user_procurements = ProcurementMember.objects.filter(user=request.user).values_list('procurement_id', flat=True)
        
        return qs.filter(id__in=user_procurements)

    def has_view_permission(self, request, obj=None):
        """ Define who can view the procurements """
        if request.user.is_superuser:
            return True  # Superusers can view all
        if obj:
            return ProcurementMember.objects.filter(procurement=obj, user=request.user).exists()
        return True

    def get_members(self, obj):
        members = ProcurementMember.objects.filter(procurement=obj)
        return ", ".join([f"{member.user.username} ({member.role})" for member in members])

    get_members.short_description = "Members and Roles"

from django.contrib import admin
from .models import Procurement, ProcurementMember

# Register Procurement model if not already registered
try:
    admin.site.register(Procurement, ProcurementAdmin)
except admin.sites.AlreadyRegistered:
    pass



# Separate ProcurementMember Admin with improved query
@admin.register(ProcurementMember)
class ProcurementMemberAdmin(admin.ModelAdmin):
    list_display = ('procurement', 'user', 'role')  # Display user role separately
    search_fields = ('procurement__procurement_id', 'user__username')  # Enable search
    list_filter = ('role',)  # Allow filtering by role

    def get_queryset(self, request):
        """ Ensures that ProcurementMembers can be edited while keeping Procurement clean """
        return super().get_queryset(request)

    def has_change_permission(self, request, obj=None):
        """ Allow editing ProcurementMember separately if needed """
        return True

    def has_add_permission(self, request):
        """ Allow adding members from ProcurementMemberAdmin """
        return True




