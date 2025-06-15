from django.db import models
from procurement.models import ProcurementPlan

class Specification(models.Model):
    procurement_plan = models.OneToOneField(ProcurementPlan, on_delete=models.CASCADE, related_name='specification')
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    draft_status = models.BooleanField(default=True)  # True for draft, False for finalized

    class Meta:
        verbose_name = "Specification"
        verbose_name_plural = "Specifications"

    def __str__(self):
        return f"{self.title} - {self.procurement_plan.project_name}"