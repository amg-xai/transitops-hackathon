from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Driver

@login_required
def driver_list(request):
    drivers = Driver.objects.all()
    return render(request, 'drivers/driver_list.html', {'drivers': drivers})

@login_required
def driver_add(request):
    if request.method == 'POST':
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
    return render(request, 'drivers/driver_form.html', {'action': 'Add'})

@login_required
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
        driver.save()
        messages.success(request, 'Driver updated.')
        return redirect('driver_list')
    return render(request, 'drivers/driver_form.html', {'action': 'Edit', 'driver': driver})

@login_required
def driver_delete(request, pk):
    driver = get_object_or_404(Driver, pk=pk)
    if request.method == 'POST':
        driver.delete()
        messages.success(request, 'Driver deleted.')
        return redirect('driver_list')
    return render(request, 'drivers/driver_confirm_delete.html', {'driver': driver})