from django.contrib import admin
from .models import Bid

@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ('id', 'tender', 'bidder', 'bid_amount', 'submission_date', 'status')
    list_filter = ('status', 'submission_date')
    search_fields = ('bidder__username', 'tender__title')
    date_hierarchy = 'submission_date'
    readonly_fields = ('submission_date',)  # Submission date is auto-generated