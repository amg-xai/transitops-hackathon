from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Vehicle

@login_required
def vehicle_list(request):
    vehicles = Vehicle.objects.all()
    return render(request, 'vehicles/vehicle_list.html', {'vehicles': vehicles})

@login_required
def vehicle_add(request):
    if request.method == 'POST':
        Vehicle.objects.create(
            registration_number=request.POST['registration_number'],
            name=request.POST['name'],
            vehicle_type=request.POST['vehicle_type'],
            max_load_capacity=request.POST['max_load_capacity'],
            acquisition_cost=request.POST['acquisition_cost'],
            odometer=request.POST.get('odometer', 0),
            region=request.POST.get('region', ''),
        )
        messages.success(request, 'Vehicle added successfully.')
        return redirect('vehicle_list')
    return render(request, 'vehicles/vehicle_form.html', {'action': 'Add'})

@login_required
def vehicle_edit(request, pk):
    vehicle = get_object_or_404(Vehicle, pk=pk)
    if request.method == 'POST':
        vehicle.registration_number = request.POST['registration_number']
        vehicle.name                = request.POST['name']
        vehicle.vehicle_type        = request.POST['vehicle_type']
        vehicle.max_load_capacity   = request.POST['max_load_capacity']
        vehicle.acquisition_cost    = request.POST['acquisition_cost']
        vehicle.odometer            = request.POST.get('odometer', vehicle.odometer)
        vehicle.region              = request.POST.get('region', '')
        vehicle.status              = request.POST['status']
        vehicle.save()
        messages.success(request, 'Vehicle updated.')
        return redirect('vehicle_list')
    return render(request, 'vehicles/vehicle_form.html', {'action': 'Edit', 'vehicle': vehicle})

@login_required
def vehicle_delete(request, pk):
    vehicle = get_object_or_404(Vehicle, pk=pk)
    if request.method == 'POST':
        vehicle.delete()
        messages.success(request, 'Vehicle deleted.')
        return redirect('vehicle_list')
    return render(request, 'vehicles/vehicle_confirm_delete.html', {'vehicle': vehicle})