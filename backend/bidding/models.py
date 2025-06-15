from django.db import models
from tender.models import Tender
from users.models import CustomUser

class Bid(models.Model):
    tender = models.ForeignKey(Tender, on_delete=models.CASCADE, related_name='bids')
    bidder = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    bid_amount = models.DecimalField(max_digits=15, decimal_places=2)
    submission_date = models.DateTimeField(auto_now_add=True)
    documents = models.FileField(upload_to='bids/documents/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=[('submitted', 'Submitted'), ('rejected', 'Rejected'), ('under_review', 'Under Review')], default='submitted')

    class Meta:
        unique_together = ('tender', 'bidder')

    def __str__(self):
        return f"Bid by {self.bidder.username} for {self.tender.title}"