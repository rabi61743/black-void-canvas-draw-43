from django.db import models
from bidding.models import Bid
from committee.models import Committee

class Evaluation(models.Model):
    bid = models.OneToOneField(Bid, on_delete=models.CASCADE, related_name='evaluation')
    committee = models.ForeignKey(Committee, on_delete=models.CASCADE, related_name='evaluations')
    score = models.FloatField()
    comments = models.TextField()
    evaluation_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[('approved', 'Approved'), ('rejected', 'Rejected'), ('pending', 'Pending')], default='pending')

    def __str__(self):
        return f"Evaluation of {self.bid} by {self.committee.name}"