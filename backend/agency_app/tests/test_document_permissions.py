
import os
import tempfile
from django.urls import reverse
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from .test_base import BaseAPITestCase
from api.models import Project, Document

class DocumentPermissionsTests(BaseAPITestCase):
    """Test cases for document upload and management permissions"""
    
    def setUp(self):
        super().setUp()
        
        # Create test projects
        self.admin_project = Project.objects.create(
            title='Admin Document Project',
            one_line_description='For document tests',
            description='Description for document tests',
            program='Doc Program',
            start_date='2025-06-01',
            deadline_date='2025-12-31',
            identification_no='ADOC-12345',
            selected_contractor='Contractor',
            created_by=self.admin_user
        )
        
        self.client_project = Project.objects.create(
            title='Client Document Project',
            one_line_description='For client document tests',
            description='Description for client document tests',
            program='Client Doc Program',
            start_date='2025-06-01',
            deadline_date='2025-12-31',
            identification_no='CDOC-12345',
            selected_contractor='Contractor',
            created_by=self.client_user
        )
        
        # Create a temporary test file
        self.temp_file = tempfile.NamedTemporaryFile(suffix='.txt', delete=False)
        self.temp_file.write(b'Test document content')
        self.temp_file.close()
    
    def tearDown(self):
        # Clean up temporary file
        if os.path.exists(self.temp_file.name):
            os.unlink(self.temp_file.name)
        super().tearDown()
    
    def test_document_upload_permissions(self):
        """Test permissions for document uploads"""
        # Admin should be able to upload to any project
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        
        with open(self.temp_file.name, 'rb') as file:
            upload_file = SimpleUploadedFile('admin_doc.txt', file.read(), content_type='text/plain')
            url = reverse('project-upload-documents', kwargs={'pk': self.admin_project.id})
            response = self.client.post(url, {'files': upload_file}, format='multipart')
            
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        with open(self.temp_file.name, 'rb') as file:
            upload_file = SimpleUploadedFile('admin_doc_client_project.txt', file.read(), content_type='text/plain')
            url = reverse('project-upload-documents', kwargs={'pk': self.client_project.id})
            response = self.client.post(url, {'files': upload_file}, format='multipart')
            
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Client should be able to upload to their own project
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.client_token.key}')
        
        with open(self.temp_file.name, 'rb') as file:
            upload_file = SimpleUploadedFile('client_doc.txt', file.read(), content_type='text/plain')
            url = reverse('project-upload-documents', kwargs={'pk': self.client_project.id})
            response = self.client.post(url, {'files': upload_file}, format='multipart')
            
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Client should not be able to upload to admin's project
        with open(self.temp_file.name, 'rb') as file:
            upload_file = SimpleUploadedFile('client_doc_admin_project.txt', file.read(), content_type='text/plain')
            url = reverse('project-upload-documents', kwargs={'pk': self.admin_project.id})
            response = self.client.post(url, {'files': upload_file}, format='multipart')
            
            # With our update to get_object(), this should now fail with a permission error
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_document_deletion_permissions(self):
        """Test permissions for document deletion"""
        # Create documents for both projects
        with open(self.temp_file.name, 'rb') as file:
            admin_doc = Document.objects.create(
                project=self.admin_project,
                name='admin_document.txt',
                file=SimpleUploadedFile('admin_document.txt', file.read())
            )
        
        with open(self.temp_file.name, 'rb') as file:
            client_doc = Document.objects.create(
                project=self.client_project,
                name='client_document.txt',
                file=SimpleUploadedFile('client_document.txt', file.read())
            )
        
        # Admin should be able to delete any document
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        
        url = reverse('document-detail', kwargs={'pk': admin_doc.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Create another admin doc for further tests
        with open(self.temp_file.name, 'rb') as file:
            admin_doc = Document.objects.create(
                project=self.admin_project,
                name='admin_document2.txt',
                file=SimpleUploadedFile('admin_document2.txt', file.read())
            )
        
        # Client should be able to delete their own document
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.client_token.key}')
        
        url = reverse('document-detail', kwargs={'pk': client_doc.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Client should not be able to delete admin's document
        url = reverse('document-detail', kwargs={'pk': admin_doc.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_comment_with_attachment(self):
        """Test creating comments with attachments"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        
        url = reverse('project-comments-with-attachments', kwargs={'pk': self.admin_project.id})
        
        with open(self.temp_file.name, 'rb') as file:
            upload_file = SimpleUploadedFile('comment_attachment.txt', file.read(), content_type='text/plain')
            
            data = {
                'content': 'Comment with attachment',
                'files': upload_file
            }
            
            response = self.client.post(url, data, format='multipart')
            
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(response.data['content'], 'Comment with attachment')
            self.assertTrue(len(response.data['attachments']) > 0)
