
from django.urls import reverse
from rest_framework import status
from .test_base import BaseAPITestCase
from api.models import Project, Comment, Document
import tempfile
from django.core.files.uploadedfile import SimpleUploadedFile

class PermissionsTests(BaseAPITestCase):
    """Test cases for API permissions"""
    
    def setUp(self):
        super().setUp()
        
        # Create test projects for different users
        self.admin_project = Project.objects.create(
            title='Admin Project',
            one_line_description='Created by admin',
            description='Description for admin project',
            program='Admin Program',
            start_date='2025-06-01',
            deadline_date='2025-12-31',
            identification_no='ADMIN-12345',
            selected_contractor='Contractor',
            created_by=self.admin_user
        )
        
        self.client_project = Project.objects.create(
            title='Client Project',
            one_line_description='Created by client',
            description='Description for client project',
            program='Client Program',
            start_date='2025-06-01',
            deadline_date='2025-12-31',
            identification_no='CLIENT-12345',
            selected_contractor='Contractor',
            created_by=self.client_user
        )
    
    def test_admin_has_full_access(self):
        """Test that admin users have full access to all projects"""
        # Admin should be able to see all projects
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        url = reverse('project-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)  # At least the two projects we created
        
        # Admin should be able to update any project
        url = reverse('project-detail', kwargs={'pk': self.client_project.id})
        update_data = {'title': 'Updated Client Project'}
        response = self.client.patch(url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Client Project')
    
    def test_client_limited_access(self):
        """Test that client users have limited access"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.client_token.key}')
        
        # Client should only see their own projects
        url = reverse('project-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Client Project')
        
        # Client should be able to update their own project
        url = reverse('project-detail', kwargs={'pk': self.client_project.id})
        update_data = {'title': 'Updated by Client'}
        response = self.client.patch(url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Client shouldn't be able to update status
        url = reverse('project-update-status', kwargs={'pk': self.client_project.id})
        status_data = {'status': 'approved'}
        response = self.client.post(url, status_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Client shouldn't be able to access admin's project
        url = reverse('project-detail', kwargs={'pk': self.admin_project.id})
        response = self.client.get(url)
        
        # This should now fail with a permission error due to our updated get_object method
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_contractor_project_access(self):
        """Test that contractors have appropriate access"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.contractor_token.key}')
        
        # Update admin project to include this contractor
        self.admin_project.selected_contractor = 'Contractor'  # Match first name
        self.admin_project.save()
        
        # Contractor should see assigned projects
        url = reverse('project-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        project_titles = [p['title'] for p in response.data]
        self.assertIn('Admin Project', project_titles)
        
        # Contractor should not be able to update project status
        url = reverse('project-update-status', kwargs={'pk': self.admin_project.id})
        status_data = {'status': 'approved'}
        response = self.client.post(url, status_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_comment_permissions(self):
        """Test permissions for comment management"""
        # Create test comments
        admin_comment = Comment.objects.create(
            project=self.admin_project,
            author='Admin User',
            content='Admin comment',
            role='admin',
            user=self.admin_user
        )
        
        client_comment = Comment.objects.create(
            project=self.client_project,
            author='Client User',
            content='Client comment',
            role='client',
            user=self.client_user
        )
        
        # Admin can update any comment
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        url = reverse('comment-detail', kwargs={'pk': client_comment.id})
        update_data = {'content': 'Updated by admin'}
        response = self.client.patch(url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Client can only update their own comments
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.client_token.key}')
        
        # Update own comment
        url = reverse('comment-detail', kwargs={'pk': client_comment.id})
        update_data = {'content': 'Updated by client'}
        response = self.client.patch(url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Try to update admin's comment
        url = reverse('comment-detail', kwargs={'pk': admin_comment.id})
        update_data = {'content': 'Trying to update admin comment'}
        response = self.client.patch(url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
