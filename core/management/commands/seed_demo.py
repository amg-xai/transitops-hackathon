"""
Management command to seed mock data for the TransitOps system.
Provides preconfigured users, vehicles, drivers, trips, maintenance logs, and fuel entries.
"""
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from vehicles.models import Vehicle
from drivers.models import Driver
from trips.models import Trip
from maintenance.models import MaintenanceLog
from fueling.models import FuelLog, Expense

User = get_user_model()


class Command(BaseCommand):
    """
    Populates the database with initial records for development and demo purposes.
    Sets up users with specific roles, vehicles across states, and sample transaction logs.
    """
    help = "Seed demo data for TransitOps"


    def handle(self, *args, **options):
        # --- Test users, one per role ---
        users = [
            ('fleet1', 'fleet_manager', 'Fiona Fleet'),
            ('driver1', 'driver', 'Dev Driver'),
            ('safety1', 'safety_officer', 'Sam Safety'),
            ('finance1', 'financial_analyst', 'Fay Finance'),
        ]
        for username, role, full_name in users:
            first, last = full_name.split(' ', 1)
            user, created = User.objects.get_or_create(
                username=username,
                defaults={'role': role, 'first_name': first, 'last_name': last}
            )
            if created:
                user.set_password('demo1234')
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Created user {username} / demo1234 ({role})'))

        # --- Vehicles ---
        vehicles_data = [
            ('MH-04-AB-1234', 'Tata Ace', 'van', 750, 12000, 550000, 'available', 'West'),
            ('MH-04-CD-5678', 'Ashok Leyland Truck', 'truck', 5000, 45000, 2200000, 'available', 'West'),
            ('KA-01-EF-9012', 'Force Traveller', 'van', 1200, 30000, 900000, 'on_trip', 'South'),
            ('DL-03-GH-3456', 'Mahindra Bolero Pickup', 'truck', 1500, 60000, 1100000, 'in_shop', 'North'),
            ('MH-04-IJ-7890', 'Maruti Eeco', 'car', 400, 8000, 450000, 'available', 'West'),
            ('KA-01-KL-2345', 'Volvo Bus', 'bus', 0, 90000, 6000000, 'retired', 'South'),
        ]
        vehicles = {}
        for reg, name, vtype, cap, odo, cost, status, region in vehicles_data:
            v, _ = Vehicle.objects.get_or_create(
                registration_number=reg,
                defaults=dict(name=name, vehicle_type=vtype, max_load_capacity=cap,
                               odometer=odo, acquisition_cost=cost, status=status, region=region)
            )
            vehicles[reg] = v

        # --- Drivers ---
        today = date.today()
        drivers_data = [
            ('Alex Kumar', 'DL-001', 'LMV', today + timedelta(days=300), '9800000001', 9.5, 'available'),
            ('Priya Singh', 'DL-002', 'HMV', today + timedelta(days=200), '9800000002', 8.7, 'on_trip'),
            ('Ravi Sharma', 'DL-003', 'HMV', today - timedelta(days=10), '9800000003', 7.0, 'available'),  # expired
            ('Neha Verma', 'DL-004', 'LMV', today + timedelta(days=100), '9800000004', 9.9, 'available'),
            ('Karan Mehta', 'DL-005', 'HMV', today + timedelta(days=50), '9800000005', 6.5, 'suspended'),
        ]
        drivers = {}
        for name, lic, cat, expiry, contact, score, status in drivers_data:
            d, _ = Driver.objects.get_or_create(
                license_number=lic,
                defaults=dict(name=name, license_category=cat, license_expiry=expiry,
                               contact_number=contact, safety_score=score, status=status)
            )
            drivers[lic] = d

        # --- Trips (one of each lifecycle state) ---
        fleet_user = User.objects.filter(username='fleet1').first()
        if not Trip.objects.filter(source='Pune Warehouse').exists():
            Trip.objects.create(
                vehicle=vehicles['MH-04-AB-1234'], driver=drivers['DL-001'],
                source='Pune Warehouse', destination='Mumbai Hub',
                cargo_weight=400, planned_distance=150, status='draft', created_by=fleet_user,
            )
        if not Trip.objects.filter(source='Bangalore Depot').exists():
            Trip.objects.create(
                vehicle=vehicles['KA-01-EF-9012'], driver=drivers['DL-002'],
                source='Bangalore Depot', destination='Chennai Port',
                cargo_weight=900, planned_distance=350, status='dispatched', created_by=fleet_user,
            )
        if not Trip.objects.filter(source='Delhi NCR').exists():
            Trip.objects.create(
                vehicle=vehicles['MH-04-IJ-7890'], driver=drivers['DL-004'],
                source='Delhi NCR', destination='Jaipur',
                cargo_weight=250, planned_distance=280, actual_distance=290,
                fuel_consumed=25, final_odometer=8290, revenue=12000,
                status='completed', created_by=fleet_user,
            )

        # --- Maintenance (matches the in_shop vehicle) ---
        MaintenanceLog.objects.get_or_create(
            vehicle=vehicles['DL-03-GH-3456'], description='Brake pad replacement + oil change',
            defaults=dict(cost=8500, status='active', start_date=today - timedelta(days=2))
        )

        # --- Fuel logs & expenses ---
        FuelLog.objects.get_or_create(
            vehicle=vehicles['MH-04-AB-1234'], date=today - timedelta(days=5),
            defaults=dict(liters=40, cost=4200)
        )
        FuelLog.objects.get_or_create(
            vehicle=vehicles['KA-01-EF-9012'], date=today - timedelta(days=3),
            defaults=dict(liters=60, cost=6300)
        )
        Expense.objects.get_or_create(
            vehicle=vehicles['MH-04-CD-5678'], category='toll', date=today - timedelta(days=1),
            defaults=dict(amount=850, description='NH48 toll')
        )

        self.stdout.write(self.style.SUCCESS('\nDemo data seeded successfully.'))
        self.stdout.write('Login as: fleet1 / driver1 / safety1 / finance1  (password: demo1234)')