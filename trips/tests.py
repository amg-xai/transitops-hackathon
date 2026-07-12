from datetime import date, timedelta
from django.test import TestCase
from django.core.exceptions import ValidationError
from vehicles.models import Vehicle
from drivers.models import Driver
from .models import Trip


class TripLifecycleTests(TestCase):
    def setUp(self):
        self.vehicle = Vehicle.objects.create(
            registration_number='VAN-05', name='Van 05', vehicle_type='van',
            max_load_capacity=500, acquisition_cost=500000,
        )
        self.driver = Driver.objects.create(
            name='Alex', license_number='DL-100', license_category='LMV',
            license_expiry=date.today() + timedelta(days=200), contact_number='9000000000',
        )

    def _make_trip(self, cargo_weight=450):
        return Trip.objects.create(
            vehicle=self.vehicle, driver=self.driver,
            source='A', destination='B', cargo_weight=cargo_weight, planned_distance=100,
        )

    def test_cargo_weight_within_capacity_allowed(self):
        self._make_trip(450).clean()  # should not raise

    def test_cargo_weight_exceeding_capacity_rejected(self):
        with self.assertRaises(ValidationError):
            self._make_trip(600).clean()

    def test_full_lifecycle_draft_to_dispatch_to_complete(self):
        trip = self._make_trip()
        self.assertEqual(trip.status, 'draft')

        trip.dispatch()
        self.vehicle.refresh_from_db()
        self.driver.refresh_from_db()
        self.assertEqual(trip.status, 'dispatched')
        self.assertEqual(self.vehicle.status, 'on_trip')
        self.assertEqual(self.driver.status, 'on_trip')

        trip.complete(final_odometer=100, fuel_consumed=10, actual_distance=100, revenue=5000)
        self.vehicle.refresh_from_db()
        self.driver.refresh_from_db()
        self.assertEqual(trip.status, 'completed')
        self.assertEqual(self.vehicle.status, 'available')
        self.assertEqual(self.driver.status, 'available')

    def test_dispatch_rejected_for_expired_license(self):
        self.driver.license_expiry = date.today() - timedelta(days=1)
        self.driver.save()
        with self.assertRaises(ValidationError):
            self._make_trip().dispatch()

    def test_dispatch_rejected_for_suspended_driver(self):
        self.driver.status = 'suspended'
        self.driver.save()
        with self.assertRaises(ValidationError):
            self._make_trip().dispatch()

    def test_dispatch_rejected_when_vehicle_already_on_trip(self):
        self.vehicle.status = 'on_trip'
        self.vehicle.save()
        with self.assertRaises(ValidationError):
            self._make_trip().dispatch()

    def test_dispatch_rejected_when_vehicle_in_shop(self):
        self.vehicle.status = 'in_shop'
        self.vehicle.save()
        with self.assertRaises(ValidationError):
            self._make_trip().dispatch()

    def test_cancel_from_dispatched_restores_availability(self):
        trip = self._make_trip()
        trip.dispatch()
        trip.cancel()
        self.vehicle.refresh_from_db()
        self.driver.refresh_from_db()
        self.assertEqual(self.vehicle.status, 'available')
        self.assertEqual(self.driver.status, 'available')

    def test_cannot_dispatch_twice(self):
        trip = self._make_trip()
        trip.dispatch()
        with self.assertRaises(ValidationError):
            trip.dispatch()

    def test_cannot_complete_a_draft_trip(self):
        with self.assertRaises(ValidationError):
            self._make_trip().complete(final_odometer=1, fuel_consumed=1, actual_distance=1)

    def test_cannot_cancel_completed_trip(self):
        trip = self._make_trip()
        trip.dispatch()
        trip.complete(final_odometer=100, fuel_consumed=10, actual_distance=100)
        with self.assertRaises(ValidationError):
            trip.cancel()