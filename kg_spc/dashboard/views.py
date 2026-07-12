import csv
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse
from django.db.models import Count, Sum, Q, F, ExpressionWrapper, FloatField
from django.db.models.functions import Coalesce
from vehicles.models import Vehicle
from drivers.models import Driver
from trips.models import Trip
from maintenance.models import MaintenanceLog
from fueling.models import FuelLog, Expense


@api_view(['GET'])
def dashboard_kpis(request):
    """Get dashboard KPIs with optional filters"""
    # Get filter parameters
    vehicle_type = request.query_params.get('vehicle_type')
    vehicle_status = request.query_params.get('vehicle_status')
    region = request.query_params.get('region')

    # Build vehicle queryset with filters
    vehicle_queryset = Vehicle.objects.all()
    if vehicle_type:
        vehicle_queryset = vehicle_queryset.filter(vehicle_type=vehicle_type)
    if vehicle_status:
        vehicle_queryset = vehicle_queryset.filter(status=vehicle_status)
    if region:
        vehicle_queryset = vehicle_queryset.filter(region=region)

    # Calculate vehicle KPIs
    total_vehicles = vehicle_queryset.count()
    available_vehicles = vehicle_queryset.filter(status='available').count()
    on_trip_vehicles = vehicle_queryset.filter(status='on_trip').count()
    in_shop_vehicles = vehicle_queryset.filter(status='in_shop').count()
    retired_vehicles = vehicle_queryset.filter(status='retired').count()

    # Calculate trip KPIs
    active_trips = Trip.objects.filter(status='dispatched').count()
    pending_trips = Trip.objects.filter(status='draft').count()
    completed_trips = Trip.objects.filter(status='completed').count()
    cancelled_trips = Trip.objects.filter(status='cancelled').count()

    # Calculate driver KPIs
    total_drivers = Driver.objects.count()
    drivers_on_duty = Driver.objects.filter(status='on_trip').count()
    available_drivers = Driver.objects.filter(status='available').count()
    suspended_drivers = Driver.objects.filter(status='suspended').count()
    expired_licenses = sum(1 for d in Driver.objects.all() if d.is_license_expired)

    # Calculate fleet utilization
    if total_vehicles > 0:
        fleet_utilization = round((on_trip_vehicles / total_vehicles) * 100, 2)
    else:
        fleet_utilization = 0

    return Response({
        'vehicles': {
            'total': total_vehicles,
            'available': available_vehicles,
            'on_trip': on_trip_vehicles,
            'in_shop': in_shop_vehicles,
            'retired': retired_vehicles,
        },
        'trips': {
            'active': active_trips,
            'pending': pending_trips,
            'completed': completed_trips,
            'cancelled': cancelled_trips,
        },
        'drivers': {
            'total': total_drivers,
            'on_duty': drivers_on_duty,
            'available': available_drivers,
            'suspended': suspended_drivers,
            'expired_licenses': expired_licenses,
        },
        'fleet_utilization': fleet_utilization,
    })


@api_view(['GET'])
def vehicle_status_summary(request):
    """Get vehicle status breakdown"""
    vehicles = Vehicle.objects.values('status').annotate(count=Count('id'))
    return Response(list(vehicles))


@api_view(['GET'])
def driver_status_summary(request):
    """Get driver status breakdown"""
    drivers = Driver.objects.values('status').annotate(count=Count('id'))
    return Response(list(drivers))


@api_view(['GET'])
def trip_status_summary(request):
    """Get trip status breakdown"""
    trips = Trip.objects.values('status').annotate(count=Count('id'))
    return Response(list(trips))


@api_view(['GET'])
def fuel_efficiency_report(request):
    """Calculate fuel efficiency (Distance/Fuel) per vehicle"""
    vehicle_id = request.query_params.get('vehicle_id')
    
    completed_trips = Trip.objects.filter(status='completed')
    if vehicle_id:
        completed_trips = completed_trips.filter(vehicle_id=vehicle_id)
    
    results = []
    for trip in completed_trips:
        if trip.fuel_consumed and trip.fuel_consumed > 0 and trip.actual_distance:
            efficiency = trip.actual_distance / trip.fuel_consumed
            results.append({
                'trip_id': trip.id,
                'vehicle': trip.vehicle.registration_number,
                'vehicle_name': trip.vehicle.name,
                'distance': trip.actual_distance,
                'fuel_consumed': trip.fuel_consumed,
                'efficiency_km_per_liter': round(efficiency, 2),
                'date': trip.created_at.date(),
            })
    
    return Response(results)


