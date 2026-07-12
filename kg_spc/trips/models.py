from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

class Trip(models.Model):
    STATUS_CHOICES = [
        ('draft',       'Draft'),
        ('dispatched',  'Dispatched'),
        ('completed',   'Completed'),
        ('cancelled',   'Cancelled'),
    ]

    vehicle         = models.ForeignKey('vehicles.Vehicle', on_delete=models.PROTECT, related_name='trips')
    driver          = models.ForeignKey('drivers.Driver',   on_delete=models.PROTECT, related_name='trips')
    source          = models.CharField(max_length=200)
    destination     = models.CharField(max_length=200)
    cargo_weight    = models.DecimalField(max_digits=10, decimal_places=2)
    planned_distance = models.DecimalField(max_digits=10, decimal_places=2)
    actual_distance = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    fuel_consumed   = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    final_odometer  = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    revenue         = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_by      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Trip #{self.pk}: {self.source} → {self.destination}"

    def clean(self):
        # Business rule: cargo weight must not exceed vehicle capacity
        if self.vehicle and self.cargo_weight > self.vehicle.max_load_capacity:
            raise ValidationError(
                f"Cargo weight {self.cargo_weight} kg exceeds vehicle capacity {self.vehicle.max_load_capacity} kg."
            )

    def dispatch(self):
        """Draft → Dispatched. Validates and flips statuses."""
        if self.status != 'draft':
            raise ValidationError("Only Draft trips can be dispatched.")
        if not self.vehicle.is_dispatchable:
            raise ValidationError(f"Vehicle '{self.vehicle}' is not available for dispatch.")
        if not self.driver.is_dispatchable:
            raise ValidationError(f"Driver '{self.driver}' cannot be assigned (expired license or not available).")
        if self.cargo_weight > self.vehicle.max_load_capacity:
            raise ValidationError("Cargo weight exceeds vehicle capacity.")

        self.vehicle.status = 'on_trip';  self.vehicle.save()
        self.driver.status  = 'on_trip';  self.driver.save()
        self.status = 'dispatched';       self.save()

    def complete(self, final_odometer, fuel_consumed, actual_distance, revenue=0):
        """Dispatched → Completed. Restores statuses."""
        if self.status != 'dispatched':
            raise ValidationError("Only Dispatched trips can be completed.")

        self.final_odometer  = final_odometer
        self.fuel_consumed   = fuel_consumed
        self.actual_distance = actual_distance
        self.revenue         = revenue
        self.status          = 'completed'

        self.vehicle.odometer = final_odometer
        self.vehicle.status   = 'available';  self.vehicle.save()
        self.driver.status    = 'available';  self.driver.save()
        self.save()

    def cancel(self):
        """Dispatched/Draft → Cancelled. Restores statuses if dispatched."""
        if self.status not in ('draft', 'dispatched'):
            raise ValidationError("Cannot cancel a completed or already cancelled trip.")
        if self.status == 'dispatched':
            self.vehicle.status = 'available';  self.vehicle.save()
            self.driver.status  = 'available';  self.driver.save()
        self.status = 'cancelled';  self.save()