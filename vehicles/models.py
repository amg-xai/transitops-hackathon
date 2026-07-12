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
    max_load_capacity   = models.DecimalField(max_digits=10, decimal_places=2)  # kg
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