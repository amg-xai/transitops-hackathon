"""
Defines the MaintenanceLog model for tracking repairs.
Automates vehicle status updates (routing to 'in_shop' when active,
and returning to 'available' when closed).
"""
from django.db import models

class MaintenanceLog(models.Model):
    """
    Represents a specific vehicle workshop visit. Updates vehicle state
    to reflect availability downtime.
    """
    STATUS_CHOICES = [
        ('active', 'Active'),   # Repair currently in progress
        ('closed', 'Closed'),   # Repair completed, vehicle back to operations
    ]

    vehicle     = models.ForeignKey('vehicles.Vehicle', on_delete=models.CASCADE, related_name='maintenance_logs')
    description = models.TextField() # Detailed information on work performed
    cost        = models.DecimalField(max_digits=12, decimal_places=2, default=0) # Expense amount
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    start_date  = models.DateField()
    end_date    = models.DateField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Maintenance on {self.vehicle} — {self.description[:40]}"

    def save(self, *args, **kwargs):
        """
        Overrides save() to automatically transition the vehicle's status
        to 'in_shop' if the maintenance record is created/saved as 'active'.
        Retired vehicles are never overwritten.
        """
        # Auto-transition: opening a record puts vehicle In Shop
        # (unless the vehicle is retired — retired vehicles stay retired)
        if self.status == 'active' and self.vehicle.status != 'retired':
            self.vehicle.status = 'in_shop'
            self.vehicle.save()
        super().save(*args, **kwargs)

    def close(self):
        """
        Transitions maintenance record from 'active' -> 'closed'.
        - Sets the end_date to the current date.
        - Restores vehicle status to 'available' (unless retired).
        """
        from django.utils import timezone
        self.status   = 'closed'
        self.end_date = timezone.now().date()
        if self.vehicle.status != 'retired':
            self.vehicle.status = 'available'
            self.vehicle.save()
        self.save()