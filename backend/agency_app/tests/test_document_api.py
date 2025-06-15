
from django.urls import reverse
from rest_framework import status
import tempfile
import os
from django.core.files.uploadedfile import SimpleUploadedFile
from .test_base import BaseAPITestCase
from api.models import Project, Document

class DocumentAPITests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        
        # Create test projects
        self.admin_project = Project.objects.create(
            title='Admin Test Project',
            one_line_description='Project for testing documents',
            description='Description for testing documents',
            program='Test Program',
            start_date='2025-06-01',
            deadline_date='2025-12-31',
            identification_no='ATP-12345',
            selected_contractor='Contractor',
            created_by=self.admin_user
        )
        
        self.client_project = Project.objects.create(
            title='Client Test Project',
            one_line_description='Client project for testing documents',
            description='Description for client testing documents',
            program='Test Program',
            start_date='2025-06-01',
            deadline_date='2025-12-31',
            identification_no='CTP-12345',
            selected_contractor='Contractor',
            created_by=self.client_user
        )
        
        # Create a test document
        # Create a temporary test file
        self.temp_file = tempfile.NamedTemporaryFile(suffix='.txt', delete=False)
        self.temp_file.write(b'Test document content')
        self.temp_file.close()
        
        with open(self.temp_file.name, 'rb') as file:
            self.document = Document.objects.create(
                project=self.admin_project,
                name='test_document.txt',
                file=SimpleUploadedFile('test_document.txt', file.read())
            )
    
    def tearDown(self):
        # Clean up temporary file
        if os.path.exists(self.temp_file.name):
            os.unlink(self.temp_file.name)
    
    def test_upload_documents(self):
        """Test uploading documents to a project"""
        url = reverse('project-upload-documents', kwargs={'pk': self.admin_project.id})
        
        # Create temporary test file
        temp_file = tempfile.NamedTemporaryFile(suffix='.txt', delete=False)
        temp_file.write(b'New test document content')
        temp_file.close()
        
        try:
            with open(temp_file.name, 'rb') as file:
                upload_file = SimpleUploadedFile('new_test_document.txt', file.read(), content_type='text/plain')
                
                data = {'files': upload_file}
                response = self.client.post(url, data, format='multipart')
                
                self.assertEqual(response.status_code, status.HTTP_201_CREATED)
                self.assertEqual(response.data[0]['name'], 'new_test_document.txt')
        finally:
            # Clean up
            if os.path.exists(temp_file.name):
                os.unlink(temp_file.name)
    
    def test_delete_document(self):
        """Test deleting a document"""
        url = reverse('document-detail', kwargs={'pk': self.document.id})
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Document.objects.count(), 0)
    
    def test_permission_to_delete_document(self):
        """Test permissions for deleting documents"""
        # Create a document for the client project
        temp_file = tempfile.NamedTemporaryFile(suffix='.txt', delete=False)
        temp_file.write(b'Client document content')
        temp_file.close()
        
        try:
            with open(temp_file.name, 'rb') as file:
                client_document = Document.objects.create(
                    project=self.client_project,
                    name='client_document.txt',
                    file=SimpleUploadedFile('client_document.txt', file.read())
                )
                
                # Admin can delete any document
                url = reverse('document-detail', kwargs={'pk': client_document.id})
                response = self.client.delete(url)
                self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
                
                # Recreate the document for client testing
                with open(temp_file.name, 'rb') as file:
                    client_document = Document.objects.create(
                        project=self.client_project,
                        name='client_document.txt',
                        file=SimpleUploadedFile('client_document.txt', file.read())
                    )
                
                # Switch to client user
                self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.client_token.key}')
                
                # Client can delete own document
                url = reverse('document-detail', kwargs={'pk': client_document.id})
                response = self.client.delete(url)
                self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
                
                # Create a document for admin project
                with open(temp_file.name, 'rb') as file:
                    admin_document = Document.objects.create(
                        project=self.admin_project,
                        name='admin_document.txt',
                        file=SimpleUploadedFile('admin_document.txt', file.read())
                    )
                
                # Client should not be able to delete admin's document
                url = reverse('document-detail', kwargs={'pk': admin_document.id})
                response = self.client.delete(url)
                self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        finally:
            # Clean up
            if os.path.exists(temp_file.name):
                os.unlink(temp_file.name)
