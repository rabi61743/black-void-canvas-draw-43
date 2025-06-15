# backend/core/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpRequest
from rest_framework.permissions import AllowAny

class PortView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: HttpRequest):
        port = request.META.get('SERVER_PORT', '8000')
        return Response({'port': port}, status=status.HTTP_200_OK)