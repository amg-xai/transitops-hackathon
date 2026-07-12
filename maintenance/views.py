"""
Views for logging and managing fleet maintenance.
Allows authorized managers to add repair logs and close active repairs.
"""
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from core.permissions import role_required
from .models import MaintenanceLog
from vehicles.models import Vehicle

@login_required
def maintenance_list(request):
    """
    Lists all active and closed maintenance logs.
    """
    logs = MaintenanceLog.objects.select_related('vehicle').all()
    return render(request, 'maintenance/maintenance_list.html', {'logs': logs})

@role_required('fleet_manager', redirect_to='maintenance_list')
def maintenance_add(request):
    """
    Logs a new maintenance visit for a vehicle.
    Restricted to fleet managers.
    Filters out retired vehicles or those currently out on trips.
    """
    if request.method == 'POST':
        MaintenanceLog.objects.create(
            vehicle=get_object_or_404(Vehicle, pk=request.POST['vehicle']),
            description=request.POST['description'],
            cost=request.POST.get('cost', 0),
            start_date=request.POST['start_date'],
        )
        messages.success(request, 'Maintenance record created. Vehicle set to In Shop.')
        return redirect('maintenance_list')
    
    # Exclude vehicles that are retired or currently on a trip
    vehicles = Vehicle.objects.exclude(status__in=['retired', 'on_trip'])
    return render(request, 'maintenance/maintenance_form.html', {'vehicles': vehicles})

@role_required('fleet_manager', redirect_to='maintenance_list')
def maintenance_close(request, pk):
    """
    Closes an active maintenance log, resetting vehicle status to available.
    Restricted to fleet managers.
    """
    log = get_object_or_404(MaintenanceLog, pk=pk)
    log.close()
    messages.success(request, 'Maintenance closed. Vehicle set to Available.')
    return redirect('maintenance_list')