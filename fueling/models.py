from django.db import models

class FuelLog(models.Model):
    vehicle    = models.ForeignKey('vehicles.Vehicle', on_delete=models.CASCADE, related_name='fuel_logs')
    trip       = models.ForeignKey('trips.Trip', on_delete=models.SET_NULL, null=True, blank=True)
    liters     = models.DecimalField(max_digits=10, decimal_places=2)
    cost       = models.DecimalField(max_digits=12, decimal_places=2)
    date       = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.vehicle} — {self.liters}L on {self.date}"


class Expense(models.Model):
    CATEGORY_CHOICES = [
        ('fuel',        'Fuel'),
        ('toll',        'Toll'),
        ('maintenance', 'Maintenance'),
        ('other',       'Other'),
    ]

    vehicle     = models.ForeignKey('vehicles.Vehicle', on_delete=models.CASCADE, related_name='expenses')
    trip        = models.ForeignKey('trips.Trip', on_delete=models.SET_NULL, null=True, blank=True)
    category    = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    amount      = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField(blank=True)
    date        = models.DateField()
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category} — ₹{self.amount} on {self.date}"