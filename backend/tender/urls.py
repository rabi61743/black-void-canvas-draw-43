from django.urls import path
from .views import TenderListCreateView, TenderDetailView

app_name = 'tender'

urlpatterns = [
    path('tenders/', TenderListCreateView.as_view(), name='tender-list-create'),
    path('tenders/<int:pk>/', TenderDetailView.as_view(), name='tender-detail'),
]