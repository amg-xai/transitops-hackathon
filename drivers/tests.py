from datetime import date, timedelta
from django.test import TestCase
from django.core import mail
from django.db import IntegrityError
from django.core.management import call_command
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
        self.assertFalse(self.d.is_dispatchable)

    def test_not_dispatchable_when_suspended(self):
        self.d.status = 'suspended'
        self.d.save()
        self.assertFalse(self.d.is_dispatchable)

    def test_is_license_expiring_soon_within_window(self):
        self.d.license_expiry = date.today() + timedelta(days=15)
        self.d.save()
        self.assertTrue(self.d.is_license_expiring_soon)

    def test_is_license_expiring_soon_false_when_far_out(self):
        self.assertFalse(self.d.is_license_expiring_soon)

    def test_is_license_expiring_soon_false_when_already_expired(self):
        self.d.license_expiry = date.today() - timedelta(days=1)
        self.d.save()
        self.assertFalse(self.d.is_license_expiring_soon)


class LicenseReminderCommandTests(TestCase):
    def test_command_sends_email_to_driver_with_email_on_file(self):
        Driver.objects.create(
            name='Reminder Test', license_number='LIC-999', license_category='LMV',
            license_expiry=date.today() + timedelta(days=10), contact_number='9000000000',
            email='reminder-test@example.com',
        )
        call_command('send_license_reminders', '--days=30')
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('reminder-test@example.com', mail.outbox[0].to)

    def test_command_skips_driver_without_email(self):
        Driver.objects.create(
            name='No Email', license_number='LIC-998', license_category='LMV',
            license_expiry=date.today() + timedelta(days=10), contact_number='9000000001',
        )
        call_command('send_license_reminders', '--days=30')
        self.assertEqual(len(mail.outbox), 0)