"""
Views for the core operational analytics dashboard.
Aggregates key metrics (KPIs), calculates fuel efficiency and ROI, and supports CSV exporting.
"""
import csv
from decimal import Decimal

from django.contrib.auth.decorators import login_required
from django.db.models import Sum
from django.http import HttpResponse
from django.shortcuts import render

from core.permissions import role_required
from vehicles.models import Vehicle
from drivers.models import Driver
from trips.models import Trip


@login_required
def dashboard(request):
    """
    Renders the primary operational KPI dashboard.
    Supports filtering vehicles by type, status, and region.
    Displays counts of vehicles, trips, drivers, and calculates fleet utilization.
    """
    vtype = request.GET.get('vehicle_type', '')
    status = request.GET.get('status', '')
    region = request.GET.get('region', '')

    vehicles = Vehicle.objects.all()
    if vtype:
        vehicles = vehicles.filter(vehicle_type=vtype)
    if status:
        vehicles = vehicles.filter(status=status)
    if region:
        vehicles = vehicles.filter(region=region)

    total_vehicles = vehicles.count()
    active_vehicles = vehicles.filter(status='on_trip').count()
    available_vehicles = vehicles.filter(status='available').count()
    in_maintenance = vehicles.filter(status='in_shop').count()

    context = {
        'total_vehicles': total_vehicles,
        'active_vehicles': active_vehicles,
        'available_vehicles': available_vehicles,
        'in_maintenance': in_maintenance,
        'active_trips': Trip.objects.filter(status='dispatched').count(),
        'pending_trips': Trip.objects.filter(status='draft').count(),
        'drivers_on_duty': Driver.objects.filter(status='on_trip').count(),
        'fleet_utilization': round((active_vehicles / total_vehicles * 100), 1) if total_vehicles else 0,
        'recent_trips': Trip.objects.select_related('vehicle', 'driver').order_by('-created_at')[:5],
        'vehicle_types': Vehicle.TYPE_CHOICES,
        'status_choices': Vehicle.STATUS_CHOICES,
        'regions': Vehicle.objects.exclude(region='').values_list('region', flat=True).distinct(),
        'selected_type': vtype,
        'selected_status': status,
        'selected_region': region,
    }
    return render(request, 'dashboard/dashboard.html', context)


def _build_vehicle_report_rows():
    """
    Helper function to aggregate operational metrics per vehicle.
    Calculates:
    - Fuel Efficiency (km/L) = completed trip distance / completed trip fuel
    - Operational Cost = fuel cost + maintenance cost
    - ROI (%) = (completed trip revenue - operational cost) / vehicle acquisition cost * 100
    """
    rows = []
    for v in Vehicle.objects.all():
        completed = v.trips.filter(status='completed')
        total_distance = completed.aggregate(d=Sum('actual_distance'))['d'] or Decimal('0')
        total_fuel_liters = completed.aggregate(f=Sum('fuel_consumed'))['f'] or Decimal('0')
        fuel_efficiency = round(total_distance / total_fuel_liters, 2) if total_fuel_liters else None

        fuel_cost = v.fuel_logs.aggregate(c=Sum('cost'))['c'] or Decimal('0')
        maintenance_cost = v.maintenance_logs.aggregate(c=Sum('cost'))['c'] or Decimal('0')
        other_expenses = v.expenses.aggregate(c=Sum('amount'))['c'] or Decimal('0')
        operational_cost = fuel_cost + maintenance_cost  # per spec: Fuel + Maintenance
        revenue = completed.aggregate(r=Sum('revenue'))['r'] or Decimal('0')
        roi = round(((revenue - operational_cost) / v.acquisition_cost) * 100, 2) if v.acquisition_cost else None

        rows.append({
            'vehicle': v,
            'total_distance': total_distance,
            'total_fuel_liters': total_fuel_liters,
            'fuel_efficiency': fuel_efficiency,
            'fuel_cost': fuel_cost,
            'maintenance_cost': maintenance_cost,
            'other_expenses': other_expenses,
            'operational_cost': operational_cost,
            'revenue': revenue,
            'roi': roi,
        })
    return rows


@role_required('fleet_manager', 'financial_analyst', redirect_to='dashboard')
def reports(request):
    """
    Renders fleet report table and structures data for Chart.js dashboard charts.
    Accessible only by fleet managers and financial analysts.
    """
    rows = _build_vehicle_report_rows()
    total_vehicles = Vehicle.objects.count()
    active_vehicles = Vehicle.objects.filter(status='on_trip').count()
    fleet_utilization = round((active_vehicles / total_vehicles * 100), 1) if total_vehicles else 0

    context = {
        'rows': rows,
        'fleet_utilization': fleet_utilization,
        'chart_labels': [r['vehicle'].registration_number for r in rows],
        'chart_operational_cost': [float(r['operational_cost']) for r in rows],
        'chart_roi': [float(r['roi']) if r['roi'] is not None else 0.0 for r in rows],
    }
    return render(request, 'dashboard/reports.html', context)


@role_required('fleet_manager', 'financial_analyst', redirect_to='dashboard')
def reports_csv(request):
    """
    Exports the vehicle operational reports to a downloadable CSV file.
    Accessible only by fleet managers and financial analysts.
    """
    rows = _build_vehicle_report_rows()
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="transitops_report.csv"'
    writer = csv.writer(response)
    writer.writerow([
        'Registration Number', 'Name', 'Type', 'Status', 'Region',
        'Total Distance (km)', 'Total Fuel (L)', 'Fuel Efficiency (km/L)',
        'Fuel Cost', 'Maintenance Cost', 'Other Expenses',
        'Operational Cost', 'Revenue', 'ROI (%)',
    ])
    for r in rows:
        v = r['vehicle']
        writer.writerow([
            v.registration_number, v.name, v.get_vehicle_type_display(),
            v.get_status_display(), v.region,
            r['total_distance'], r['total_fuel_liters'],
            r['fuel_efficiency'] if r['fuel_efficiency'] is not None else '',
            r['fuel_cost'], r['maintenance_cost'], r['other_expenses'],
            r['operational_cost'], r['revenue'],
            r['roi'] if r['roi'] is not None else '',
        ])
    return response