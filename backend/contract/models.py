from django.db import models
from bidding.models import Bid

class Contract(models.Model):
    bid = models.OneToOneField(Bid, on_delete=models.CASCADE, related_name='contract')
    contract_amount = models.DecimalField(max_digits=15, decimal_places=2)
    award_date = models.DateTimeField(auto_now_add=True)
    contract_document = models.FileField(upload_to='contracts/documents/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=[('awarded', 'Awarded'), ('cancelled', 'Cancelled')], default='awarded')

    def __str__(self):
        return f"Contract for {self.bid}"   