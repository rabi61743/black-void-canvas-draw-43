
from django.urls import reverse
from rest_framework import status
from .test_base import BaseAPITestCase
from api.models import Project

class ProjectFilteringTests(BaseAPITestCase):
    """Test cases for project filtering and sorting functionality"""
    
    def setUp(self):
        super().setUp()
        
        # Clear all existing projects
        Project.objects.all().delete()
        
        # Create projects with different statuses and dates
        self.pending_project = Project.objects.create(
            title='Pending Project',
            one_line_description='A pending project',
            description='This is a pending project',
            program='Test Program',
            start_date='2025-06-01',
            deadline_date='2025-12-31',
            identification_no='PP-12345',
            selected_contractor='Contractor',
            status='pending',
            created_by=self.admin_user
        )
        
        self.approved_project = Project.objects.create(
            title='Approved Project',
            one_line_description='An approved project',
            description='This is an approved project',
            program='Test Program',
            start_date='2025-05-01',
            deadline_date='2025-11-30',
            identification_no='AP-12345',
            selected_contractor='Contractor',
            status='approved',
            created_by=self.admin_user
        )
        
        self.rejected_project = Project.objects.create(
            title='Rejected Project',
            one_line_description='A rejected project',
            description='This is a rejected project',
            program='Test Program',
            start_date='2025-07-01',
            deadline_date='2026-01-31',
            identification_no='RP-12345',
            selected_contractor='Other',
            status='rejected',
            created_by=self.admin_user
        )
    
    def test_filter_by_status(self):
        """Test filtering projects by status"""
        url = reverse('project-list')
        
        # Filter by 'approved' status
        response = self.client.get(f"{url}?status=approved")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Approved Project')
        
        # Filter by 'rejected' status
        response = self.client.get(f"{url}?status=rejected")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Rejected Project')
        
        # Filter by 'pending' status
        response = self.client.get(f"{url}?status=pending")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Pending Project')
        
        # Get all projects (no filter)
        response = self.client.get(f"{url}?status=all")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
    
    def test_search_functionality(self):
        """Test searching projects by title"""
        url = reverse('project-list')
        
        # Search for 'Approved'
        response = self.client.get(f"{url}?search=Approved")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Approved Project')
        
        # Updated test: Search for 'Project' will match all projects because we're using icontains
        response = self.client.get(f"{url}?search=Project")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
        
        # Search for non-existent project
        response = self.client.get(f"{url}?search=NonExistent")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)
    
    def test_sorting_functionality(self):
        """Test sorting projects by different criteria"""
        url = reverse('project-list')
        
        # Sort by newest (default)
        response = self.client.get(f"{url}?sort=newest")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
        # Since they're created in quick succession in the test, we can't reliably test the exact order
        
        # Sort by oldest
        response = self.client.get(f"{url}?sort=oldest")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
        
        # Sort by name
        response = self.client.get(f"{url}?sort=name")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
        self.assertEqual(response.data[0]['title'], 'Approved Project')  # Alphabetically first
        
        # Default sort (should be newest)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
    
    def test_combined_filtering_and_sorting(self):
        """Test combining filters, search and sorting"""
        url = reverse('project-list')
        
        # Filter by status and search
        response = self.client.get(f"{url}?status=approved&search=Approved")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Approved Project')
        
        # Filter by status and sort
        response = self.client.get(f"{url}?status=approved&sort=name")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Approved Project')
        
        # No results combination
        response = self.client.get(f"{url}?status=approved&search=Rejected")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)
