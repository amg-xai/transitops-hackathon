from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from core.audit import log_action


class Trip(models.Model):
    STATUS_CHOICES = [
        ('draft',       'Draft'),
        ('dispatched',  'Dispatched'),
        ('completed',   'Completed'),
        ('cancelled',   'Cancelled'),
    ]

    vehicle          = models.ForeignKey('vehicles.Vehicle', on_delete=models.PROTECT, related_name='trips')
    driver           = models.ForeignKey('drivers.Driver',   on_delete=models.PROTECT, related_name='trips')
    source           = models.CharField(max_length=200)
    destination      = models.CharField(max_length=200)
    cargo_weight     = models.DecimalField(max_digits=10, decimal_places=2)
    planned_distance = models.DecimalField(max_digits=10, decimal_places=2)
    actual_distance  = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    fuel_consumed    = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    final_odometer   = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    revenue          = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status           = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_by       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Trip #{self.pk}: {self.source} → {self.destination}"

    def clean(self):
        if self.vehicle and self.cargo_weight > self.vehicle.max_load_capacity:
            raise ValidationError(
                f"Cargo weight {self.cargo_weight} kg exceeds vehicle capacity {self.vehicle.max_load_capacity} kg."
            )

    def dispatch(self, user=None):
        if self.status != 'draft':
            raise ValidationError("Only Draft trips can be dispatched.")
        if not self.vehicle.is_dispatchable:
            raise ValidationError(f"Vehicle '{self.vehicle}' is not available for dispatch.")
        if not self.driver.is_dispatchable:
            raise ValidationError(f"Driver '{self.driver}' cannot be assigned (expired license or not available).")
        if self.cargo_weight > self.vehicle.max_load_capacity:
            raise ValidationError("Cargo weight exceeds vehicle capacity.")

        old_v, old_d = self.vehicle.status, self.driver.status
        self.vehicle.status = 'on_trip'; self.vehicle.save()
        self.driver.status  = 'on_trip'; self.driver.save()
        self.status = 'dispatched'; self.save()

        log_action('trip', self.pk, str(self), 'Trip dispatched', 'draft', 'dispatched', user)
        log_action('vehicle', self.vehicle.pk, str(self.vehicle), 'Status changed (trip dispatch)', old_v, 'on_trip', user)
        log_action('driver', self.driver.pk, str(self.driver), 'Status changed (trip dispatch)', old_d, 'on_trip', user)

    def complete(self, final_odometer, fuel_consumed, actual_distance, revenue=0, user=None):
        if self.status != 'dispatched':
            raise ValidationError("Only Dispatched trips can be completed.")

        self.final_odometer  = final_odometer
        self.fuel_consumed   = fuel_consumed
        self.actual_distance = actual_distance
        self.revenue         = revenue
        self.status          = 'completed'

        old_v, old_d = self.vehicle.status, self.driver.status
        self.vehicle.odometer = final_odometer
        self.vehicle.status   = 'available'; self.vehicle.save()
        self.driver.status    = 'available'; self.driver.save()
        self.save()

        log_action('trip', self.pk, str(self), 'Trip completed', 'dispatched', 'completed', user)
        log_action('vehicle', self.vehicle.pk, str(self.vehicle), 'Status changed (trip completed)', old_v, 'available', user)
        log_action('driver', self.driver.pk, str(self.driver), 'Status changed (trip completed)', old_d, 'available', user)

    def cancel(self, user=None):
        if self.status not in ('draft', 'dispatched'):
            raise ValidationError("Cannot cancel a completed or already cancelled trip.")
        old_status = self.status
        if self.status == 'dispatched':
            old_v, old_d = self.vehicle.status, self.driver.status
            self.vehicle.status = 'available'; self.vehicle.save()
            self.driver.status  = 'available'; self.driver.save()
            log_action('vehicle', self.vehicle.pk, str(self.vehicle), 'Status changed (trip cancelled)', old_v, 'available', user)
            log_action('driver', self.driver.pk, str(self.driver), 'Status changed (trip cancelled)', old_d, 'available', user)
        self.status = 'cancelled'; self.save()
        log_action('trip', self.pk, str(self), 'Trip cancelled', old_status, 'cancelled', user)