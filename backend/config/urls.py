# backend/config/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import CustomTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),  # Corrected to users.urls
    path('agency_app/', include('agency_app.urls')),
    path('api/committee/', include('committee.urls')),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/procurement/', include('procurement.urls', namespace='procurement')),
    path('specification/', include('specification.urls', namespace='specification')),
    path('tender/', include('tender.urls', namespace='tender')),
    path('bidding/', include('bidding.urls', namespace='bidding')),
    path('evaluation/', include('evaluation.urls', namespace='evaluation')),
    path('contract/', include('contract.urls', namespace='contract')),
    path('api/port/', include('core.urls')),  # Add port endpoint
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# from django.contrib import admin
# from django.urls import path, include
# from django.conf import settings
# from django.conf.urls.static import static
# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('api/users/', include('users.urls')),
#     path('agency_app/', include('agency_app.urls')),
#     path('api/committee/', include('committee.urls')),
#     path('api/users/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
#     path('api/users/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
#     path('api/procurement/', include('procurement.urls', namespace='procurement')),

# ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

