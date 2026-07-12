from django.db import models, transaction
from django.conf import settings
from django.core.exceptions import ValidationError
from core.audit import log_action
from vehicles.models import Vehicle
from drivers.models import Driver


class Trip(models.Model):
    STATUS_CHOICES = [
        ('draft',       'Draft'),
        ('dispatched',  'Dispatched'),
        ('completed',   'Completed'),
        ('cancelled',   'Cancelled'),
    ]

    vehicle          = models.ForeignKey(Vehicle, on_delete=models.PROTECT, related_name='trips')
    driver           = models.ForeignKey(Driver, on_delete=models.PROTECT, related_name='trips')
    source           = models.CharField(max_length=200)
    destination      = models.CharField(max_length=200)
    cargo_weight     = models.DecimalField(max_digits=10, decimal_places=2)
    planned_distance = models.DecimalField(max_digits=10, decimal_places=2)
    actual_distance  = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    fuel_consumed    = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    final_odometer   = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    revenue          = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status           = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', db_index=True)
    created_by       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at       = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at       = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Trip #{self.pk}: {self.source} → {self.destination}"

    def clean(self):
        if self.vehicle and self.cargo_weight > self.vehicle.max_load_capacity:
            raise ValidationError(
                f"Cargo weight {self.cargo_weight} kg exceeds vehicle capacity {self.vehicle.max_load_capacity} kg."
            )

    def dispatch(self, user=None):
        """
        Draft -> Dispatched. Locks the trip, vehicle, and driver rows for the
        duration of this transaction so two concurrent dispatch attempts on
        the same vehicle/driver can't both succeed (fully enforced on
        Postgres/MySQL; SQLite has no row-level locking, so this degrades to
        relying on SQLite's own file-level write serialization).
        """
        with transaction.atomic():
            trip = Trip.objects.select_for_update().get(pk=self.pk)
            vehicle = Vehicle.objects.select_for_update().get(pk=trip.vehicle_id)
            driver = Driver.objects.select_for_update().get(pk=trip.driver_id)

            if trip.status != 'draft':
                raise ValidationError("Only Draft trips can be dispatched.")
            if not vehicle.is_dispatchable:
                raise ValidationError(f"Vehicle '{vehicle}' is not available for dispatch.")
            if not driver.is_dispatchable:
                raise ValidationError(f"Driver '{driver}' cannot be assigned (expired license or not available).")
            if trip.cargo_weight > vehicle.max_load_capacity:
                raise ValidationError("Cargo weight exceeds vehicle capacity.")

            old_v, old_d = vehicle.status, driver.status
            vehicle.status = 'on_trip'; vehicle.save()
            driver.status = 'on_trip'; driver.save()
            trip.status = 'dispatched'; trip.save()

            log_action('trip', trip.pk, str(trip), 'Trip dispatched', 'draft', 'dispatched', user)
            log_action('vehicle', vehicle.pk, str(vehicle), 'Status changed (trip dispatch)', old_v, 'on_trip', user)
            log_action('driver', driver.pk, str(driver), 'Status changed (trip dispatch)', old_d, 'on_trip', user)
        self.refresh_from_db()

    def complete(self, final_odometer, fuel_consumed, actual_distance, revenue=0, user=None):
        with transaction.atomic():
            trip = Trip.objects.select_for_update().get(pk=self.pk)
            vehicle = Vehicle.objects.select_for_update().get(pk=trip.vehicle_id)
            driver = Driver.objects.select_for_update().get(pk=trip.driver_id)

            if trip.status != 'dispatched':
                raise ValidationError("Only Dispatched trips can be completed.")

            trip.final_odometer = final_odometer
            trip.fuel_consumed = fuel_consumed
            trip.actual_distance = actual_distance
            trip.revenue = revenue
            trip.status = 'completed'

            old_v, old_d = vehicle.status, driver.status
            vehicle.odometer = final_odometer
            vehicle.status = 'available'; vehicle.save()
            driver.status = 'available'; driver.save()
            trip.save()

            log_action('trip', trip.pk, str(trip), 'Trip completed', 'dispatched', 'completed', user)
            log_action('vehicle', vehicle.pk, str(vehicle), 'Status changed (trip completed)', old_v, 'available', user)
            log_action('driver', driver.pk, str(driver), 'Status changed (trip completed)', old_d, 'available', user)
        self.refresh_from_db()

    def cancel(self, user=None):
        with transaction.atomic():
            trip = Trip.objects.select_for_update().get(pk=self.pk)
            if trip.status not in ('draft', 'dispatched'):
                raise ValidationError("Cannot cancel a completed or already cancelled trip.")
            old_status = trip.status
            if trip.status == 'dispatched':
                vehicle = Vehicle.objects.select_for_update().get(pk=trip.vehicle_id)
                driver = Driver.objects.select_for_update().get(pk=trip.driver_id)
                old_v, old_d = vehicle.status, driver.status
                vehicle.status = 'available'; vehicle.save()
                driver.status = 'available'; driver.save()
                log_action('vehicle', vehicle.pk, str(vehicle), 'Status changed (trip cancelled)', old_v, 'available', user)
                log_action('driver', driver.pk, str(driver), 'Status changed (trip cancelled)', old_d, 'available', user)
            trip.status = 'cancelled'; trip.save()
            log_action('trip', trip.pk, str(trip), 'Trip cancelled', old_status, 'cancelled', user)
        self.refresh_from_db()