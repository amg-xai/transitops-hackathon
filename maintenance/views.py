from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from core.permissions import role_required
from core.audit import log_action
from core.utils import required, decimal_field, FormError
from .models import MaintenanceLog
from vehicles.models import Vehicle

@login_required
def maintenance_list(request):
    logs = MaintenanceLog.objects.select_related('vehicle').all()
    return render(request, 'maintenance/maintenance_list.html', {'logs': logs})

@role_required('fleet_manager', redirect_to='maintenance_list')
def maintenance_add(request):
    if request.method == 'POST':
        try:
            vehicle = get_object_or_404(Vehicle, pk=required(request.POST, 'vehicle', 'Vehicle'))
            description = required(request.POST, 'description', 'Description')
            cost = decimal_field(request.POST, 'cost', 'Cost', default=0, required_field=False)
            start_date = required(request.POST, 'start_date', 'Start date')

            log = MaintenanceLog.objects.create(vehicle=vehicle, description=description, cost=cost, start_date=start_date)
            log_action('maintenance', log.pk, str(log), 'Maintenance record opened (vehicle set to In Shop)', user=request.user)
            messages.success(request, 'Maintenance record created. Vehicle set to In Shop.')
            return redirect('maintenance_list')
        except FormError as e:
            messages.error(request, str(e))
    vehicles = Vehicle.objects.exclude(status__in=['retired', 'on_trip'])
    return render(request, 'maintenance/maintenance_form.html', {'vehicles': vehicles})

@role_required('fleet_manager', redirect_to='maintenance_list')
def maintenance_close(request, pk):
    log = get_object_or_404(MaintenanceLog, pk=pk)
    log.close(user=request.user)
    messages.success(request, 'Maintenance closed. Vehicle set to Available.')
    return redirect('maintenance_list')