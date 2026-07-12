from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import FuelLog, Expense
from vehicles.models import Vehicle

@login_required
def fuel_list(request):
    fuel_logs = FuelLog.objects.select_related('vehicle').all()
    expenses  = Expense.objects.select_related('vehicle').all()
    return render(request, 'fueling/fuel_list.html', {'fuel_logs': fuel_logs, 'expenses': expenses})

@login_required
def fuel_add(request):
    if request.method == 'POST':
        FuelLog.objects.create(
            vehicle=get_object_or_404(Vehicle, pk=request.POST['vehicle']),
            liters=request.POST['liters'],
            cost=request.POST['cost'],
            date=request.POST['date'],
        )
        messages.success(request, 'Fuel log added.')
        return redirect('fuel_list')
    vehicles = Vehicle.objects.all()
    return render(request, 'fueling/fuel_form.html', {'vehicles': vehicles})

@login_required
def expense_add(request):
    if request.method == 'POST':
        Expense.objects.create(
            vehicle=get_object_or_404(Vehicle, pk=request.POST['vehicle']),
            category=request.POST['category'],
            amount=request.POST['amount'],
            description=request.POST.get('description', ''),
            date=request.POST['date'],
        )
        messages.success(request, 'Expense added.')
        return redirect('fuel_list')
    vehicles = Vehicle.objects.all()
    return render(request, 'fueling/expense_form.html', {'vehicles': vehicles})