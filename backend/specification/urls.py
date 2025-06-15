from django.urls import path
from .views import SpecificationListCreateView, SpecificationDetailView

app_name = 'specification'

urlpatterns = [
    path('specifications/', SpecificationListCreateView.as_view(), name='specification-list-create'),
    path('specifications/<int:pk>/', SpecificationDetailView.as_view(), name='specification-detail'),
]