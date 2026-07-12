from django.db.models import Q
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import IntegrityError
from core.permissions import role_required
from .models import Vehicle

@login_required
def vehicle_list(request):
    vehicles = Vehicle.objects.all()

    q = request.GET.get('q', '').strip()
    status = request.GET.get('status', '')
    vtype = request.GET.get('vehicle_type', '')
    sort = request.GET.get('sort', 'registration_number')

    if q:
        vehicles = vehicles.filter(
            Q(registration_number__icontains=q) | Q(name__icontains=q) | Q(region__icontains=q)
        )
    if status:
        vehicles = vehicles.filter(status=status)
    if vtype:
        vehicles = vehicles.filter(vehicle_type=vtype)

    allowed_sorts = ['registration_number', 'name', 'vehicle_type', 'max_load_capacity', 'odometer', 'status']
    sort_field = sort.lstrip('-')
    if sort_field not in allowed_sorts:
        sort = 'registration_number'
    vehicles = vehicles.order_by(sort)

    context = {
        'vehicles': vehicles,
        'q': q, 'selected_status': status, 'selected_type': vtype, 'sort': sort,
        'status_choices': Vehicle.STATUS_CHOICES, 'type_choices': Vehicle.TYPE_CHOICES,
    }
    return render(request, 'vehicles/vehicle_list.html', context)

@role_required('fleet_manager', redirect_to='vehicle_list')
def vehicle_add(request):
    if request.method == 'POST':
        try:
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
        except IntegrityError:
            messages.error(request, f"Registration number '{request.POST['registration_number']}' already exists.")
    return render(request, 'vehicles/vehicle_form.html', {'action': 'Add'})

@role_required('fleet_manager', redirect_to='vehicle_list')
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
        try:
            vehicle.save()
            messages.success(request, 'Vehicle updated.')
            return redirect('vehicle_list')
        except IntegrityError:
            messages.error(request, 'That registration number is already in use.')
    return render(request, 'vehicles/vehicle_form.html', {'action': 'Edit', 'vehicle': vehicle})

@role_required('fleet_manager', redirect_to='vehicle_list')
def vehicle_delete(request, pk):
    vehicle = get_object_or_404(Vehicle, pk=pk)
    if request.method == 'POST':
        vehicle.delete()
        messages.success(request, 'Vehicle deleted.')
        return redirect('vehicle_list')
    return render(request, 'vehicles/vehicle_confirm_delete.html', {'vehicle': vehicle})