"""
Defines the Driver profile model.
Tracks driver identity, license status, safety rating, email contact for reminders, and availability states.
"""
from django.db import models
from django.utils import timezone

class Driver(models.Model):
    """
    Represents a driver profile. Checks availability and license validity
    prior to any trip dispatch assignment.
    """
    STATUS_CHOICES = [
        ('available',  'Available'), # Ready to be assigned to a trip
        ('on_trip',    'On Trip'),    # Currently active on a dispatched trip
        ('off_duty',   'Off Duty'),   # Not working currently
        ('suspended',  'Suspended'),  # Blocked from trip assignment for safety compliance
    ]

    name                   = models.CharField(max_length=100)
    license_number         = models.CharField(max_length=50, unique=True)
    license_category       = models.CharField(max_length=20) # e.g. LMV (Light) or HMV (Heavy)
    license_expiry         = models.DateField()
    contact_number         = models.CharField(max_length=20)
    email                  = models.EmailField(blank=True, help_text="Used for license expiry reminder emails.")
    safety_score           = models.DecimalField(max_digits=4, decimal_places=1, default=10.0) # Scale 0.0 - 10.0
    status                 = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    last_reminder_sent_at  = models.DateTimeField(null=True, blank=True) # Timestamp of last sent email reminder
    created_at             = models.DateTimeField(auto_now_add=True)
    updated_at             = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.license_number})"

    @property
    def is_license_expired(self):
        """
        Helper property returning True if the driver's license expiry date is in the past.
        """
        return self.license_expiry < timezone.now().date()

    @property
    def is_license_expiring_soon(self):
        """
        Returns True if the license expires within the next 30 days and is not yet expired.
        """
        if self.is_license_expired:
            return False
        return (self.license_expiry - timezone.now().date()).days <= 30

    @property
    def is_dispatchable(self):
        """
        A driver is dispatchable only if they are marked 'available', 
        their license is not expired, and they are not suspended.
        """
        return self.status == 'available' and not self.is_license_expired