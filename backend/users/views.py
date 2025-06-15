# backend/users/views.py
import uuid
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.core.mail import send_mail
from django.conf import settings
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import RoleHierarchy, CustomUser, EmployeeDetail
from .serializers import (
    RegisterSerializer, UserSerializer, RoleSerializer,
    ForgotPasswordSerializer, ResetPasswordSerializer, EmployeeByIdSerializer,
    CustomTokenObtainPairSerializer, EmployeeDetailSerializer
)

logger = logging.getLogger(__name__)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.role or request.user.role.role_name != 'SUPERADMIN':
            return Response(
                {"detail": "Only SUPERADMIN users can register new users."},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.role or user.role.role_name != 'SUPERADMIN':
            return CustomUser.objects.none()
        return CustomUser.objects.all()

class EmployeeByIdView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, employee_id):
        logger.debug(f"EmployeeByIdView called for employee_id: {employee_id}")
        try:
            user = CustomUser.objects.get(employee_id__iexact=employee_id)
            serializer = EmployeeByIdSerializer(user)
            return Response(
                {"status": "success", "data": {"user": serializer.data}},
                status=status.HTTP_200_OK
            )
        except CustomUser.DoesNotExist:
            logger.error(f"Employee not found for ID: {employee_id}")
            return Response(
                {"status": "error", "message": f"Employee not found for ID: {employee_id}"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}", exc_info=True)
            return Response(
                {"status": "error", "message": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, employee_id):
        if not request.user.role or request.user.role.role_name != 'SUPERADMIN':
            return Response(
                {'detail': 'Only SUPERADMIN users can access this endpoint.'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            user = CustomUser.objects.get(employee_id=employee_id)
            serializer = UserSerializer(user)
            return Response({"status": "success", "data": serializer.data}, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, employee_id):
        if not request.user.role or request.user.role.role_name != 'SUPERADMIN':
            return Response(
                {'detail': 'Only SUPERADMIN users can update users.'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            user = CustomUser.objects.get(employee_id=employee_id)
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({"status": "success", "data": serializer.data}, status=status.HTTP_200_OK)
            return Response({"status": "error", "message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except CustomUser.DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, employee_id):
        if not request.user.role or request.user.role.role_name != 'SUPERADMIN':
            return Response(
                {'detail': 'Only SUPERADMIN users can delete users.'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            user = CustomUser.objects.get(employee_id=employee_id)
            user.delete()
            return Response({"status": "success", "message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except CustomUser.DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class RoleListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = RoleHierarchy.objects.all()
    serializer_class = RoleSerializer

class RoleCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.role or request.user.role.role_name != 'SUPERADMIN':
            return Response({'error': 'Only SUPERADMIN can create roles.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = RoleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def view_role_hierarchy(request):
    roles = RoleHierarchy.objects.all()
    hierarchy = {role.role_name: [] for role in roles}
    for role in roles:
        if role.parent:
            parent_name = role.parent.role_name
            hierarchy[parent_name].append(role.role_name)
    for parent in hierarchy:
        hierarchy[parent].sort()
    return JsonResponse(hierarchy)

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = CustomUser.objects.get(email=email)
                reset_token = str(uuid.uuid4())
                user.reset_token = reset_token
                user.save()
                reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
                send_mail(
                    'Password Reset Request',
                    f'Click the link to reset your password: {reset_link}',
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False,
                )
                return Response({'message': 'Password reset email sent.'}, status=status.HTTP_200_OK)
            except CustomUser.DoesNotExist:
                return Response({'detail': 'User with this email does not exist.'}, status=status.HTTP_404_NOT_FOUND)
            except Exception:
                return Response({'detail': 'Failed to send reset email.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            password = serializer.validated_data['password']
            try:
                user = CustomUser.objects.get(reset_token=token)
                user.set_password(password)
                user.reset_token = None
                user.save()
                return Response({'message': 'Password reset successful.'}, status=status.HTTP_200_OK)
            except CustomUser.DoesNotExist:
                return Response({'detail': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmployeeDetailListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        employees = EmployeeDetail.objects.all()
        serializer = EmployeeDetailSerializer(employees, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ValidateEmployeeDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        employee_id = request.data.get('employee_id')
        email = request.data.get('email')
        if not employee_id or not email:
            return Response(
                {'detail': 'employee_id and email are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            EmployeeDetail.objects.get(employee_id=employee_id, email=email)
            return Response({'valid': True}, status=status.HTTP_200_OK)
        except EmployeeDetail.DoesNotExist:
            return Response(
                {'detail': 'No matching EmployeeDetail found'},
                status=status.HTTP_404_NOT_FOUND
            )



# # backend/users/views.py
# import uuid
# import logging
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status, generics
# from rest_framework.permissions import AllowAny, IsAuthenticated
# from django.core.mail import send_mail
# from django.conf import settings
# from django.http import JsonResponse
# from rest_framework_simplejwt.views import TokenObtainPairView
# from .models import RoleHierarchy, CustomUser
# from .serializers import (
#     RegisterSerializer, UserSerializer, RoleSerializer,
#     ForgotPasswordSerializer, ResetPasswordSerializer, EmployeeByIdSerializer,
#     CustomTokenObtainPairSerializer
# )

# logger = logging.getLogger(__name__)

# class CustomTokenObtainPairView(TokenObtainPairView):
#     serializer_class = CustomTokenObtainPairSerializer

# class RegisterView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         if not request.user.role or request.user.role.role_name != 'SUPERADMIN':
#             return Response(
#                 {"detail": "Only SUPERADMIN users can register new users."},
#                 status=status.HTTP_403_FORBIDDEN
#             )
#         serializer = RegisterSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class UserProfileView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         serializer = UserSerializer(request.user)
#         return Response(serializer.data)

# class MeView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         serializer = UserSerializer(request.user)
#         return Response(serializer.data)

# class UserListView(generics.ListAPIView):
#     serializer_class = UserSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user
#         if user.role and user.role.role_name == 'SUPERADMIN':
#             return CustomUser.objects.all()
#         allowed_roles = user.get_allowed_roles()
#         return CustomUser.objects.filter(role__in=allowed_roles)

# class EmployeeByIdView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, employee_id):
#         logger.debug(f"EmployeeByIdView called for employee_id: {employee_id}")
#         logger.debug(f"Authenticated user: {request.user}")

#         try:
#             user = CustomUser.objects.get(employee_id__iexact=employee_id)
#             serializer = EmployeeByIdSerializer(user)
#             return Response(
#                 {"status": "success", "data": {"user": serializer.data}},
#                 status=status.HTTP_200_OK
#             )
#         except CustomUser.DoesNotExist:
#             logger.error(f"Employee not found for ID: {employee_id}")
#             return Response(
#                 {"status": "error", "message": f"Employee not found for ID: {employee_id}"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Unexpected error in EmployeeByIdView: {str(e)}", exc_info=True)
#             return Response(
#                 {"status": "error", "message": "Internal server error"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class UserDetailView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, userId):
#         try:
#             user = CustomUser.objects.get(employee_id=userId)
#             if not request.user.get_allowed_roles() or user.role in request.user.get_allowed_roles():
#                 serializer = UserSerializer(user)
#                 return Response(serializer.data)
#             return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
#         except CustomUser.DoesNotExist:
#             return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

#     def patch(self, request, userId):
#         try:
#             user = CustomUser.objects.get(employee_id=userId)
#             if not request.user.get_allowed_roles() or user.role in request.user.get_allowed_roles():
#                 serializer = UserSerializer(user, data=request.data, partial=True)
#                 if serializer.is_valid():
#                     serializer.save()
#                     return Response(serializer.data)
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#             return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
#         except CustomUser.DoesNotExist:
#             return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

#     def delete(self, request, userId):
#         try:
#             user = CustomUser.objects.get(employee_id=userId)
#             if not request.user.get_allowed_roles() or user.role in request.user.get_allowed_roles():
#                 user.delete()
#                 return Response(status=status.HTTP_204_NO_CONTENT)
#             return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
#         except CustomUser.DoesNotExist:
#             return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

# class RoleListView(generics.ListAPIView):
#     permission_classes = [IsAuthenticated]
#     queryset = RoleHierarchy.objects.all()
#     serializer_class = RoleSerializer

# class RoleCreateView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         if not request.user.is_authenticated or not request.user.role or request.user.role.role_name != 'SUPERADMIN':
#             return Response({'error': 'Only SUPERADMIN can create roles.'}, status=status.HTTP_403_FORBIDDEN)
#         serializer = RoleSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# def view_role_hierarchy(request):
#     roles = RoleHierarchy.objects.all()
#     hierarchy = {role.role_name: [] for role in roles}
#     for role in roles:
#         if role.parent:
#             parent_name = role.parent.role_name
#             hierarchy[parent_name].append(role.role_name)
#     for parent in hierarchy:
#         hierarchy[parent].sort()
#     return JsonResponse(hierarchy)

# class ForgotPasswordView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         serializer = ForgotPasswordSerializer(data=request.data)
#         if serializer.is_valid():
#             email = serializer.validated_data['email']
#             try:
#                 user = CustomUser.objects.get(email=email)
#                 reset_token = str(uuid.uuid4())
#                 user.reset_token = reset_token
#                 user.save()
#                 reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
#                 send_mail(
#                     'Password Reset Request',
#                     f'Click the link to reset your password: {reset_link}',
#                     settings.DEFAULT_FROM_EMAIL,
#                     [email],
#                     fail_silently=False,
#                 )
#                 return Response({'message': 'Password reset email sent.'}, status=status.HTTP_200_OK)
#             except CustomUser.DoesNotExist:
#                 return Response({'detail': 'User with this email does not exist.'}, status=status.HTTP_404_NOT_FOUND)
#             except Exception:
#                 return Response({'detail': 'Failed to send reset email.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class ResetPasswordView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         serializer = ResetPasswordSerializer(data=request.data)
#         if serializer.is_valid():
#             token = serializer.validated_data['token']
#             password = serializer.validated_data['password']
#             try:
#                 user = CustomUser.objects.get(reset_token=token)
#                 user.set_password(password)
#                 user.reset_token = None
#                 user.save()
#                 return Response({'message': 'Password reset successful.'}, status=status.HTTP_200_OK)
#             except CustomUser.DoesNotExist:
#                 return Response({'detail': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# from .models import EmployeeDetail
# from .serializers import EmployeeDetailSerializer

# class EmployeeDetailListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         employees = EmployeeDetail.objects.all()
#         serializer = EmployeeDetailSerializer(employees, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)
    
# # backend/users/views.py (append to existing file)
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated
# from .models import EmployeeDetail

# class ValidateEmployeeDetailView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         employee_id = request.data.get('employee_id')
#         email = request.data.get('email')
#         if not employee_id or not email:
#             return Response(
#                 {'detail': 'employee_id and email are required'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         try:
#             EmployeeDetail.objects.get(employee_id=employee_id, email=email)
#             return Response({'valid': True}, status=status.HTTP_200_OK)
#         except EmployeeDetail.DoesNotExist:
#             return Response(
#                 {'detail': 'No matching EmployeeDetail found'},
#                 status=status.HTTP_404_NOT_FOUND
#             )    