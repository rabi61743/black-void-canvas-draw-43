from django.urls import path
from .views import BidListCreateView, BidDetailView

app_name = 'bidding'

urlpatterns = [
    path('bids/', BidListCreateView.as_view(), name='bid-list-create'),
    path('bids/<int:pk>/', BidDetailView.as_view(), name='bid-detail'),
]