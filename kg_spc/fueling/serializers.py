from rest_framework import serializers
from .models import FuelLog, Expense
from vehicles.serializers import VehicleListSerializer


class FuelLogSerializer(serializers.ModelSerializer):
    vehicle_name = serializers.CharField(source='vehicle.name', read_only=True)
    vehicle_registration = serializers.CharField(source='vehicle.registration_number', read_only=True)

    class Meta:
        model = FuelLog
        fields = [
            'id', 'vehicle', 'vehicle_name', 'vehicle_registration',
            'trip', 'liters', 'cost', 'date', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class FuelLogListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    vehicle_name = serializers.CharField(source='vehicle.name', read_only=True)
    vehicle_registration = serializers.CharField(source='vehicle.registration_number', read_only=True)

    class Meta:
        model = FuelLog
        fields = [
            'id', 'vehicle', 'vehicle_name', 'vehicle_registration',
            'liters', 'cost', 'date', 'created_at'
        ]


class ExpenseSerializer(serializers.ModelSerializer):
    vehicle_name = serializers.CharField(source='vehicle.name', read_only=True)
    vehicle_registration = serializers.CharField(source='vehicle.registration_number', read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id', 'vehicle', 'vehicle_name', 'vehicle_registration',
            'trip', 'category', 'amount', 'description', 'date', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ExpenseListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    vehicle_name = serializers.CharField(source='vehicle.name', read_only=True)
    vehicle_registration = serializers.CharField(source='vehicle.registration_number', read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id', 'vehicle', 'vehicle_name', 'vehicle_registration',
            'category', 'amount', 'description', 'date', 'created_at'
        ]
