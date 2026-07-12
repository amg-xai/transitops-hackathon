from django.conf import settings
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


class AuditLog(models.Model):
    ENTITY_CHOICES = [
        ('vehicle', 'Vehicle'),
        ('driver', 'Driver'),
        ('trip', 'Trip'),
        ('maintenance', 'Maintenance'),
    ]
    entity_type  = models.CharField(max_length=20, choices=ENTITY_CHOICES)
    entity_id    = models.PositiveIntegerField()
    entity_label = models.CharField(max_length=200, blank=True)
    action       = models.CharField(max_length=200)
    old_value    = models.CharField(max_length=100, blank=True)
    new_value    = models.CharField(max_length=100, blank=True)
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    timestamp    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.timestamp:%Y-%m-%d %H:%M}] {self.get_entity_type_display()} #{self.entity_id}: {self.action}"