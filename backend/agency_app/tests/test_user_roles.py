
from django.urls import reverse
from rest_framework import status
from .test_base import BaseAPITestCase
from api.models import User, Project, Comment
from rest_framework.authtoken.models import Token

class UserRolesTests(BaseAPITestCase):
    """Test cases for user role permissions"""
    
    def setUp(self):
        super().setUp()
        
        # Create additional test user with manager role
        self.manager_user = User.objects.create_user(
            email='manager@test.com',
            password='managerpassword',
            first_name='Manager',
            last_name='User',
            role='manager'
        )
        # Create token for manager user
        self.manager_token, _ = Token.objects.get_or_create(user=self.manager_user)
        
        # Create test project
        self.test_project = Project.objects.create(
            title='Role Test Project',
            one_line_description='For testing roles',
            description='Description for testing roles',
            program='Role Program',
            start_date='2025-06-01',
            deadline_date='2025-12-31',
            identification_no='ROLE-12345',
            selected_contractor='Contractor',
            status='pending',
            created_by=self.admin_user
        )
    
    def test_admin_permissions(self):
        """Test admin user permissions"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        
        # Admin can update project status
        url = reverse('project-update-status', kwargs={'pk': self.test_project.id})
        status_data = {'status': 'approved'}
        response = self.client.post(url, status_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'approved')
        
        # Admin can view all users
        url = reverse('user-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 4)  # admin, client, contractor, manager
    
    def test_manager_permissions(self):
        """Test manager user permissions"""
        # Create token for manager
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.manager_token.key}')
        
        # Manager can update project status
        url = reverse('project-update-status', kwargs={'pk': self.test_project.id})
        status_data = {'status': 'rejected'}
        response = self.client.post(url, status_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'rejected')
        
        # Manager should not be able to view all users (depends on your implementation)
        url = reverse('user-list')
        response = self.client.get(url)
        
        # This test depends on your implementation, adjust accordingly
        if hasattr(self.manager_user, 'is_staff') and self.manager_user.is_staff:
            self.assertEqual(response.status_code, status.HTTP_200_OK)
        else:
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_client_permissions(self):
        """Test client user permissions"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.client_token.key}')
        
        # Client cannot update project status
        url = reverse('project-update-status', kwargs={'pk': self.test_project.id})
        status_data = {'status': 'approved'}
        response = self.client.post(url, status_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Client cannot access user list
        url = reverse('user-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Client can add comments to visible projects
        # First, make sure the client can see this project
        self.test_project.created_by = self.client_user
        self.test_project.save()
        
        url = reverse('project-comments', kwargs={'pk': self.test_project.id})
        comment_data = {'content': 'Client comment'}
        response = self.client.post(url, comment_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], 'Client comment')
    
    def test_contractor_permissions(self):
        """Test contractor user permissions"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.contractor_token.key}')
        
        # Contractor cannot update project status
        url = reverse('project-update-status', kwargs={'pk': self.test_project.id})
        status_data = {'status': 'approved'}
        response = self.client.post(url, status_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Contractor can add comments to assigned projects
        self.test_project.selected_contractor = 'Contractor'  # Match first name
        self.test_project.save()
        
        url = reverse('project-comments', kwargs={'pk': self.test_project.id})
        comment_data = {'content': 'Contractor comment'}
        response = self.client.post(url, comment_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], 'Contractor comment')
