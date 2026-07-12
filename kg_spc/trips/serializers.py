from rest_framework import serializers
from django.core.exceptions import ValidationError
from .models import Trip
from vehicles.serializers import VehicleListSerializer
from drivers.serializers import DriverListSerializer


class TripSerializer(serializers.ModelSerializer):
    vehicle_name = serializers.CharField(source='vehicle.name', read_only=True)
    vehicle_registration = serializers.CharField(source='vehicle.registration_number', read_only=True)
    driver_name = serializers.CharField(source='driver.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Trip
        fields = [
            'id', 'vehicle', 'driver', 'source', 'destination',
            'cargo_weight', 'planned_distance', 'actual_distance',
            'fuel_consumed', 'final_odometer', 'revenue', 'status',
            'vehicle_name', 'vehicle_registration', 'driver_name',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        # Business rule: cargo weight must not exceed vehicle capacity
        if 'vehicle' in attrs and 'cargo_weight' in attrs:
            if attrs['cargo_weight'] > attrs['vehicle'].max_load_capacity:
                raise serializers.ValidationError(
                    f"Cargo weight {attrs['cargo_weight']} kg exceeds vehicle capacity {attrs['vehicle'].max_load_capacity} kg."
                )
        return attrs


class TripListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    vehicle_name = serializers.CharField(source='vehicle.name', read_only=True)
    vehicle_registration = serializers.CharField(source='vehicle.registration_number', read_only=True)
    driver_name = serializers.CharField(source='driver.name', read_only=True)

    class Meta:
        model = Trip
        fields = [
            'id', 'vehicle', 'vehicle_name', 'vehicle_registration',
            'driver', 'driver_name', 'source', 'destination',
            'cargo_weight', 'planned_distance', 'status', 'created_at'
        ]


class TripDispatchSerializer(serializers.Serializer):
    """Serializer for dispatching a trip"""
    def validate(self, attrs):
        trip = self.context['trip']
        if trip.status != 'draft':
            raise serializers.ValidationError("Only Draft trips can be dispatched.")
        if not trip.vehicle.is_dispatchable:
            raise serializers.ValidationError(f"Vehicle '{trip.vehicle}' is not available for dispatch.")
        if not trip.driver.is_dispatchable:
            raise serializers.ValidationError(f"Driver '{trip.driver}' cannot be assigned (expired license or not available).")
        if trip.cargo_weight > trip.vehicle.max_load_capacity:
            raise serializers.ValidationError("Cargo weight exceeds vehicle capacity.")
        return attrs


class TripCompleteSerializer(serializers.Serializer):
    """Serializer for completing a trip"""
    final_odometer = serializers.DecimalField(max_digits=10, decimal_places=2)
    fuel_consumed = serializers.DecimalField(max_digits=10, decimal_places=2)
    actual_distance = serializers.DecimalField(max_digits=10, decimal_places=2)
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2, default=0)

    def validate(self, attrs):
        trip = self.context['trip']
        if trip.status != 'dispatched':
            raise serializers.ValidationError("Only Dispatched trips can be completed.")
        if attrs['final_odometer'] < trip.vehicle.odometer:
            raise serializers.ValidationError("Final odometer cannot be less than current vehicle odometer.")
        return attrs
