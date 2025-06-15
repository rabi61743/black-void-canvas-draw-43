from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from .models import Procurement, ProcurementMember, RoleHierarchy
from .permissions import IsRoleHierarchical, IsProcurementMember

class ProcurementPermissionsTest(APITestCase):
    """
    Test case to check the custom permission logic for procurement access.
    """
    def setUp(self):
        # Create roles
        self.md_role = RoleHierarchy.objects.create(role_name='MD')
        self.cto_role = RoleHierarchy.objects.create(role_name='CTO')
        self.prov_role = RoleHierarchy.objects.create(role_name='Province3')
        self.hetauda_role = RoleHierarchy.objects.create(role_name='Hetauda')

        # Create users with roles
        self.md_user = User.objects.create_user(username='md_user', password='Nepal@123')
        self.md_user.role = self.md_role
        self.md_user.save()

        self.cto_user = User.objects.create_user(username='cto_user', password='Nepal@123')
        self.cto_user.role = self.cto_role
        self.cto_user.save()

        self.bagmati_user = User.objects.create_user(username='bagmati_user', password='Nepal@123')
        self.bagmati_user.role = self.prov_role
        self.bagmati_user.save()

        self.hetauda_user = User.objects.create_user(username='hetauda_user', password='Nepal@123')
        self.hetauda_user.role = self.hetauda_role
        self.hetauda_user.save()

        # Create procurement
        self.procurement_1 = Procurement.objects.create(id=1, created_by=self.hetauda_user)
        self.procurement_4 = Procurement.objects.create(id=4, created_by=self.hetauda_user)

        # Add bagmati_user as invitee to procurement 1
        ProcurementMember.objects.create(user=self.bagmati_user, procurement=self.procurement_1)

    def test_is_role_hierarchical_permission_md_user(self):
        """
        Test for MD user having access to all procurements.
        """
        self.client.force_authenticate(user=self.md_user)
        response = self.client.get(f'/api/procurement/{self.procurement_1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.get(f'/api/procurement/{self.procurement_4.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_is_role_hierarchical_permission_province_user(self):
        """
        Test for Province user trying to access procurement created by Hetauda user.
        """
        self.client.force_authenticate(user=self.bagmati_user)

        # Procurement 1 should be accessible (because bagmati_user is an invitee)
        response = self.client.get(f'/api/procurement/{self.procurement_1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Procurement 4 should be accessible (created by Hetauda user, and bagmati_user is in its hierarchy)
        response = self.client.get(f'/api/procurement/{self.procurement_4.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Trying to access an unauthorized procurement (procurement_id 2)
        response = self.client.get('/api/procurement/2/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_is_procurement_member_permission(self):
        """
        Test if only procurement members can access the procurement details.
        """
        # User is bagmati_user, who is a member of procurement_1
        self.client.force_authenticate(user=self.bagmati_user)
        response = self.client.get(f'/api/procurement/{self.procurement_1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Trying to access a procurement they are not a member of (procurement_4)
        response = self.client.get(f'/api/procurement/{self.procurement_4.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_is_procurement_member_permission_non_member(self):
        """
        Test if non-members are denied access to procurement.
        """
        # A non-member of procurement should not have access
        self.client.force_authenticate(user=self.hetauda_user)
        response = self.client.get(f'/api/procurement/{self.procurement_1.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_is_role_hierarchical_permission_cto_user(self):
        """
        Test for CTO user having access to all procurements.
        """
        self.client.force_authenticate(user=self.cto_user)
        response = self.client.get(f'/api/procurement/{self.procurement_1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.get(f'/api/procurement/{self.procurement_4.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
