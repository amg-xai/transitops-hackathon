from datetime import date
from django.test import TestCase
from vehicles.models import Vehicle
from .models import MaintenanceLog


class MaintenanceWorkflowTests(TestCase):
    def setUp(self):
        self.vehicle = Vehicle.objects.create(
            registration_number='TRK-01', name='Truck 1', vehicle_type='truck',
            max_load_capacity=2000, acquisition_cost=1000000, status='available',
        )

    def test_opening_active_maintenance_sets_vehicle_in_shop(self):
        MaintenanceLog.objects.create(
            vehicle=self.vehicle, description='Oil change', status='active', start_date=date.today(),
        )
        self.vehicle.refresh_from_db()
        self.assertEqual(self.vehicle.status, 'in_shop')

    def test_closing_maintenance_restores_available(self):
        log = MaintenanceLog.objects.create(
            vehicle=self.vehicle, description='Oil change', status='active', start_date=date.today(),
        )
        log.close()
        self.vehicle.refresh_from_db()
        self.assertEqual(self.vehicle.status, 'available')
        self.assertEqual(log.status, 'closed')

    def test_opening_maintenance_does_not_unretire_vehicle(self):
        self.vehicle.status = 'retired'
        self.vehicle.save()
        MaintenanceLog.objects.create(
            vehicle=self.vehicle, description='Inspection', status='active', start_date=date.today(),
        )
        self.vehicle.refresh_from_db()
        self.assertEqual(self.vehicle.status, 'retired')  # must stay retired, not flip to in_shop