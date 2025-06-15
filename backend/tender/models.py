from django.db import models
from procurement.models import ProcurementPlan
from specification.models import Specification

class Tender(models.Model):
    procurement_plan = models.OneToOneField(ProcurementPlan, on_delete=models.CASCADE, related_name='tender')
    specification = models.OneToOneField(Specification, on_delete=models.CASCADE, related_name='tender', null=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    publication_date = models.DateTimeField()
    closing_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Tender"
        verbose_name_plural = "Tenders"

    def __str__(self):
        return f"{self.title} - {self.procurement_plan.project_name}"