from rest_framework import serializers
from .models import MaintenanceLog
from vehicles.serializers import VehicleListSerializer


class MaintenanceLogSerializer(serializers.ModelSerializer):
    vehicle_name = serializers.CharField(source='vehicle.name', read_only=True)
    vehicle_registration = serializers.CharField(source='vehicle.registration_number', read_only=True)

    class Meta:
        model = MaintenanceLog
        fields = [
            'id', 'vehicle', 'vehicle_name', 'vehicle_registration',
            'description', 'cost', 'status', 'start_date', 'end_date',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class MaintenanceLogListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    vehicle_name = serializers.CharField(source='vehicle.name', read_only=True)
    vehicle_registration = serializers.CharField(source='vehicle.registration_number', read_only=True)

    class Meta:
        model = MaintenanceLog
        fields = [
            'id', 'vehicle', 'vehicle_name', 'vehicle_registration',
            'description', 'cost', 'status', 'start_date', 'created_at'
        ]
