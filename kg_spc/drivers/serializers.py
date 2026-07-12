from rest_framework import serializers
from .models import Driver


class DriverSerializer(serializers.ModelSerializer):
    is_license_expired = serializers.ReadOnlyField()
    is_dispatchable = serializers.ReadOnlyField()

    class Meta:
        model = Driver
        fields = [
            'id', 'name', 'license_number', 'license_category', 
            'license_expiry', 'contact_number', 'safety_score', 
            'status', 'is_license_expired', 'is_dispatchable', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DriverListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    is_license_expired = serializers.ReadOnlyField()
    is_dispatchable = serializers.ReadOnlyField()

    class Meta:
        model = Driver
        fields = [
            'id', 'name', 'license_number', 'license_category', 
            'license_expiry', 'safety_score', 'status', 
            'is_license_expired', 'is_dispatchable'
        ]
