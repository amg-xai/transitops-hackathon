from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from vehicles.models import Vehicle

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