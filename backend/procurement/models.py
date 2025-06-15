from django.db import models
from users.models import CustomUser

class QuarterlyTarget(models.Model):
    STATUS_CHOICES = (
        ('Planned', 'Planned'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
    )

    procurement_plan = models.ForeignKey('ProcurementPlan', related_name='quarterly_targets', on_delete=models.CASCADE)
    quarter = models.CharField(max_length=2, choices=[('Q1', 'Q1'), ('Q2', 'Q2'), ('Q3', 'Q3'), ('Q4', 'Q4')])
    target_details = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Planned')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('procurement_plan', 'quarter')

class ProcurementPlan(models.Model):
    # Define the stages of the procurement flow
    STAGE_CHOICES = (
        ('planning', 'Procurement Planning'),
        ('specification', 'Specification Preparation'),
        ('tender', 'Tender Creation & Publication'),
        ('committee', 'Committee Formation'),
        ('bidding', 'Bidding Process'),
        ('evaluation', 'Bid Evaluation'),
        ('contract', 'Contract Award'),
        ('complaint', 'Complaint Handling'),
        ('management', 'Contract Management & Payment'),
    )

    policy_number = models.CharField(max_length=50, unique=True)
    department = models.CharField(max_length=50, choices=[('Wireline', 'Wireline'), ('Wireless', 'Wireless')])
    dept_index = models.CharField(max_length=10)
    project_name = models.CharField(max_length=200)
    project_description = models.TextField()
    estimated_cost = models.DecimalField(max_digits=15, decimal_places=2)
    budget = models.DecimalField(max_digits=15, decimal_places=2)
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    committee = models.ForeignKey('committee.Committee', null=True, blank=True, on_delete=models.SET_NULL)
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='planning')  # Track the current stage

    def proposed_budget_percentage(self):
        if self.estimated_cost > 0:
            return round((float(self.budget) / float(self.estimated_cost)) * 100, 2)
        return 0.0

    def save(self, *args, **kwargs):
        if self.policy_number:
            self.dept_index = self.policy_number.split('-')[-1]
        super().save(*args, **kwargs)



# from django.db import models
# from users.models import CustomUser

# class QuarterlyTarget(models.Model):
#     STATUS_CHOICES = (
#         ('Planned', 'Planned'),
#         ('In Progress', 'In Progress'),
#         ('Completed', 'Completed'),
#     )

#     procurement_plan = models.ForeignKey('ProcurementPlan', related_name='quarterly_targets', on_delete=models.CASCADE)
#     quarter = models.CharField(max_length=2, choices=[('Q1', 'Q1'), ('Q2', 'Q2'), ('Q3', 'Q3'), ('Q4', 'Q4')])
#     target_details = models.TextField(blank=True)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Planned')
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         unique_together = ('procurement_plan', 'quarter')

# class ProcurementPlan(models.Model):
#     policy_number = models.CharField(max_length=50, unique=True)
#     department = models.CharField(max_length=50, choices=[('Wireline', 'Wireline'), ('Wireless', 'Wireless')])
#     dept_index = models.CharField(max_length=10)
#     project_name = models.CharField(max_length=200)
#     project_description = models.TextField()
#     estimated_cost = models.DecimalField(max_digits=15, decimal_places=2)
#     budget = models.DecimalField(max_digits=15, decimal_places=2)
#     owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
#     created_at = models.DateTimeField(auto_now_add=True)
#     committee = models.ForeignKey('committee.Committee', null=True, blank=True, on_delete=models.SET_NULL)

#     def proposed_budget_percentage(self):
#         if self.estimated_cost > 0:
#             return round((float(self.budget) / float(self.estimated_cost)) * 100, 2)
#         return 0.0

#     def save(self, *args, **kwargs):
#         # Extract dept_index from policy_number (e.g., PP-2080-WL-N-01 -> 01)
#         if self.policy_number:
#             self.dept_index = self.policy_number.split('-')[-1]
#         super().save(*args, **kwargs)


