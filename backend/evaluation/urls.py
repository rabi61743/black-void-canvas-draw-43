from django.urls import path
from .views import EvaluationListCreateView, EvaluationDetailView

app_name = 'evaluation'

urlpatterns = [
    path('evaluations/', EvaluationListCreateView.as_view(), name='evaluation-list-create'),
    path('evaluations/<int:pk>/', EvaluationDetailView.as_view(), name='evaluation-detail'),
]