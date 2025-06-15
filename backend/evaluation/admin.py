from django.contrib import admin
from .models import Evaluation

@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ('id', 'bid', 'committee', 'score', 'evaluation_date', 'status')
    list_filter = ('status', 'evaluation_date')
    search_fields = ('bid__tender__title', 'committee__name', 'bid__bidder__username')
    date_hierarchy = 'evaluation_date'
    readonly_fields = ('evaluation_date',)  # Evaluation date is auto-generated