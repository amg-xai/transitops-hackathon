from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import MaintenanceLog
from vehicles.models import Vehicle

@login_required
def maintenance_list(request):
    logs = MaintenanceLog.objects.select_related('vehicle').all()
    return render(request, 'maintenance/maintenance_list.html', {'logs': logs})

@login_required
def maintenance_add(request):
    if request.method == 'POST':
        MaintenanceLog.objects.create(
            vehicle=get_object_or_404(Vehicle, pk=request.POST['vehicle']),
            description=request.POST['description'],
            cost=request.POST.get('cost', 0),
            start_date=request.POST['start_date'],
        )
        messages.success(request, 'Maintenance record created. Vehicle set to In Shop.')
        return redirect('maintenance_list')
    vehicles = Vehicle.objects.exclude(status__in=['retired', 'on_trip'])
    return render(request, 'maintenance/maintenance_form.html', {'vehicles': vehicles})

@login_required
def maintenance_close(request, pk):
    log = get_object_or_404(MaintenanceLog, pk=pk)
    log.close()
    messages.success(request, 'Maintenance closed. Vehicle set to Available.')
    return redirect('maintenance_list')