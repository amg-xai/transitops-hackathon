from django.contrib import admin
from .models import Vehicle, VehicleDocument

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display  = ['registration_number', 'name', 'vehicle_type', 'status', 'max_load_capacity', 'odometer']
    list_filter   = ['status', 'vehicle_type']
    search_fields = ['registration_number', 'name']


@admin.register(VehicleDocument)
class VehicleDocumentAdmin(admin.ModelAdmin):
    list_display = ['vehicle', 'document_type', 'expiry_date', 'uploaded_at']
    list_filter  = ['document_type']