from django.contrib import admin
from .models import Contract

@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ('id', 'bid', 'contract_amount', 'award_date', 'status')
    list_filter = ('status', 'award_date')
    search_fields = ('bid__tender__title', 'bid__bidder__username')
    date_hierarchy = 'award_date'
    readonly_fields = ('award_date',)  # Award date is auto-generated