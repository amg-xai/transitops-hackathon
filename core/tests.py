from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from vehicles.models import Vehicle
from .models import AuditLog
from .audit import log_action

User = get_user_model()


class RBACTests(TestCase):
    def setUp(self):
        self.client = Client()
        User.objects.create_user(username='fm', password='pass1234', role='fleet_manager')
        User.objects.create_user(username='drv', password='pass1234', role='driver')

    def test_driver_cannot_add_vehicle(self):
        self.client.login(username='drv', password='pass1234')
        self.client.post(reverse('vehicle_add'), {
            'registration_number': 'X-1', 'name': 'X', 'vehicle_type': 'van',
            'max_load_capacity': 100, 'acquisition_cost': 1000,
        })
        self.assertFalse(Vehicle.objects.filter(registration_number='X-1').exists())

    def test_fleet_manager_can_add_vehicle(self):
        self.client.login(username='fm', password='pass1234')
        self.client.post(reverse('vehicle_add'), {
            'registration_number': 'X-2', 'name': 'X', 'vehicle_type': 'van',
            'max_load_capacity': 100, 'acquisition_cost': 1000,
        })
        self.assertTrue(Vehicle.objects.filter(registration_number='X-2').exists())

    def test_anonymous_redirected_to_login(self):
        response = self.client.get(reverse('vehicle_list'))
        self.assertEqual(response.status_code, 302)
        self.assertIn('/accounts/login/', response.url)


class InputValidationTests(TestCase):
    """Proves the app degrades gracefully on bad input instead of throwing a raw 500."""
    def setUp(self):
        self.client = Client()
        User.objects.create_user(username='fm', password='pass1234', role='fleet_manager')
        self.client.login(username='fm', password='pass1234')

    def test_missing_required_field_does_not_crash(self):
        response = self.client.post(reverse('vehicle_add'), {
            'registration_number': '', 'name': 'X', 'vehicle_type': 'van',
            'max_load_capacity': 100, 'acquisition_cost': 1000,
        })
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Vehicle.objects.filter(name='X').exists())

    def test_non_numeric_capacity_does_not_crash(self):
        response = self.client.post(reverse('vehicle_add'), {
            'registration_number': 'BAD-1', 'name': 'X', 'vehicle_type': 'van',
            'max_load_capacity': 'not-a-number', 'acquisition_cost': 1000,
        })
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Vehicle.objects.filter(registration_number='BAD-1').exists())

    def test_negative_capacity_rejected(self):
        response = self.client.post(reverse('vehicle_add'), {
            'registration_number': 'NEG-1', 'name': 'X', 'vehicle_type': 'van',
            'max_load_capacity': -50, 'acquisition_cost': 1000,
        })
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Vehicle.objects.filter(registration_number='NEG-1').exists())


class AuditLogTests(TestCase):
    def test_log_action_creates_entry(self):
        log_action('vehicle', 1, 'TEST-001', 'Vehicle registered')
        self.assertEqual(AuditLog.objects.count(), 1)
        entry = AuditLog.objects.first()
        self.assertEqual(entry.entity_type, 'vehicle')

    def test_vehicle_creation_writes_audit_entry(self):
        User.objects.create_user(username='fm2', password='pass1234', role='fleet_manager')
        self.client.login(username='fm2', password='pass1234')
        self.client.post(reverse('vehicle_add'), {
            'registration_number': 'AUD-1', 'name': 'Audit Van', 'vehicle_type': 'van',
            'max_load_capacity': 500, 'acquisition_cost': 100000,
        })
        self.assertTrue(AuditLog.objects.filter(entity_type='vehicle', entity_label__icontains='AUD-1').exists())