from django.urls import path
from .views import ProcurementListCreateView, ProcurementDetailView, ProcurementMemberAddView

urlpatterns = [
    path('procurements/', ProcurementListCreateView.as_view(), name='procurement-list'),
    path('procurements/<int:pk>/', ProcurementDetailView.as_view(), name='procurement-detail'),
    path('procurements/add-member/', ProcurementMemberAddView.as_view(), name='procurement-add-member'),
]