from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from vehicles.models import Vehicle
from drivers.models import Driver
from trips.models import Trip

@login_required
def dashboard(request):
    total_vehicles    = Vehicle.objects.count()
    active_vehicles   = Vehicle.objects.filter(status='on_trip').count()
    available_vehicles = Vehicle.objects.filter(status='available').count()
    in_maintenance    = Vehicle.objects.filter(status='in_shop').count()
    active_trips      = Trip.objects.filter(status='dispatched').count()
    pending_trips     = Trip.objects.filter(status='draft').count()
    drivers_on_duty   = Driver.objects.filter(status='on_trip').count()
    fleet_utilization = round((active_vehicles / total_vehicles * 100), 1) if total_vehicles else 0

    context = {
        'total_vehicles':     total_vehicles,
        'active_vehicles':    active_vehicles,
        'available_vehicles': available_vehicles,
        'in_maintenance':     in_maintenance,
        'active_trips':       active_trips,
        'pending_trips':      pending_trips,
        'drivers_on_duty':    drivers_on_duty,
        'fleet_utilization':  fleet_utilization,
        'recent_trips':       Trip.objects.select_related('vehicle', 'driver').order_by('-created_at')[:5],
    }
    return render(request, 'dashboard/dashboard.html', context)