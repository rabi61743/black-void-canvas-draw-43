
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from .test_base import BaseAPITestCase

User = get_user_model()

class AuthenticationAPITests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        
        # Test user data
        self.user_data = {
            'email': 'testuser@test.com',
            'password': 'testpassword123',
            'password_confirm': 'testpassword123',
            'first_name': 'Test',
            'last_name': 'User',
            'role': 'client'
        }
    
    def test_register_user(self):
        """Test registering a new user"""
        url = reverse('register')
        response = self.client.post(url, self.user_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='testuser@test.com').exists())
    
    def test_register_with_invalid_data(self):
        """Test registration with invalid data"""
        url = reverse('register')
        # Missing password_confirm
        invalid_data = self.user_data.copy()
        invalid_data.pop('password_confirm')
        
        response = self.client.post(url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Mismatched passwords
        invalid_data = self.user_data.copy()
        invalid_data['password_confirm'] = 'different_password'
        
        response = self.client.post(url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_login_user(self):
        """Test logging in an existing user"""
        url = reverse('login')
        login_data = {
            'email': 'client@test.com',
            'password': 'clientpassword'
        }
        
        response = self.client.post(url, login_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertIn('user_id', response.data)
        self.assertEqual(response.data['email'], 'client@test.com')
    
    def test_login_with_invalid_credentials(self):
        """Test login with invalid credentials"""
        url = reverse('login')
        login_data = {
            'email': 'client@test.com',
            'password': 'wrongpassword'
        }
        
        response = self.client.post(url, login_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_get_current_user(self):
        """Test getting current user information"""
        url = reverse('me')
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.client_token.key}')
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'client@test.com')
        self.assertEqual(response.data['first_name'], 'Client')
    
    def test_logout_user(self):
        """Test logging out a user"""
        url = reverse('logout')
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.client_token.key}')
        
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Token.objects.filter(user=self.client_user).exists())
    
    def test_unauthorized_access(self):
        """Test accessing protected endpoint without authentication"""
        url = reverse('me')
        # No authentication credentials
        self.client.credentials()
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

