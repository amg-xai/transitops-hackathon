from django.db import models
from django.utils import timezone

class Driver(models.Model):
    STATUS_CHOICES = [
        ('available',  'Available'),
        ('on_trip',    'On Trip'),
        ('off_duty',   'Off Duty'),
        ('suspended',  'Suspended'),
    ]

    name                   = models.CharField(max_length=100)
    license_number         = models.CharField(max_length=50, unique=True)
    license_category       = models.CharField(max_length=20)
    license_expiry         = models.DateField()
    contact_number         = models.CharField(max_length=20)
    email                  = models.EmailField(blank=True, help_text="Used for license expiry reminder emails.")
    safety_score           = models.DecimalField(max_digits=4, decimal_places=1, default=10.0)
    status                 = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    last_reminder_sent_at  = models.DateTimeField(null=True, blank=True)
    created_at             = models.DateTimeField(auto_now_add=True)
    updated_at             = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.license_number})"

    @property
    def is_license_expired(self):
        return self.license_expiry < timezone.now().date()

    @property
    def is_license_expiring_soon(self):
        """Within 30 days, but not already expired."""
        if self.is_license_expired:
            return False
        return (self.license_expiry - timezone.now().date()).days <= 30

    @property
    def is_dispatchable(self):
        return self.status == 'available' and not self.is_license_expired