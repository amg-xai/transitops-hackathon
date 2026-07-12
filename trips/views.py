"""
Views for handling the trip lifecycle workflow.
Manages adding trips, dispatching them, recording execution stats, and cancelling tasks.
"""
from django.db.models import Q
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.exceptions import ValidationError
from django.utils import timezone
from core.permissions import role_required
from .models import Trip
from vehicles.models import Vehicle
from drivers.models import Driver

@login_required
def trip_list(request):
    """
    Renders the trip board listing.
    Supports searching by source/destination, vehicle reg, or driver name,
    and sorting by date, status, or payload weight.
    """
    trips = Trip.objects.select_related('vehicle', 'driver').all()

    q = request.GET.get('q', '').strip()
    status = request.GET.get('status', '')
    sort = request.GET.get('sort', '-created_at')

    if q:
        trips = trips.filter(
            Q(source__icontains=q) | Q(destination__icontains=q) |
            Q(vehicle__registration_number__icontains=q) | Q(driver__name__icontains=q)
        )
    if status:
        trips = trips.filter(status=status)

    allowed_sorts = ['created_at', 'status', 'cargo_weight']
    if sort.lstrip('-') not in allowed_sorts:
        sort = '-created_at'
    trips = trips.order_by(sort)

    context = {
        'trips': trips, 'q': q, 'selected_status': status, 'sort': sort,
        'status_choices': Trip.STATUS_CHOICES,
    }
    return render(request, 'trips/trip_list.html', context)

@role_required('fleet_manager', 'driver', redirect_to='trip_list')
def trip_add(request):
    """
    Renders/handles the trip creation form.
    Only allows 'fleet_manager' or 'driver' roles to add new trips.
    Enforces capacity check before saving trip draft.
    """
    if request.method == 'POST':
        trip = Trip(
            vehicle=get_object_or_404(Vehicle, pk=request.POST['vehicle']),
            driver=get_object_or_404(Driver,  pk=request.POST['driver']),
            source=request.POST['source'],
            destination=request.POST['destination'],
            cargo_weight=request.POST['cargo_weight'],
            planned_distance=request.POST['planned_distance'],
            created_by=request.user,
        )
        try:
            trip.clean()
            trip.save()
            messages.success(request, 'Trip created.')
            return redirect('trip_list')
        except ValidationError as e:
            messages.error(request, str(e.message))

    vehicles = Vehicle.objects.filter(status='available')
    drivers = Driver.objects.filter(status='available').exclude(license_expiry__lt=timezone.now().date())
    return render(request, 'trips/trip_form.html', {'vehicles': vehicles, 'drivers': drivers})

@role_required('fleet_manager', 'driver', redirect_to='trip_list')
def trip_dispatch(request, pk):
    """
    Executes dispatch on a Draft trip.
    Checks availability requirements of vehicle/driver and marks them as 'on_trip'.
    """
    trip = get_object_or_404(Trip, pk=pk)
    try:
        trip.dispatch()
        messages.success(request, 'Trip dispatched!')
    except ValidationError as e:
        messages.error(request, str(e.message))
    return redirect('trip_list')

@role_required('fleet_manager', 'driver', redirect_to='trip_list')
def trip_complete(request, pk):
    """
    Renders/handles the trip completion form.
    Collects actual distance, final odometer reading, fuel consumed, and revenue.
    Restores the vehicle/driver availability states and syncs vehicle odometer.
    """
    trip = get_object_or_404(Trip, pk=pk)
    if request.method == 'POST':
        try:
            trip.complete(
                final_odometer=request.POST['final_odometer'],
                fuel_consumed=request.POST['fuel_consumed'],
                actual_distance=request.POST['actual_distance'],
                revenue=request.POST.get('revenue', 0),
            )
            messages.success(request, 'Trip completed!')
            return redirect('trip_list')
        except ValidationError as e:
            messages.error(request, str(e.message))
    return render(request, 'trips/trip_complete.html', {'trip': trip})

@role_required('fleet_manager', 'driver', redirect_to='trip_list')
def trip_cancel(request, pk):
    """
    Cancels a Draft or Dispatched trip.
    Releases vehicles and drivers back to 'available' status.
    """
    trip = get_object_or_404(Trip, pk=pk)
    try:
        trip.cancel()
        messages.success(request, 'Trip cancelled.')
    except ValidationError as e:
        messages.error(request, str(e.message))
    return redirect('trip_list')