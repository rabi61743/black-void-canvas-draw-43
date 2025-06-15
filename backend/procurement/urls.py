from django.urls import path
from .views import ProcurementPlanListCreateView, ProcurementPlanDetailView

app_name = 'procurement'

urlpatterns = [
    path('plans/', ProcurementPlanListCreateView.as_view(), name='plan-list-create'),
    path('plans/<int:pk>/', ProcurementPlanDetailView.as_view(), name='plan-detail'),
]