from datetime import date, timedelta
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.db import IntegrityError
from .models import Vehicle, VehicleDocument


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


class VehicleDocumentTests(TestCase):
    def setUp(self):
        self.v = Vehicle.objects.create(
            registration_number='DOC-001', name='Doc Van', vehicle_type='van',
            max_load_capacity=500, acquisition_cost=500000,
        )

    def _make_doc(self, expiry_date=None):
        return VehicleDocument.objects.create(
            vehicle=self.v, document_type='insurance',
            file=SimpleUploadedFile('policy.pdf', b'dummy content'),
            expiry_date=expiry_date,
        )

    def test_document_with_no_expiry(self):
        doc = self._make_doc()
        self.assertFalse(doc.is_expired)
        self.assertFalse(doc.is_expiring_soon)

    def test_document_expiring_within_30_days(self):
        doc = self._make_doc(expiry_date=date.today() + timedelta(days=10))
        self.assertTrue(doc.is_expiring_soon)
        self.assertFalse(doc.is_expired)

    def test_document_already_expired(self):
        doc = self._make_doc(expiry_date=date.today() - timedelta(days=1))
        self.assertTrue(doc.is_expired)
        self.assertFalse(doc.is_expiring_soon)