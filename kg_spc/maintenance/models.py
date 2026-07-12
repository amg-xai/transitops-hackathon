from django.db import models

class MaintenanceLog(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('closed', 'Closed'),
    ]

    vehicle     = models.ForeignKey('vehicles.Vehicle', on_delete=models.CASCADE, related_name='maintenance_logs')
    description = models.TextField()
    cost        = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    start_date  = models.DateField()
    end_date    = models.DateField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Maintenance on {self.vehicle} — {self.description[:40]}"

    def save(self, *args, **kwargs):
        # Auto-transition: opening a record puts vehicle In Shop
        if self.status == 'active':
            self.vehicle.status = 'in_shop'
            self.vehicle.save()
        super().save(*args, **kwargs)

    def close(self):
        """Close maintenance → restore vehicle to Available (unless Retired)."""
        from django.utils import timezone
        self.status   = 'closed'
        self.end_date = timezone.now().date()
        if self.vehicle.status != 'retired':
            self.vehicle.status = 'available'
            self.vehicle.save()
        self.save()