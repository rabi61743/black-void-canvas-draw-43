
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient, APITestCase
from rest_framework.authtoken.models import Token

User = get_user_model()

class BaseAPITestCase(APITestCase):
    """Base test case for API tests with common setup methods."""
    
    def setUp(self):
        # Create test users
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            password='adminpassword',
            first_name='Admin',
            last_name='User',
            role='admin'
        )
        
        self.client_user = User.objects.create_user(
            email='client@test.com',
            password='clientpassword',
            first_name='Client',
            last_name='User',
            role='client'
        )
        
        self.contractor_user = User.objects.create_user(
            email='contractor@test.com',
            password='contractorpassword',
            first_name='Contractor',
            last_name='User',
            role='contractor'
        )
        
        # Create tokens
        self.admin_token, _ = Token.objects.get_or_create(user=self.admin_user)
        self.client_token, _ = Token.objects.get_or_create(user=self.client_user)
        self.contractor_token, _ = Token.objects.get_or_create(user=self.contractor_user)
        
        # Set up API client with admin authentication by default
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
