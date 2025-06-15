# agency/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, CommentViewSet, DocumentViewSet

router = DefaultRouter()
router.register(r'discussions', ProjectViewSet, basename='discussion')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'documents', DocumentViewSet, basename='document')

app_name = 'agency_app'

urlpatterns = [
    path('', include(router.urls)),
]
