# committee/models.py
from django.db import models
from users.models import CustomUser
from procurement.models import ProcurementPlan
from django.utils import timezone

class Committee(models.Model):
    COMMITTEE_TYPES = [
        ('specification', 'Specification'),
        ('evaluation', 'Evaluation'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=255)
    purpose = models.TextField()
    committee_type = models.CharField(max_length=50, choices=COMMITTEE_TYPES)
    procurement_plan = models.ForeignKey(
        ProcurementPlan,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='committees'
    )
    formation_date = models.DateField(null=True, blank=True)
    specification_submission_date = models.DateField(null=True, blank=True)
    review_date = models.DateField(null=True, blank=True)
    schedule = models.TextField(null=True, blank=True)
    should_notify = models.BooleanField(default=False)
    formation_letter = models.FileField(upload_to='formation_letters/', null=True, blank=True)
    approval_status = models.CharField(max_length=50, default='active')
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='created_committees')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deadline = models.DateField(null=True, blank=True)  # New field for deadline

    def __str__(self):
        return self.name

class CommitteeMembership(models.Model):
    COMMITTEE_ROLES = [
        ('member', 'Member'),
        ('chairperson', 'Chairperson'),
        ('secretary', 'Secretary'),
    ]

    committee = models.ForeignKey(Committee, related_name='memberships', on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    committee_role = models.CharField(max_length=50, choices=COMMITTEE_ROLES, default='member')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('committee', 'user')

    def __str__(self):
        return f"{self.user.username} - {self.committee.name} ({self.committee_role})"


# from django.db import models
# from users.models import CustomUser
# from procurement.models import ProcurementPlan

# class Committee(models.Model):
#     COMMITTEE_TYPES = (
#         ('specification', 'Specification'),
#         ('evaluation', 'Evaluation'),
#         ('other', 'Other'),
#     )

#     name = models.CharField(max_length=255)
#     purpose = models.TextField()
#     committee_type = models.CharField(max_length=50, choices=COMMITTEE_TYPES, default='other')
#     procurement_plan = models.ForeignKey(
#         ProcurementPlan,
#         on_delete=models.CASCADE,
#         related_name='committees',
#         null=True,  # Allow null for existing records
#         blank=True  # Allow blank in forms
#     )
#     formation_date = models.DateField(null=True, blank=True)
#     specification_submission_date = models.DateField(null=True, blank=True)
#     review_date = models.DateField(null=True, blank=True)
#     schedule = models.CharField(max_length=255, blank=True, null=True)
#     created_by = models.ForeignKey(
#         CustomUser,
#         on_delete=models.CASCADE,
#         related_name='created_committees'
#     )
#     formation_letter = models.FileField(upload_to='committees/formation_letters/', blank=True, null=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     should_notify = models.BooleanField(default=False)

#     class Meta:
#         ordering = ['-created_at']

#     def __str__(self):
#         return self.name

# class CommitteeMembership(models.Model):
#     COMMITTEE_ROLES = (
#         ('chairperson', 'Chairperson'),
#         ('secretary', 'Secretary'),
#         ('member', 'Member'),
#     )
#     committee = models.ForeignKey(Committee, on_delete=models.CASCADE, related_name='memberships')
#     user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='committee_memberships')
#     committee_role = models.CharField(max_length=20, choices=COMMITTEE_ROLES, default='member')

#     class Meta:
#         unique_together = ['committee', 'user']

#     def __str__(self):
#         return f"{self.user.employee_id} - {self.committee_role} in {self.committee.name}"


##############################
# from django.db import models
# from users.models import CustomUser

# class Committee(models.Model):
#     name = models.CharField(max_length=255)
#     purpose = models.TextField()
#     formation_date = models.DateField(null=True, blank=True)  # Allow null
#     specification_submission_date = models.DateField(null=True, blank=True)  # Allow null
#     review_date = models.DateField(null=True, blank=True)  # Allow null
#     schedule = models.CharField(max_length=255, blank=True, null=True)
#     created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='created_committees')
#     formation_letter = models.FileField(upload_to='committees/formation_letters/', blank=True, null=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     should_notify = models.BooleanField(default=False)

#     class Meta:
#         ordering = ['-created_at']

#     def __str__(self):
#         return self.name

# class CommitteeMembership(models.Model):
#     COMMITTEE_ROLES = (
#         ('chairperson', 'Chairperson'),
#         ('secretary', 'Secretary'),
#         ('member', 'Member'),
#     )
#     committee = models.ForeignKey(Committee, on_delete=models.CASCADE, related_name='memberships')
#     user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='committee_memberships')
#     committee_role = models.CharField(max_length=20, choices=COMMITTEE_ROLES, default='member')

#     class Meta:
#         unique_together = ['committee', 'user']

#     def __str__(self):
#         return f"{self.user.username} - {self.committee_role} in {self.committee.name}"