@api_view(['GET'])
def operational_cost_report(request):
    """Calculate operational cost (Fuel + Maintenance) per vehicle"""
    vehicle_id = request.query_params.get('vehicle_id')
    
    vehicles = Vehicle.objects.all()
    if vehicle_id:
        vehicles = vehicles.filter(id=vehicle_id)
    
    results = []
    for vehicle in vehicles:
        # Calculate fuel costs
        fuel_costs = FuelLog.objects.filter(vehicle=vehicle).aggregate(
            total_fuel_cost=Sum('cost'),
            total_fuel_liters=Sum('liters')
        )
        
        # Calculate maintenance costs
        maintenance_costs = MaintenanceLog.objects.filter(vehicle=vehicle).aggregate(
            total_maintenance_cost=Sum('cost')
        )
        
        # Calculate other expenses
        other_expenses = Expense.objects.filter(vehicle=vehicle, category__in=['toll', 'other']).aggregate(
            total_other_cost=Sum('amount')
        )
        
        total_operational_cost = (fuel_costs['total_fuel_cost'] or 0) + \
                                (maintenance_costs['total_maintenance_cost'] or 0) + \
                                (other_expenses['total_other_cost'] or 0)
        
        results.append({
            'vehicle_id': vehicle.id,
            'vehicle_registration': vehicle.registration_number,
            'vehicle_name': vehicle.name,
            'fuel_cost': fuel_costs['total_fuel_cost'] or 0,
            'maintenance_cost': maintenance_costs['total_maintenance_cost'] or 0,
            'other_expenses': other_expenses['total_other_cost'] or 0,
            'total_operational_cost': total_operational_cost,
        })
    
    return Response(results)


@api_view(['GET'])
def vehicle_roi_report(request):
    """Calculate Vehicle ROI: (Revenue - (Maintenance + Fuel)) / Acquisition Cost"""
    vehicle_id = request.query_params.get('vehicle_id')
    
    vehicles = Vehicle.objects.all()
    if vehicle_id:
        vehicles = vehicles.filter(id=vehicle_id)
    
    results = []
    for vehicle in vehicles:
        # Calculate total revenue from completed trips
        revenue = Trip.objects.filter(
            vehicle=vehicle, 
            status='completed'
        ).aggregate(total_revenue=Sum('revenue'))['total_revenue'] or 0
        
        # Calculate total costs
        fuel_cost = FuelLog.objects.filter(vehicle=vehicle).aggregate(total=Sum('cost'))['total'] or 0
        maintenance_cost = MaintenanceLog.objects.filter(vehicle=vehicle).aggregate(total=Sum('cost'))['total'] or 0
        total_cost = fuel_cost + maintenance_cost
        
        # Calculate ROI
        if vehicle.acquisition_cost and vehicle.acquisition_cost > 0:
            roi = ((revenue - total_cost) / vehicle.acquisition_cost) * 100
        else:
            roi = 0
        
        results.append({
            'vehicle_id': vehicle.id,
            'vehicle_registration': vehicle.registration_number,
            'vehicle_name': vehicle.name,
            'acquisition_cost': vehicle.acquisition_cost,
            'total_revenue': revenue,
            'total_fuel_cost': fuel_cost,
            'total_maintenance_cost': maintenance_cost,
            'total_cost': total_cost,
            'roi_percentage': round(roi, 2),
        })
    
    return Response(results)


@api_view(['GET'])
def fleet_utilization_report(request):
    """Calculate fleet utilization metrics"""
    total_vehicles = Vehicle.objects.count()
    on_trip_vehicles = Vehicle.objects.filter(status='on_trip').count()
    
    if total_vehicles > 0:
        utilization_rate = (on_trip_vehicles / total_vehicles) * 100
    else:
        utilization_rate = 0
    
    # Calculate by vehicle type
    by_type = []
    for v_type, _ in Vehicle.TYPE_CHOICES:
        type_vehicles = Vehicle.objects.filter(vehicle_type=v_type)
        type_total = type_vehicles.count()
        type_on_trip = type_vehicles.filter(status='on_trip').count()
        
        if type_total > 0:
            type_utilization = (type_on_trip / type_total) * 100
        else:
            type_utilization = 0
        
        by_type.append({
            'vehicle_type': v_type,
            'total': type_total,
            'on_trip': type_on_trip,
            'utilization_percentage': round(type_utilization, 2),
        })
    
    return Response({
        'overall_utilization_percentage': round(utilization_rate, 2),
        'total_vehicles': total_vehicles,
        'vehicles_on_trip': on_trip_vehicles,
        'by_vehicle_type': by_type,
    })


