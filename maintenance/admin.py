from django.contrib import admin
from .models import MaintenanceLog

@admin.register(MaintenanceLog)
class MaintenanceAdmin(admin.ModelAdmin):
    list_display = ['vehicle', 'description', 'status', 'cost', 'start_date', 'end_date']
    list_filter  = ['status']