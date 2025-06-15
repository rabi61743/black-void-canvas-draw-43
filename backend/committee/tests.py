from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from users.models import CustomUser, RoleHierarchy
from .models import CommitteeTask, SpecificationReview, Committee, CommitteeMembership
from django.urls import reverse
import json

class CommitteeAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create a superadmin role
        self.superadmin_role = RoleHierarchy.objects.create(role_name='SUPERADMIN')
        
        # Create a regular role
        self.md_role = RoleHierarchy.objects.create(role_name='MD')
        
        # Create users with provided credentials
        self.superadmin = CustomUser.objects.create_superuser(
            employee_id='admin',
            email='superadmin@gmail.com',
            password='Nepal@123',
            role=self.superadmin_role
        )
        self.user = CustomUser.objects.create_user(
            employee_id='7778',
            email='susmitasharmapaudel@gmail.com',
            password='Nepal@123',
            role=self.md_role
        )
        
        # Authenticate as superadmin for setup
        self.client.force_authenticate(user=self.superadmin)

    def test_create_committee_task(self):
        url = '/api/committee/tasks/'
        data = {
            'title': 'Test Task',
            'description': 'Task description',
            'assigned_to_id': '7778',
            'due_date': '2025-05-01',
            'status': 'pending',
            'attachments': ['file1.pdf'],
            'comments': [{'text': 'Initial comment'}]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CommitteeTask.objects.count(), 1)
        self.assertEqual(CommitteeTask.objects.first().title, 'Test Task')

    def test_list_committee_tasks(self):
        CommitteeTask.objects.create(
            title='Task 1',
            description='Desc',
            assigned_to=self.user,
            due_date='2025-05-01',
            status='pending'
        )
        url = '/api/committee/tasks/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_specification_review(self):
        committee = Committee.objects.create(
            name='Test Committee',
            formation_date='2025-04-01',
            purpose='Test purpose',
            specification_submission_date='2025-04-15',
            specification_status='draft',
            approval_status='draft',
            created_by=self.superadmin
        )
        url = '/api/committee/reviews/'
        data = {
            'committee': committee.id,
            'scheduled_date': '2025-05-01',
            'status': 'draft',
            'reviewer_ids': ['7778'],
            'documents': ['doc1.pdf'],
            'comments': [{'text': 'Review comment'}]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(SpecificationReview.objects.count(), 1)

    def test_create_committee(self):
        url = '/api/committee/committees/'
        data = {
            'name': 'New Committee',
            'formation_date': '2025-04-01',
            'purpose': 'Test committee purpose',
            'specification_submission_date': '2025-04-15',
            'specification_status': 'draft',
            'approval_status': 'draft',
            'task_ids': []
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Committee.objects.count(), 1)
        self.assertEqual(Committee.objects.first().created_by, self.superadmin)

    def test_committee_permission(self):
        # Create a committee as superadmin
        committee = Committee.objects.create(
            name='Restricted Committee',
            formation_date='2025-04-01',
            purpose='Restricted purpose',
            specification_submission_date='2025-04-15',
            specification_status='draft',
            approval_status='draft',
            created_by=self.superadmin
        )
        
        # Verify the committee exists
        print(f"Created committee ID: {committee.id}")
        self.assertTrue(Committee.objects.filter(id=committee.id).exists())
        
        # Switch to regular user
        self.client.force_authenticate(user=self.user)
        url = f'/api/committee/committees/{committee.id}/'
        
        # Regular user should not have access unless member or creator
        response = self.client.get(url)
        print(f"URL: {url}, Status: {response.status_code}, Content: {response.content}")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Add user as member
        CommitteeMembership.objects.create(
            user=self.user,
            committee=committee,
            committee_role='member'
        )
        response = self.client.get(url)
        print(f"URL: {url}, Status: {response.status_code}, Content: {response.content}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_committee_membership(self):
        committee = Committee.objects.create(
            name='Test Committee',
            formation_date='2025-04-01',
            purpose='Test purpose',
            specification_submission_date='2025-04-15',
            specification_status='draft',
            approval_status='draft',
            created_by=self.superadmin
        )
        url = '/api/committee/members/'  # Updated to match 'members' from urls.py
        data = {
            'user_id': '7778',
            'committee': committee.id,
            'committee_role': 'member'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CommitteeMembership.objects.count(), 1)

    def tearDown(self):
        self.client.force_authenticate(user=None)