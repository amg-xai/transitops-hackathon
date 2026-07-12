from django.test import TestCase
from django.db import IntegrityError
from .models import Vehicle


class VehicleModelTests(TestCase):
    def setUp(self):
        self.v = Vehicle.objects.create(
            registration_number='TEST-001', name='Test Van', vehicle_type='van',
            max_load_capacity=500, acquisition_cost=500000,
        )

    def test_registration_number_unique(self):
        with self.assertRaises(IntegrityError):
            Vehicle.objects.create(
                registration_number='TEST-001', name='Dup', vehicle_type='van',
                max_load_capacity=500, acquisition_cost=500000,
            )

    def test_is_dispatchable_when_available(self):
        self.assertTrue(self.v.is_dispatchable)

    def test_not_dispatchable_when_in_shop(self):
        self.v.status = 'in_shop'
        self.v.save()
        self.assertFalse(self.v.is_dispatchable)

    def test_not_dispatchable_when_retired(self):
        self.v.status = 'retired'
        self.v.save()
        self.assertFalse(self.v.is_dispatchable)