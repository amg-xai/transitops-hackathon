from django.db.models import Q
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import IntegrityError
from core.permissions import role_required
from .models import Driver

@login_required
def driver_list(request):
    drivers = Driver.objects.all()

    q = request.GET.get('q', '').strip()
    status = request.GET.get('status', '')
    sort = request.GET.get('sort', 'name')

    if q:
        drivers = drivers.filter(Q(name__icontains=q) | Q(license_number__icontains=q))
    if status:
        drivers = drivers.filter(status=status)

    allowed_sorts = ['name', 'license_number', 'license_expiry', 'safety_score', 'status']
    if sort.lstrip('-') not in allowed_sorts:
        sort = 'name'
    drivers = drivers.order_by(sort)

    context = {
        'drivers': drivers, 'q': q, 'selected_status': status, 'sort': sort,
        'status_choices': Driver.STATUS_CHOICES,
    }
    return render(request, 'drivers/driver_list.html', context)

@role_required('fleet_manager', 'safety_officer', redirect_to='driver_list')
def driver_add(request):
    if request.method == 'POST':
        try:
            Driver.objects.create(
                name=request.POST['name'],
                license_number=request.POST['license_number'],
                license_category=request.POST['license_category'],
                license_expiry=request.POST['license_expiry'],
                contact_number=request.POST['contact_number'],
                safety_score=request.POST.get('safety_score', 10.0),
            )
            messages.success(request, 'Driver added successfully.')
            return redirect('driver_list')
        except IntegrityError:
            messages.error(request, f"License number '{request.POST['license_number']}' already exists.")
    return render(request, 'drivers/driver_form.html', {'action': 'Add'})

@role_required('fleet_manager', 'safety_officer', redirect_to='driver_list')
def driver_edit(request, pk):
    driver = get_object_or_404(Driver, pk=pk)
    if request.method == 'POST':
        driver.name             = request.POST['name']
        driver.license_number   = request.POST['license_number']
        driver.license_category = request.POST['license_category']
        driver.license_expiry   = request.POST['license_expiry']
        driver.contact_number   = request.POST['contact_number']
        driver.safety_score     = request.POST.get('safety_score', driver.safety_score)
        driver.status           = request.POST['status']
        try:
            driver.save()
            messages.success(request, 'Driver updated.')
            return redirect('driver_list')
        except IntegrityError:
            messages.error(request, 'That license number is already in use.')
    return render(request, 'drivers/driver_form.html', {'action': 'Edit', 'driver': driver})

@role_required('fleet_manager', redirect_to='driver_list')
def driver_delete(request, pk):
    driver = get_object_or_404(Driver, pk=pk)
    if request.method == 'POST':
        driver.delete()
        messages.success(request, 'Driver deleted.')
        return redirect('driver_list')
    return render(request, 'drivers/driver_confirm_delete.html', {'driver': driver})