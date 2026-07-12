"""
Views for monitoring and logging vehicle fueling logs and expenses.
Allows authorized fleet managers and financial analysts to record transactions.
"""
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from core.permissions import role_required
from .models import FuelLog, Expense
from vehicles.models import Vehicle

@login_required
def fuel_list(request):
    """
    Displays the catalog of all logged fuel receipts and general vehicle expenses.
    """
    fuel_logs = FuelLog.objects.select_related('vehicle').all()
    expenses  = Expense.objects.select_related('vehicle').all()
    return render(request, 'fueling/fuel_list.html', {'fuel_logs': fuel_logs, 'expenses': expenses})

@role_required('fleet_manager', 'financial_analyst', redirect_to='fuel_list')
def fuel_add(request):
    """
    Adds a new fuel entry to track liters and cost.
    Only accessible by fleet managers and financial analysts.
    """
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

@role_required('fleet_manager', 'financial_analyst', redirect_to='fuel_list')
def expense_add(request):
    """
    Adds a generic expense log (toll, maintenance, miscellaneous).
    Only accessible by fleet managers and financial analysts.
    """
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