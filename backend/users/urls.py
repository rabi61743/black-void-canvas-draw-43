# backend/users/urls.py
from django.urls import path
from .views import (
    RegisterView, UserListView, UserProfileView, MeView,
    RoleListView, view_role_hierarchy, RoleCreateView, ForgotPasswordView,
    ResetPasswordView, UserDetailView, EmployeeByIdView, EmployeeDetailListView,
    ValidateEmployeeDetailView, CustomTokenObtainPairView
)

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register/', RegisterView.as_view(), name='register'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<str:employee_id>/', UserDetailView.as_view(), name='user-detail'),
    path('employee/<str:employee_id>/', EmployeeByIdView.as_view(), name='employee-by-id'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('me/', MeView.as_view(), name='me'),
    path('roles/', RoleListView.as_view(), name='role-list'),
    path('roles/create/', RoleCreateView.as_view(), name='role-create'),
    path('role-hierarchy/', view_role_hierarchy, name='role-hierarchy'),
    path('employee-details/', EmployeeDetailListView.as_view(), name='employee-detail-list'),
    path('validate-employee/', ValidateEmployeeDetailView.as_view(), name='validate-employee'),
]


# # backend/users/urls.py
# from django.urls import path
# from .views import (
#     RegisterView, UserListView, UserProfileView, MeView,
#     RoleListView, view_role_hierarchy, RoleCreateView, ForgotPasswordView,
#     ResetPasswordView, UserDetailView, EmployeeByIdView, EmployeeDetailListView, ValidateEmployeeDetailView
# )

# urlpatterns = [
#     path('register/', RegisterView.as_view(), name='register'),
#     path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
#     path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
#     path('users/', UserListView.as_view(), name='user-list'),
#     path('employee/<str:employee_id>/', EmployeeByIdView.as_view(), name='employee-by-id'),
#     path('profile/', UserProfileView.as_view(), name='profile'),
#     path('me/', MeView.as_view(), name='me'),
#     path('roles/', RoleListView.as_view(), name='role-list'),
#     path('roles/create/', RoleCreateView.as_view(), name='role-create'),
#     path('role-hierarchy/', view_role_hierarchy, name='role-hierarchy'),
#     path('employee-details/', EmployeeDetailListView.as_view(), name='employee-detail-list'),
#     path('validate-employee/', ValidateEmployeeDetailView.as_view(), name='validate-employee'),
# ]

