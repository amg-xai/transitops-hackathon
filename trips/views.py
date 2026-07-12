from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.utils import timezone
from core.permissions import role_required
from core.audit import log_action
from core.utils import required, decimal_field, FormError
from .models import Trip
from vehicles.models import Vehicle
from drivers.models import Driver

@login_required
def trip_list(request):
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

    return render(request, 'trips/trip_list.html', {
        'trips': trips, 'q': q, 'selected_status': status, 'sort': sort,
        'status_choices': Trip.STATUS_CHOICES,
    })

@role_required('fleet_manager', 'driver', redirect_to='trip_list')
def trip_add(request):
    if request.method == 'POST':
        try:
            vehicle = get_object_or_404(Vehicle, pk=required(request.POST, 'vehicle', 'Vehicle'))
            driver = get_object_or_404(Driver, pk=required(request.POST, 'driver', 'Driver'))
            source = required(request.POST, 'source', 'Source')
            destination = required(request.POST, 'destination', 'Destination')
            cargo_weight = decimal_field(request.POST, 'cargo_weight', 'Cargo weight')
            planned_distance = decimal_field(request.POST, 'planned_distance', 'Planned distance')

            trip = Trip(
                vehicle=vehicle, driver=driver, source=source, destination=destination,
                cargo_weight=cargo_weight, planned_distance=planned_distance, created_by=request.user,
            )
            trip.clean()
            trip.save()
            log_action('trip', trip.pk, str(trip), 'Trip created (Draft)', user=request.user)
            messages.success(request, 'Trip created.')
            return redirect('trip_list')
        except FormError as e:
            messages.error(request, str(e))
        except ValidationError as e:
            messages.error(request, str(e.message) if hasattr(e, 'message') else str(e))

    vehicles = Vehicle.objects.filter(status='available')
    drivers = Driver.objects.filter(status='available').exclude(license_expiry__lt=timezone.now().date())
    return render(request, 'trips/trip_form.html', {'vehicles': vehicles, 'drivers': drivers})

@role_required('fleet_manager', 'driver', redirect_to='trip_list')
def trip_dispatch(request, pk):
    trip = get_object_or_404(Trip, pk=pk)
    try:
        trip.dispatch(user=request.user)
        messages.success(request, 'Trip dispatched!')
    except ValidationError as e:
        messages.error(request, str(e.message) if hasattr(e, 'message') else str(e))
    return redirect('trip_list')

@role_required('fleet_manager', 'driver', redirect_to='trip_list')
def trip_complete(request, pk):
    trip = get_object_or_404(Trip, pk=pk)
    if request.method == 'POST':
        try:
            final_odometer = decimal_field(request.POST, 'final_odometer', 'Final odometer')
            fuel_consumed = decimal_field(request.POST, 'fuel_consumed', 'Fuel consumed')
            actual_distance = decimal_field(request.POST, 'actual_distance', 'Actual distance')
            revenue = decimal_field(request.POST, 'revenue', 'Revenue', default=0, required_field=False)
            trip.complete(final_odometer=final_odometer, fuel_consumed=fuel_consumed,
                           actual_distance=actual_distance, revenue=revenue, user=request.user)
            messages.success(request, 'Trip completed!')
            return redirect('trip_list')
        except FormError as e:
            messages.error(request, str(e))
        except ValidationError as e:
            messages.error(request, str(e.message) if hasattr(e, 'message') else str(e))
    return render(request, 'trips/trip_complete.html', {'trip': trip})

@role_required('fleet_manager', 'driver', redirect_to='trip_list')
def trip_cancel(request, pk):
    trip = get_object_or_404(Trip, pk=pk)
    try:
        trip.cancel(user=request.user)
        messages.success(request, 'Trip cancelled.')
    except ValidationError as e:
        messages.error(request, str(e.message) if hasattr(e, 'message') else str(e))
    return redirect('trip_list')