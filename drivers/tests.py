from datetime import date, timedelta
from django.test import TestCase
from django.db import IntegrityError
from .models import Driver


class DriverModelTests(TestCase):
    def setUp(self):
        self.d = Driver.objects.create(
            name='Test Driver', license_number='LIC-001', license_category='LMV',
            license_expiry=date.today() + timedelta(days=100), contact_number='9999999999',
        )

    def test_license_number_unique(self):
        with self.assertRaises(IntegrityError):
            Driver.objects.create(
                name='Dup', license_number='LIC-001', license_category='LMV',
                license_expiry=date.today() + timedelta(days=100), contact_number='8888888888',
            )

    def test_dispatchable_when_available_and_valid_license(self):
        self.assertTrue(self.d.is_dispatchable)

    def test_not_dispatchable_when_license_expired(self):
        self.d.license_expiry = date.today() - timedelta(days=1)
        self.d.save()
        self.assertTrue(self.d.is_license_expired)
        self.assertFalse(self.d.is_dispatchable)

    def test_not_dispatchable_when_suspended(self):
        self.d.status = 'suspended'
        self.d.save()
        self.assertFalse(self.d.is_dispatchable)