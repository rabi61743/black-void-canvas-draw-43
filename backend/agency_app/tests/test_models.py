
from django.test import TestCase
from api.models import User, Project, Document, Comment
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
import tempfile
import os
from datetime import date

class UserModelTests(TestCase):
    def test_create_user(self):
        """Test creating a normal user"""
        user = User.objects.create_user(
            email='test@example.com',
            password='testpassword',
            first_name='Test',
            last_name='User',
            role='client'
        )
        
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.role, 'client')
        self.assertTrue(user.check_password('testpassword'))
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
    
    def test_create_superuser(self):
        """Test creating a superuser"""
        admin = User.objects.create_superuser(
            email='admin@example.com',
            password='adminpassword',
            first_name='Admin',
            last_name='User'
        )
        
        self.assertEqual(admin.email, 'admin@example.com')
        self.assertEqual(admin.role, 'admin')
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
    
    def test_email_required(self):
        """Test that email is required"""
        with self.assertRaises(ValueError):
            User.objects.create_user(email='', password='testpassword')

class ProjectModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword',
            first_name='Test',
            last_name='User',
            role='client'
        )
        
        self.project_data = {
            'title': 'Test Project',
            'one_line_description': 'A short description',
            'description': 'A detailed description',
            'program': 'Test Program',
            'start_date': date(2025, 6, 1),
            'deadline_date': date(2025, 12, 31),
            'identification_no': 'TP-12345',
            'selected_contractor': 'Test Contractor',
            'remarks': 'Test remarks',
            'created_by': self.user
        }
    
    def test_create_project(self):
        """Test creating a project"""
        project = Project.objects.create(**self.project_data)
        
        self.assertEqual(project.title, 'Test Project')
        self.assertEqual(project.status, 'pending')  # default status
        self.assertEqual(project.created_by, self.user)
    
    def test_project_str_method(self):
        """Test the string representation of a project"""
        project = Project.objects.create(**self.project_data)
        self.assertEqual(str(project), 'Test Project')

class DocumentModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword'
        )
        
        self.project = Project.objects.create(
            title='Test Project',
            one_line_description='A short description',
            description='A detailed description',
            program='Test Program',
            start_date=date(2025, 6, 1),
            deadline_date=date(2025, 12, 31),
            identification_no='TP-12345',
            selected_contractor='Test Contractor',
            remarks='Test remarks',
            created_by=self.user
        )
        
        # Create temporary test file
        self.temp_file = tempfile.NamedTemporaryFile(suffix='.txt', delete=False)
        self.temp_file.write(b'Test document content')
        self.temp_file.close()
    
    def tearDown(self):
        # Clean up temporary file
        if os.path.exists(self.temp_file.name):
            os.unlink(self.temp_file.name)
    
    def test_create_document(self):
        """Test creating a document"""
        with open(self.temp_file.name, 'rb') as file:
            document = Document.objects.create(
                project=self.project,
                name='test_document.txt',
                file=SimpleUploadedFile('test_document.txt', file.read())
            )
            
            self.assertEqual(document.name, 'test_document.txt')
            self.assertEqual(document.project, self.project)
            self.assertTrue(document.file)
    
    def test_document_str_method(self):
        """Test the string representation of a document"""
        with open(self.temp_file.name, 'rb') as file:
            document = Document.objects.create(
                project=self.project,
                name='test_document.txt',
                file=SimpleUploadedFile('test_document.txt', file.read())
            )
            
            expected_str = f"test_document.txt - {self.project.title}"
            self.assertEqual(str(document), expected_str)

class CommentModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword',
            first_name='Test',
            last_name='User',
            role='client'
        )
        
        self.project = Project.objects.create(
            title='Test Project',
            one_line_description='A short description',
            description='A detailed description',
            program='Test Program',
            start_date=date(2025, 6, 1),
            deadline_date=date(2025, 12, 31),
            identification_no='TP-12345',
            selected_contractor='Test Contractor',
            remarks='Test remarks',
            created_by=self.user
        )
    
    def test_create_comment(self):
        """Test creating a comment"""
        comment = Comment.objects.create(
            project=self.project,
            author='Test User',
            content='Test comment content',
            role='client',
            user=self.user
        )
        
        self.assertEqual(comment.content, 'Test comment content')
        self.assertEqual(comment.project, self.project)
        self.assertEqual(comment.user, self.user)
    
    def test_comment_str_method(self):
        """Test the string representation of a comment"""
        comment = Comment.objects.create(
            project=self.project,
            author='Test User',
            content='Test comment content',
            role='client',
            user=self.user
        )
        
        expected_str = f"Comment by Test User on {self.project.title}"
        self.assertEqual(str(comment), expected_str)
