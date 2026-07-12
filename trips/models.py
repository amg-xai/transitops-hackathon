"""
Defines the Trip model representing cargo delivery tasks.
Maintains the trip state machine (Draft -> Dispatched -> Completed/Cancelled)
and handles validation of cargo weight constraints and vehicle/driver state sync.
"""
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

class Trip(models.Model):
    """
    Represents a specific haul/trip task. Validates maximum load restrictions
    against the assigned vehicle and manages status transitions of drivers/vehicles.
    """
    STATUS_CHOICES = [
        ('draft',       'Draft'),       # Prepared details, not yet dispatched
        ('dispatched',  'Dispatched'),  # Actively in transit
        ('completed',   'Completed'),   # Finished successfully, stats recorded
        ('cancelled',   'Cancelled'),   # Terminated before or during dispatch
    ]

    vehicle         = models.ForeignKey('vehicles.Vehicle', on_delete=models.PROTECT, related_name='trips')
    driver          = models.ForeignKey('drivers.Driver',   on_delete=models.PROTECT, related_name='trips')
    source          = models.CharField(max_length=200)
    destination     = models.CharField(max_length=200)
    cargo_weight    = models.DecimalField(max_digits=10, decimal_places=2) # Weight in kg
    planned_distance = models.DecimalField(max_digits=10, decimal_places=2) # Estimated distance in km
    actual_distance = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True) # Actual distance in km
    fuel_consumed   = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True) # Fuel used in liters
    final_odometer  = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True) # Ending vehicle odometer
    revenue         = models.DecimalField(max_digits=12, decimal_places=2, default=0) # Total trip payout
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_by      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Trip #{self.pk}: {self.source} → {self.destination}"

    def clean(self):
        """
        Validates that cargo weight does not exceed the vehicle's capacity.
        """
        # Business rule: cargo weight must not exceed vehicle capacity
        if self.vehicle and self.cargo_weight > self.vehicle.max_load_capacity:
            raise ValidationError(
                f"Cargo weight {self.cargo_weight} kg exceeds vehicle capacity {self.vehicle.max_load_capacity} kg."
            )

    def dispatch(self):
        """
        Transitions trip from Draft -> Dispatched.
        - Validates that the vehicle and driver are both dispatchable.
        - Sets both vehicle and driver status to 'on_trip'.
        - Saves the dispatch timestamp and state.
        """
        if self.status != 'draft':
            raise ValidationError("Only Draft trips can be dispatched.")
        if not self.vehicle.is_dispatchable:
            raise ValidationError(f"Vehicle '{self.vehicle}' is not available for dispatch.")
        if not self.driver.is_dispatchable:
            raise ValidationError(f"Driver '{self.driver}' cannot be assigned (expired license or not available).")
        if self.cargo_weight > self.vehicle.max_load_capacity:
            raise ValidationError("Cargo weight exceeds vehicle capacity.")

        # Update and save asset states to lock them
        self.vehicle.status = 'on_trip';  self.vehicle.save()
        self.driver.status  = 'on_trip';  self.driver.save()
        self.status = 'dispatched';       self.save()

    def complete(self, final_odometer, fuel_consumed, actual_distance, revenue=0):
        """
        Transitions trip from Dispatched -> Completed.
        - Records final distance, fuel consumption, odometer, and revenue.
        - Updates vehicle odometer to match the final reading.
        - Restores vehicle and driver status back to 'available'.
        """
        if self.status != 'dispatched':
            raise ValidationError("Only Dispatched trips can be completed.")

        self.final_odometer  = final_odometer
        self.fuel_consumed   = fuel_consumed
        self.actual_distance = actual_distance
        self.revenue         = revenue
        self.status          = 'completed'

        # Sync vehicle stats and restore availability
        self.vehicle.odometer = final_odometer
        self.vehicle.status   = 'available';  self.vehicle.save()
        self.driver.status    = 'available';  self.driver.save()
        self.save()

    def cancel(self):
        """
        Transitions trip from Draft or Dispatched -> Cancelled.
        - If dispatched, releases the vehicle and driver back to 'available'.
        """
        if self.status not in ('draft', 'dispatched'):
            raise ValidationError("Cannot cancel a completed or already cancelled trip.")
        if self.status == 'dispatched':
            # Release assets if the trip was actively running
            self.vehicle.status = 'available';  self.vehicle.save()
            self.driver.status  = 'available';  self.driver.save()
        self.status = 'cancelled';  self.save()