@api_view(['GET'])
def export_vehicles_csv(request):
    """Export vehicles to CSV"""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="vehicles.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Registration Number', 'Name', 'Type', 'Max Load Capacity (kg)',
        'Odometer', 'Acquisition Cost', 'Status', 'Region', 'Created At'
    ])
    
    for vehicle in Vehicle.objects.all():
        writer.writerow([
            vehicle.registration_number,
            vehicle.name,
            vehicle.vehicle_type,
            vehicle.max_load_capacity,
            vehicle.odometer,
            vehicle.acquisition_cost,
            vehicle.status,
            vehicle.region,
            vehicle.created_at.strftime('%Y-%m-%d %H:%M:%S') if vehicle.created_at else '',
        ])
    
    return response


@api_view(['GET'])
def export_drivers_csv(request):
    """Export drivers to CSV"""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="drivers.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Name', 'License Number', 'License Category', 'License Expiry',
        'Contact Number', 'Safety Score', 'Status', 'Created At'
    ])
    
    for driver in Driver.objects.all():
        writer.writerow([
            driver.name,
            driver.license_number,
            driver.license_category,
            driver.license_expiry.strftime('%Y-%m-%d') if driver.license_expiry else '',
            driver.contact_number,
            driver.safety_score,
            driver.status,
            driver.created_at.strftime('%Y-%m-%d %H:%M:%S') if driver.created_at else '',
        ])
    
    return response


@api_view(['GET'])
def export_trips_csv(request):
    """Export trips to CSV"""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="trips.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'ID', 'Vehicle', 'Driver', 'Source', 'Destination',
        'Cargo Weight (kg)', 'Planned Distance (km)', 'Actual Distance (km)',
        'Fuel Consumed (L)', 'Final Odometer', 'Revenue', 'Status', 'Created At'
    ])
    
    for trip in Trip.objects.select_related('vehicle', 'driver').all():
        writer.writerow([
            trip.id,
            trip.vehicle.registration_number,
            trip.driver.name,
            trip.source,
            trip.destination,
            trip.cargo_weight,
            trip.planned_distance,
            trip.actual_distance or '',
            trip.fuel_consumed or '',
            trip.final_odometer or '',
            trip.revenue,
            trip.status,
            trip.created_at.strftime('%Y-%m-%d %H:%M:%S') if trip.created_at else '',
        ])
    
    return response


@api_view(['GET'])
def export_fuel_logs_csv(request):
    """Export fuel logs to CSV"""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="fuel_logs.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Vehicle', 'Trip ID', 'Liters', 'Cost', 'Date', 'Created At'
    ])
    
    for fuel_log in FuelLog.objects.select_related('vehicle').all():
        writer.writerow([
            fuel_log.vehicle.registration_number,
            fuel_log.trip.id if fuel_log.trip else '',
            fuel_log.liters,
            fuel_log.cost,
            fuel_log.date.strftime('%Y-%m-%d') if fuel_log.date else '',
            fuel_log.created_at.strftime('%Y-%m-%d %H:%M:%S') if fuel_log.created_at else '',
        ])
    
    return response


@api_view(['GET'])
def export_expenses_csv(request):
    """Export expenses to CSV"""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="expenses.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Vehicle', 'Trip ID', 'Category', 'Amount', 'Description', 'Date', 'Created At'
    ])
    
    for expense in Expense.objects.select_related('vehicle').all():
        writer.writerow([
            expense.vehicle.registration_number,
            expense.trip.id if expense.trip else '',
            expense.category,
            expense.amount,
            expense.description,
            expense.date.strftime('%Y-%m-%d') if expense.date else '',
            expense.created_at.strftime('%Y-%m-%d %H:%M:%S') if expense.created_at else '',
        ])
    
    return response