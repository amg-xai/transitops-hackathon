"""
This module defines the custom User model for the TransitOps system.
It introduces role-based categories to control permissions across the application.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Extends the standard Django User to include specific roles for 
    Fleet Management, Driving, Safety Compliance, and Financial Analysis.
    """
    ROLE_CHOICES = [
        ('fleet_manager',     'Fleet Manager'),     # Full access to all fleet details and CRUD
        ('driver',            'Driver'),            # Authorized to execute and complete trips
        ('safety_officer',    'Safety Officer'),    # Manages driver credentials and license compliance
        ('financial_analyst', 'Financial Analyst'), # Views reports and logs fuel/expense records
    ]
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='driver')

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"