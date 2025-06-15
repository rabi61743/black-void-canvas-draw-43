from django.db import models
from users.models import CustomUser
# class Department(models.Model):
#     name = models.CharField(max_length=100)
#     created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
#     created_at = models.DateTimeField(auto_now_add=True)

from django.db import models
from users.models import CustomUser  # Import from users app
from datetime import datetime

class Procurement(models.Model):
    SAMYOJAK = 'Samyojak'
    SADASYA = 'Sadasya'
    INVITEE = 'Invitee'

    MEMBER_ROLES = [
        (SAMYOJAK, 'Samyojak'),
        (SADASYA, 'Sadasya'),
        (INVITEE, 'Invitee'),
    ]

    procurement_id = models.CharField(max_length=50, unique=True)
    detail = models.TextField()
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="created_procurements")
    members = models.ManyToManyField(CustomUser, through="ProcurementMember")
    date_created = models.DateTimeField(default=datetime.now)
    status = models.CharField(max_length=50, default='Pending')

    def __str__(self):
        return f"Procurement {self.procurement_id} - {self.detail[:20]}"

class ProcurementMember(models.Model):
    procurement = models.ForeignKey(Procurement, on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=Procurement.MEMBER_ROLES)

    class Meta:
        unique_together = ('procurement', 'user')

    def __str__(self):
        return f"{self.user.username} - {self.role} in {self.procurement.procurement_id}"