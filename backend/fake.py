import os
import django
from faker import Faker
import random

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from users.models import CustomUser, RoleHierarchy

fake = Faker()

# Fetch all roles
roles = list(RoleHierarchy.objects.all())

# Create 20 users
for i in range(1, 21):
    employee_id = f"EMP{i:03}"
    email = f"user{i}@example.com"
    name = fake.name()
    
    # Generate phone number
    phone = fake.phone_number()
    
    # Truncate phone number if it's too long (more than 15 characters)
    phone = phone[:15]  # Ensure it doesn't exceed 15 characters
    
    department = fake.job().split()[0]
    designation = fake.job()
    role = random.choice(roles)

    # Generate a unique username based on employee_id
    username = f"user_{employee_id}"  # Unique username based on employee_id

    user = CustomUser.objects.create_user(
        employee_id=employee_id,
        email=email,
        password="Test@12345",  # Set a default password
        name=name,
        phone=phone,
        department=department,
        designation=designation,
        role=role,
        username=username,  # Explicitly set a unique username
    )

    # Print role hierarchy for the created user
    hierarchy = " -> ".join(role.get_hierarchy()) if role else "No hierarchy"
    print(f"Created user {employee_id} with role {role.role_name}. Hierarchy: {hierarchy}")
