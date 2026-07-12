from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from core.permissions import role_required
from core.audit import log_action
from core.utils import required, decimal_field, FormError
from .models import FuelLog, Expense
from vehicles.models import Vehicle

@login_required
def fuel_list(request):
    fuel_logs = FuelLog.objects.select_related('vehicle').all()
    expenses = Expense.objects.select_related('vehicle').all()
    return render(request, 'fueling/fuel_list.html', {'fuel_logs': fuel_logs, 'expenses': expenses})

@role_required('fleet_manager', 'financial_analyst', redirect_to='fuel_list')
def fuel_add(request):
    if request.method == 'POST':
        try:
            vehicle = get_object_or_404(Vehicle, pk=required(request.POST, 'vehicle', 'Vehicle'))
            liters = decimal_field(request.POST, 'liters', 'Liters')
            cost = decimal_field(request.POST, 'cost', 'Cost')
            date = required(request.POST, 'date', 'Date')
            FuelLog.objects.create(vehicle=vehicle, liters=liters, cost=cost, date=date)
            log_action('vehicle', vehicle.pk, str(vehicle), f'Fuel log added ({liters} L, ₹{cost})', user=request.user)
            messages.success(request, 'Fuel log added.')
            return redirect('fuel_list')
        except FormError as e:
            messages.error(request, str(e))
    vehicles = Vehicle.objects.all()
    return render(request, 'fueling/fuel_form.html', {'vehicles': vehicles})

@role_required('fleet_manager', 'financial_analyst', redirect_to='fuel_list')
def expense_add(request):
    if request.method == 'POST':
        try:
            vehicle = get_object_or_404(Vehicle, pk=required(request.POST, 'vehicle', 'Vehicle'))
            category = required(request.POST, 'category', 'Category')
            amount = decimal_field(request.POST, 'amount', 'Amount')
            description = (request.POST.get('description') or '').strip()
            date = required(request.POST, 'date', 'Date')
            Expense.objects.create(vehicle=vehicle, category=category, amount=amount, description=description, date=date)
            log_action('vehicle', vehicle.pk, str(vehicle), f'Expense logged: {category} ₹{amount}', user=request.user)
            messages.success(request, 'Expense added.')
            return redirect('fuel_list')
        except FormError as e:
            messages.error(request, str(e))
    vehicles = Vehicle.objects.all()
    return render(request, 'fueling/expense_form.html', {'vehicles': vehicles})