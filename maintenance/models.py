from django.db import models, transaction
from django.utils import timezone
from core.audit import log_action
from vehicles.models import Vehicle


class MaintenanceLog(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('closed', 'Closed'),
    ]

    vehicle     = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='maintenance_logs')
    description = models.TextField()
    cost        = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', db_index=True)
    start_date  = models.DateField()
    end_date    = models.DateField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Maintenance on {self.vehicle} — {self.description[:40]}"

    def save(self, *args, **kwargs):
        with transaction.atomic():
            if self.status == 'active' and self.vehicle_id:
                vehicle = Vehicle.objects.select_for_update().get(pk=self.vehicle_id)
                if vehicle.status != 'retired':
                    vehicle.status = 'in_shop'
                    vehicle.save()
            super().save(*args, **kwargs)

    def close(self, user=None):
        with transaction.atomic():
            log = MaintenanceLog.objects.select_for_update().get(pk=self.pk)
            vehicle = Vehicle.objects.select_for_update().get(pk=log.vehicle_id)

            log.status = 'closed'
            log.end_date = timezone.now().date()
            old_v_status = vehicle.status
            if vehicle.status != 'retired':
                vehicle.status = 'available'
                vehicle.save()
            log.save()

            log_action('maintenance', log.pk, str(log), 'Maintenance closed', 'active', 'closed', user)
            if old_v_status != vehicle.status:
                log_action('vehicle', vehicle.pk, str(vehicle), 'Status changed (maintenance closed)', old_v_status, vehicle.status, user)
        self.refresh_from_db()