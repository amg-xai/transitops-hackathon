from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('fleet_manager',     'Fleet Manager'),
        ('driver',            'Driver'),
        ('safety_officer',    'Safety Officer'),
        ('financial_analyst', 'Financial Analyst'),
    ]
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='driver')

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"