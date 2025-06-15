# backend/users/models.py
import uuid
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, employee_id, email, password=None, **extra_fields):
        if not employee_id:
            raise ValueError('The Employee ID field must be set')
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(employee_id=employee_id, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, employee_id, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(employee_id, email, password, **extra_fields)

class RoleHierarchy(models.Model):
    role_name = models.CharField(max_length=50, unique=True, blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='sub_roles')
    permissions = models.JSONField(default=list, null=True, blank=True)  # Made optional
    def __str__(self):
        return self.role_name or "Unnamed Role"

    def get_all_descendants(self):
        """Get all descendant roles in the hierarchy."""
        descendants = list(self.sub_roles.all())
        for child in self.sub_roles.all():
            descendants.extend(child.get_all_descendants())
        return descendants

    def get_hierarchy(self):
        """Get the role hierarchy path from this role to the root."""
        hierarchy = [self.role_name]
        if self.parent:
            hierarchy.extend(self.parent.get_hierarchy())
        return hierarchy

class CustomUser(AbstractUser):
    _id = models.CharField(max_length=100, unique=True, blank=True)
    employee_id = models.CharField(max_length=10, unique=True, primary_key=True)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=15, blank=True)
    department = models.CharField(max_length=50, blank=True, null=True)
    designation = models.CharField(max_length=100, blank=True, null=True, default="Engineer")
    role = models.ForeignKey(RoleHierarchy, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # For admin access
    otp_enabled = models.BooleanField(default=False)
    permissions = models.JSONField(default=list, null=True, blank=True)  # Made optional    reset_token = models.CharField(max_length=100, blank=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'employee_id'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.employee_id

    def save(self, *args, **kwargs):
        if not self._id:
            self._id = str(uuid.uuid4())
        super().save(*args, **kwargs)

    def get_allowed_roles(self):
        """Get all roles within the user's hierarchy tree."""
        if not self.role:
            return []
        return [self.role] + self.role.get_all_descendants()

class ModuleAccess(models.Model):
    module = models.CharField(max_length=50, unique=True)
    permissions = models.JSONField(default=list)  
    restricted_to = models.JSONField(default=list)  

    def __str__(self):
        return self.module


class EmployeeDetail(models.Model):
    employee_id = models.CharField(max_length=10, unique=True, primary_key=True)
    name = models.CharField(max_length=150, blank=True, null=True)
    email = models.EmailField(unique=True)
    position = models.CharField(max_length=100, blank=True, null=True)
    level = models.CharField(max_length=10, blank=True, null=True)
    service = models.CharField(max_length=50, blank=True, null=True)
    group = models.CharField(max_length=50, blank=True, null=True)
    qualification = models.TextField(blank=True, null=True)
    seniority = models.DateTimeField(blank=True, null=True)
    retirement = models.DateTimeField(blank=True, null=True)
    mno = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return self.employee_id




