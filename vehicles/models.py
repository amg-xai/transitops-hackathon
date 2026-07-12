from django.conf import settings
from django.db import models

class Vehicle(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('on_trip',   'On Trip'),
        ('in_shop',   'In Shop'),
        ('retired',   'Retired'),
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
    max_load_capacity   = models.DecimalField(max_digits=10, decimal_places=2)
    odometer            = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    acquisition_cost    = models.DecimalField(max_digits=12, decimal_places=2)
    status              = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    region              = models.CharField(max_length=100, blank=True)
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.registration_number} — {self.name}"

    @property
    def is_dispatchable(self):
        return self.status == 'available'


class VehicleDocument(models.Model):
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
        if not self.expiry_date:
            return False
        from django.utils import timezone
        return self.expiry_date < timezone.now().date()

    @property
    def is_expiring_soon(self):
        if not self.expiry_date or self.is_expired:
            return False
        from django.utils import timezone
        return (self.expiry_date - timezone.now().date()).days <= 30