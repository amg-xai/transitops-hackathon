from rest_framework import serializers
from .models import Vehicle


class VehicleSerializer(serializers.ModelSerializer):
    is_dispatchable = serializers.ReadOnlyField()

    class Meta:
        model = Vehicle
        fields = [
            'id', 'registration_number', 'name', 'vehicle_type', 
            'max_load_capacity', 'odometer', 'acquisition_cost', 
            'status', 'region', 'is_dispatchable', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class VehicleListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    class Meta:
        model = Vehicle
        fields = [
            'id', 'registration_number', 'name', 'vehicle_type', 
            'max_load_capacity', 'status', 'region', 'is_dispatchable'
        ]
