"""
Defines the Vehicle and VehicleDocument models representing the vehicles in the fleet
and their associated regulatory compliance paperwork (licenses, permits, PUC, etc.).
"""
from django.conf import settings
from django.db import models

class Vehicle(models.Model):
    """
    Represents an active or retired fleet asset. Tracks capacity details
    for cargo safety validations and coordinates availability states.
    """
    STATUS_CHOICES = [
        ('available', 'Available'),  # Ready for trip assignment
        ('on_trip',   'On Trip'),    # Currently dispatched
        ('in_shop',   'In Shop'),    # Undergoing maintenance
        ('retired',   'Retired'),    # Out of service permanently
    ]
    TYPE_CHOICES = [
        ('van',         'Van'),
        ('truck',       'Truck'),
        ('bus',         'Bus'),
        ('car',         'Car'),
        ('motorcycle',  'Motorcycle'),
    ]

    registration_number = models.CharField(max_length=50, unique=True)
    name                = models.CharField(max_length=100)
    vehicle_type        = models.CharField(max_length=50, choices=TYPE_CHOICES)
    max_load_capacity   = models.DecimalField(max_digits=10, decimal_places=2)  # Payload limit in kg
    odometer            = models.DecimalField(max_digits=10, decimal_places=2, default=0) # Total km traveled
    acquisition_cost    = models.DecimalField(max_digits=12, decimal_places=2) # Used to calculate fleet ROI
    status              = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    region              = models.CharField(max_length=100, blank=True) # Fleet dispatch zone
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.registration_number} — {self.name}"

    @property
    def is_dispatchable(self):
        """
        Helper property checks if the vehicle is ready for a new trip dispatch.
        Vehicles in repair (in_shop) or out of service (retired) are excluded.
        """
        return self.status == 'available'


class VehicleDocument(models.Model):
    """
    Represents a compliance document uploaded for a vehicle (RC, insurance, etc.).
    Tracks expirations and notifies managers of expiring documents.
    """
    DOC_TYPE_CHOICES = [
        ('rc',        'Registration Certificate'),
        ('insurance', 'Insurance'),
        ('permit',    'Permit'),
        ('puc',       'Pollution Certificate (PUC)'),
        ('other',     'Other'),
    ]

    vehicle       = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DOC_TYPE_CHOICES, default='other')
    file          = models.FileField(upload_to='vehicle_docs/%Y/%m/')
    expiry_date   = models.DateField(null=True, blank=True)
    uploaded_by   = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    uploaded_at   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_document_type_display()} — {self.vehicle.registration_number}"

    @property
    def is_expired(self):
        """
        Returns True if the document's expiry date has passed.
        """
        if not self.expiry_date:
            return False
        from django.utils import timezone
        return self.expiry_date < timezone.now().date()

    @property
    def is_expiring_soon(self):
        """
        Returns True if the document expires within the next 30 days and is not yet expired.
        """
        if not self.expiry_date or self.is_expired:
            return False
        from django.utils import timezone
        return (self.expiry_date - timezone.now().date()).days <= 30