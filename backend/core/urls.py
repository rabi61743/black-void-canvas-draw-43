# backend/core/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.PortView.as_view(), name='port'),
]