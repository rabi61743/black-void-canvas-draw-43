from django.urls import reverse
from rest_framework import status
from .test_base import BaseAPITestCase
from api.models import Project

class ProjectAPITests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        
        # Sample project data
        self.project_data = {
            'title': 'Test Project',
            'one_line_description': 'A short description of the project',
            'description': 'This is a detailed description of the test project',
            'program': 'Test Program',
            'start_date': '2025-06-01',
            'deadline_date': '2025-12-31',
            'identification_no': 'TP-12345',
            'selected_contractor': 'Contractor',
            'remarks': 'Test remarks'
        }
        
        # Create a test project
        self.project = Project.objects.create(
            **self.project_data,
            status='pending',
            created_by=self.admin_user
        )
    
    def test_create_project(self):
        """Test creating a new project"""
        url = reverse('project-list')
        new_project_data = {
            'title': 'New Test Project',
            'one_line_description': 'A short description of the new project',
            'description': 'This is a detailed description of the new test project',
            'program': 'New Test Program',
            'start_date': '2025-07-01',
            'deadline_date': '2026-01-31',
            'identification_no': 'NTP-12345',
            'selected_contractor': 'Contractor',
            'remarks': 'New test remarks'
        }
        
        response = self.client.post(url, new_project_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Test Project')
        self.assertTrue(Project.objects.filter(title='New Test Project').exists())
        
        # Verify created_by field is set
        created_project = Project.objects.get(title='New Test Project')
        self.assertEqual(created_project.created_by, self.admin_user)
    
    def test_get_projects(self):
        """Test retrieving projects list"""
        url = reverse('project-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Test Project')
    
    def test_get_project_detail(self):
        """Test retrieving a single project details"""
        url = reverse('project-detail', kwargs={'pk': self.project.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Project')
        self.assertEqual(response.data['status'], 'pending')
    
    def test_update_project(self):
        """Test updating a project"""
        url = reverse('project-detail', kwargs={'pk': self.project.id})
        updated_data = {
            'title': 'Updated Test Project',
            'one_line_description': 'Updated short description',
            'description': 'Updated detailed description',
            'program': 'Updated Program',
            'start_date': '2025-08-01',
            'deadline_date': '2026-02-28',
            'identification_no': 'UTP-12345',
            'selected_contractor': 'Updated Contractor',
            'remarks': 'Updated remarks'
        }
        
        response = self.client.put(url, updated_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Test Project')
        
        # Verify database was updated
        self.project.refresh_from_db()
        self.assertEqual(self.project.title, 'Updated Test Project')
        self.assertEqual(self.project.identification_no, 'UTP-12345')
    
    def test_update_project_status(self):
        """Test updating a project's status"""
        url = reverse('project-update-status', kwargs={'pk': self.project.id})
        status_data = {'status': 'approved'}
        
        response = self.client.post(url, status_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'approved')
        
        # Verify database was updated
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, 'approved')
    
    def test_filter_projects_by_status(self):
        """Test filtering projects by status"""
        # Create projects with different statuses
        Project.objects.create(
            title='Approved Project',
            one_line_description='This is approved',
            description='Description',
            program='Program',
            start_date='2025-06-01',
            deadline_date='2025-12-31',
            identification_no='AP-12345',
            selected_contractor='Contractor',
            status='approved',
            created_by=self.admin_user
        )
        
        url = reverse('project-list')
        response = self.client.get(f"{url}?status=approved")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Approved Project')
        self.assertEqual(response.data[0]['status'], 'approved')
    
    def test_search_projects(self):
        """Test searching projects by title"""
        # Create a project with a specific title to search for
        Project.objects.create(
            title='Searchable Project',
            one_line_description='This can be searched',
            description='Description',
            program='Program',
            start_date='2025-06-01',
            deadline_date='2025-12-31',
            identification_no='SP-12345',
            selected_contractor='Contractor',
            created_by=self.admin_user
        )
        
        url = reverse('project-list')
        response = self.client.get(f"{url}?search=Searchable")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Searchable Project')
    
    def test_client_can_only_see_own_projects(self):
        """Test that clients can only see projects they created"""
        # Create a project owned by the client
        client_project = Project.objects.create(
            title='Client Project',
            one_line_description='Created by client',
            description='Description',
            program='Program',
            start_date='2025-06-01',
            deadline_date='2025-12-31',
            identification_no='CP-12345',
            selected_contractor='Contractor',
            created_by=self.client_user
        )
        
        # Authenticate as client
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.client_token.key}')
        
        url = reverse('project-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Client Project')
    
    def test_contractor_can_only_see_assigned_projects(self):
        """Test that contractors can only see projects assigned to them"""
        # First, clear any existing projects
        Project.objects.all().delete()
        
        # Create a project assigned to the contractor
        contractor_project = Project.objects.create(
            title='Contractor Project',
            one_line_description='Assigned to contractor',
            description='Description',
            program='Program',
            start_date='2025-06-01',
            deadline_date='2025-12-31',
            identification_no='CP-12345',
            selected_contractor='Contractor',  # This should match exactly with the contractor's first name
            created_by=self.admin_user
        )
        
        # Create another project with a different contractor
        other_project = Project.objects.create(
            title='Other Project',
            one_line_description='Not assigned to our contractor',
            description='Description',
            program='Program',
            start_date='2025-06-01',
            deadline_date='2025-12-31',
            identification_no='OP-12345',
            selected_contractor='OtherContractor',
            created_by=self.admin_user
        )
        
        # Authenticate as contractor
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.contractor_token.key}')
        
        url = reverse('project-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Contractor Project')
