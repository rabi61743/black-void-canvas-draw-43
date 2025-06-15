from django.contrib import admin
from .models import Tender

@admin.register(Tender)
class TenderAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'procurement_plan', 'specification', 'publication_date', 'closing_date', 'is_published', 'created_at')
    list_filter = ('is_published', 'publication_date', 'closing_date')
    search_fields = ('title', 'procurement_plan__project_name', 'specification__title')
    date_hierarchy = 'publication_date'
    readonly_fields = ('created_at', 'updated_at')  # These are auto-generated