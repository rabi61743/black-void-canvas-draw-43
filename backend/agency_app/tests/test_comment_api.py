
from django.urls import reverse
from rest_framework import status
import tempfile
import os
from django.core.files.uploadedfile import SimpleUploadedFile
from .test_base import BaseAPITestCase
from api.models import Project, Comment

class CommentAPITests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        
        # Create a test project
        self.project = Project.objects.create(
            title='Comment Test Project',
            one_line_description='Project for testing comments',
            description='Description for testing comments',
            program='Test Program',
            start_date='2025-06-01',
            deadline_date='2025-12-31',
            identification_no='CTP-12345',
            selected_contractor='Contractor',
            created_by=self.admin_user
        )
        
        # Create a test comment
        self.comment = Comment.objects.create(
            project=self.project,
            author='Admin User',
            content='Initial test comment',
            role='admin',
            user=self.admin_user
        )
    
    def test_get_comments(self):
        """Test retrieving comments for a project"""
        url = reverse('project-comments', kwargs={'pk': self.project.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['content'], 'Initial test comment')
    
    def test_create_comment(self):
        """Test creating a new comment"""
        url = reverse('project-comments', kwargs={'pk': self.project.id})
        comment_data = {'content': 'New test comment'}
        
        response = self.client.post(url, comment_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], 'New test comment')
        self.assertEqual(Comment.objects.count(), 2)
    
    def test_update_comment(self):
        """Test updating a comment"""
        url = reverse('comment-detail', kwargs={'pk': self.comment.id})
        updated_data = {'content': 'Updated comment content'}
        
        response = self.client.put(url, updated_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['content'], 'Updated comment content')
        
        # Verify database was updated
        self.comment.refresh_from_db()
        self.assertEqual(self.comment.content, 'Updated comment content')
    
    def test_delete_comment(self):
        """Test deleting a comment"""
        url = reverse('comment-detail', kwargs={'pk': self.comment.id})
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Comment.objects.count(), 0)
    
    def test_user_can_only_update_own_comments(self):
        """Test that users can only update their own comments"""
        # Create a comment by client user
        client_comment = Comment.objects.create(
            project=self.project,
            author='Client User',
            content='Client comment',
            role='client',
            user=self.client_user
        )
        
        url = reverse('comment-detail', kwargs={'pk': client_comment.id})
        updated_data = {'content': 'Trying to update client comment as admin'}
        
        # Admin can update any comment
        response = self.client.put(url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Switch to client user
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.client_token.key}')
        
        # Create an admin comment
        admin_comment = Comment.objects.create(
            project=self.project,
            author='Admin User',
            content='Admin comment',
            role='admin',
            user=self.admin_user
        )
        
        # Client should not be able to update admin's comment
        url = reverse('comment-detail', kwargs={'pk': admin_comment.id})
        updated_data = {'content': 'Trying to update admin comment as client'}
        
        response = self.client.put(url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_create_comment_with_attachments(self):
        """Test creating a comment with file attachments"""
        url = reverse('project-comments-with-attachments', kwargs={'pk': self.project.id})
        
        # Create temporary test file
        temp_file = tempfile.NamedTemporaryFile(suffix='.txt', delete=False)
        temp_file.write(b'Test file content')
        temp_file.close()
        
        try:
            with open(temp_file.name, 'rb') as file:
                upload_file = SimpleUploadedFile('test_attachment.txt', file.read(), content_type='text/plain')
                
                data = {
                    'content': 'Comment with attachment',
                    'files': upload_file
                }
                
                response = self.client.post(url, data, format='multipart')
                
                self.assertEqual(response.status_code, status.HTTP_201_CREATED)
                self.assertEqual(response.data['content'], 'Comment with attachment')
                self.assertTrue(len(response.data['attachments']) > 0)
        finally:
            # Clean up
            if os.path.exists(temp_file.name):
                os.unlink(temp_file.name)
