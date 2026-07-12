"""
REST-style JSON API views for TransitOps.
Uses Django's built-in JsonResponse — no DRF dependency required.
"""
import json
from decimal import Decimal, InvalidOperation
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login, logout
from django.db.models import Sum, Q, Count
from django.utils import timezone

from core.models import User, AuditLog
from core.audit import log_action
from vehicles.models import Vehicle, VehicleDocument
from drivers.models import Driver
from trips.models import Trip
from fueling.models import FuelLog, Expense
from maintenance.models import MaintenanceLog


# ── Helpers ──────────────────────────────────────────────────────────────────

def _json_body(request):
    """Parse JSON request body, return dict."""
    try:
        return json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return {}


def _login_required_api(view_func):
    """Decorator: returns 401 JSON if user is not authenticated."""
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper


def _decimal(val, default=None):
    """Safely convert a value to Decimal."""
    if val is None or val == '':
        return default
    try:
        return Decimal(str(val))
    except (InvalidOperation, ValueError):
        return default


# ── Auth ─────────────────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(["POST"])
def api_login(request):
    data = _json_body(request)
    username = data.get('username', '')
    password = data.get('password', '')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return JsonResponse({
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'first_name': user.first_name,
            'last_name': user.last_name,
        })
    return JsonResponse({'error': 'Invalid credentials'}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def api_logout(request):
    logout(request)
    return JsonResponse({'ok': True})


def api_me(request):
    if request.user.is_authenticated:
        return JsonResponse({
            'id': request.user.id,
            'username': request.user.username,
            'role': request.user.role,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
        })
    return JsonResponse({'error': 'Not authenticated'}, status=401)


# ── Dashboard Stats ──────────────────────────────────────────────────────────

@_login_required_api
def api_dashboard_stats(request):
    total_vehicles = Vehicle.objects.count()
    available = Vehicle.objects.filter(status='available').count()
    on_trip = Vehicle.objects.filter(status='on_trip').count()
    in_shop = Vehicle.objects.filter(status='in_shop').count()
    retired = Vehicle.objects.filter(status='retired').count()
    total_drivers = Driver.objects.count()
    available_drivers = Driver.objects.filter(status='available').count()
    drivers_on_duty = Driver.objects.filter(status='on_trip').count()
    active_trips = Trip.objects.filter(status='dispatched').count()
    pending_trips = Trip.objects.filter(status='draft').count()
    completed_trips = Trip.objects.filter(status='completed')
    revenue = float(completed_trips.aggregate(r=Sum('revenue'))['r'] or 0)
    util_pct = round((on_trip / total_vehicles * 100), 1) if total_vehicles else 0

    return JsonResponse({
        'total_vehicles': total_vehicles,
        'available_vehicles': available,
        'on_trip_vehicles': on_trip,
        'in_shop_vehicles': in_shop,
        'retired_vehicles': retired,
        'total_drivers': total_drivers,
        'available_drivers': available_drivers,
        'drivers_on_duty': drivers_on_duty,
        'active_trips': active_trips,
        'pending_trips': pending_trips,
        'completed_trips_count': completed_trips.count(),
        'revenue': revenue,
        'fleet_utilization': util_pct,
    })


# ── Vehicles ─────────────────────────────────────────────────────────────────

def _vehicle_to_dict(v):
    return {
        'id': v.id,
        'registration_number': v.registration_number,
        'name': v.name,
        'vehicle_type': v.vehicle_type,
        'max_load_capacity': float(v.max_load_capacity),
        'odometer': float(v.odometer),
        'acquisition_cost': float(v.acquisition_cost),
        'status': v.status,
        'region': v.region,
        'created_at': v.created_at.isoformat() if v.created_at else None,
        'updated_at': v.updated_at.isoformat() if v.updated_at else None,
    }


@_login_required_api
@require_http_methods(["GET"])
def api_vehicle_list(request):
    qs = Vehicle.objects.all()
    q = request.GET.get('q', '').strip()
    status = request.GET.get('status', '')
    vtype = request.GET.get('vehicle_type', '')
    if q:
        qs = qs.filter(Q(registration_number__icontains=q) | Q(name__icontains=q) | Q(region__icontains=q))
    if status:
        qs = qs.filter(status=status)
    if vtype:
        qs = qs.filter(vehicle_type=vtype)
    qs = qs.order_by('registration_number')
    return JsonResponse([_vehicle_to_dict(v) for v in qs], safe=False)


@csrf_exempt
@_login_required_api
@require_http_methods(["POST"])
def api_vehicle_create(request):
    data = _json_body(request)
    try:
        v = Vehicle.objects.create(
            registration_number=data['registration_number'],
            name=data['name'],
            vehicle_type=data.get('vehicle_type', 'van'),
            max_load_capacity=_decimal(data.get('max_load_capacity', 0), Decimal('0')),
            acquisition_cost=_decimal(data.get('acquisition_cost', 0), Decimal('0')),
            odometer=_decimal(data.get('odometer', 0), Decimal('0')),
            region=data.get('region', ''),
        )
        log_action('vehicle', v.pk, str(v), 'Vehicle registered', user=request.user)
        return JsonResponse(_vehicle_to_dict(v), status=201)
    except KeyError as e:
        return JsonResponse({'error': f'Missing field: {e}'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@_login_required_api
@require_http_methods(["PUT", "DELETE"])
def api_vehicle_detail(request, pk):
    try:
        v = Vehicle.objects.get(pk=pk)
    except Vehicle.DoesNotExist:
        return JsonResponse({'error': 'Vehicle not found'}, status=404)

    if request.method == 'DELETE':
        label = str(v)
        v.delete()
        log_action('vehicle', pk, label, 'Vehicle deleted', user=request.user)
        return JsonResponse({'ok': True})

    # PUT
    data = _json_body(request)
    old_status = v.status
    for field in ['registration_number', 'name', 'vehicle_type', 'region', 'status']:
        if field in data:
            setattr(v, field, data[field])
    for field in ['max_load_capacity', 'odometer', 'acquisition_cost']:
        if field in data:
            setattr(v, field, _decimal(data[field], getattr(v, field)))
    v.save()
    if old_status != v.status:
        log_action('vehicle', v.pk, str(v), 'Status manually changed', old_status, v.status, request.user)
    return JsonResponse(_vehicle_to_dict(v))


# ── Drivers ──────────────────────────────────────────────────────────────────

def _driver_to_dict(d):
    return {
        'id': d.id,
        'name': d.name,
        'license_number': d.license_number,
        'license_category': d.license_category,
        'license_expiry': str(d.license_expiry),
        'contact_number': d.contact_number,
        'email': d.email,
        'safety_score': float(d.safety_score),
        'status': d.status,
        'is_license_expired': d.is_license_expired,
        'created_at': d.created_at.isoformat() if d.created_at else None,
    }


@_login_required_api
@require_http_methods(["GET"])
def api_driver_list(request):
    qs = Driver.objects.all()
    q = request.GET.get('q', '').strip()
    status = request.GET.get('status', '')
    if q:
        qs = qs.filter(Q(name__icontains=q) | Q(license_number__icontains=q))
    if status:
        qs = qs.filter(status=status)
    qs = qs.order_by('name')
    return JsonResponse([_driver_to_dict(d) for d in qs], safe=False)


@csrf_exempt
@_login_required_api
@require_http_methods(["POST"])
def api_driver_create(request):
    data = _json_body(request)
    try:
        d = Driver.objects.create(
            name=data['name'],
            license_number=data['license_number'],
            license_category=data.get('license_category', 'LMV'),
            license_expiry=data['license_expiry'],
            contact_number=data.get('contact_number', ''),
            email=data.get('email', ''),
            safety_score=_decimal(data.get('safety_score', 10), Decimal('10')),
        )
        log_action('driver', d.pk, str(d), 'Driver registered', user=request.user)
        return JsonResponse(_driver_to_dict(d), status=201)
    except KeyError as e:
        return JsonResponse({'error': f'Missing field: {e}'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@_login_required_api
@require_http_methods(["PUT", "DELETE"])
def api_driver_detail(request, pk):
    try:
        d = Driver.objects.get(pk=pk)
    except Driver.DoesNotExist:
        return JsonResponse({'error': 'Driver not found'}, status=404)

    if request.method == 'DELETE':
        label = str(d)
        d.delete()
        log_action('driver', pk, label, 'Driver deleted', user=request.user)
        return JsonResponse({'ok': True})

    data = _json_body(request)
    old_status = d.status
    for field in ['name', 'license_number', 'license_category', 'license_expiry', 'contact_number', 'email', 'status']:
        if field in data:
            setattr(d, field, data[field])
    if 'safety_score' in data:
        d.safety_score = _decimal(data['safety_score'], d.safety_score)
    d.save()
    if old_status != d.status:
        log_action('driver', d.pk, str(d), 'Status manually changed', old_status, d.status, request.user)
    return JsonResponse(_driver_to_dict(d))


# ── Trips ────────────────────────────────────────────────────────────────────

def _trip_to_dict(t):
    return {
        'id': t.id,
        'vehicle_id': t.vehicle_id,
        'vehicle_name': t.vehicle.name if hasattr(t, '_vehicle_cache') or 'vehicle' in t.__dict__ else (t.vehicle.name if t.vehicle_id else ''),
        'vehicle_reg': t.vehicle.registration_number if t.vehicle_id else '',
        'driver_id': t.driver_id,
        'driver_name': t.driver.name if t.driver_id else '',
        'source': t.source,
        'destination': t.destination,
        'cargo_weight': float(t.cargo_weight),
        'planned_distance': float(t.planned_distance),
        'actual_distance': float(t.actual_distance) if t.actual_distance else None,
        'fuel_consumed': float(t.fuel_consumed) if t.fuel_consumed else None,
        'revenue': float(t.revenue),
        'status': t.status,
        'created_at': t.created_at.isoformat() if t.created_at else None,
    }


@_login_required_api
@require_http_methods(["GET"])
def api_trip_list(request):
    qs = Trip.objects.select_related('vehicle', 'driver').all()
    q = request.GET.get('q', '').strip()
    status = request.GET.get('status', '')
    if q:
        qs = qs.filter(
            Q(source__icontains=q) | Q(destination__icontains=q) |
            Q(vehicle__registration_number__icontains=q) | Q(driver__name__icontains=q)
        )
    if status:
        qs = qs.filter(status=status)
    qs = qs.order_by('-created_at')
    return JsonResponse([_trip_to_dict(t) for t in qs], safe=False)


@csrf_exempt
@_login_required_api
@require_http_methods(["POST"])
def api_trip_create(request):
    data = _json_body(request)
    try:
        vehicle = Vehicle.objects.get(pk=data['vehicle_id'])
        driver = Driver.objects.get(pk=data['driver_id'])
        trip = Trip(
            vehicle=vehicle, driver=driver,
            source=data['source'], destination=data['destination'],
            cargo_weight=_decimal(data['cargo_weight'], Decimal('0')),
            planned_distance=_decimal(data['planned_distance'], Decimal('0')),
            revenue=_decimal(data.get('revenue', 0), Decimal('0')),
            created_by=request.user,
        )
        trip.clean()
        trip.save()
        log_action('trip', trip.pk, str(trip), 'Trip created (Draft)', user=request.user)
        return JsonResponse(_trip_to_dict(trip), status=201)
    except KeyError as e:
        return JsonResponse({'error': f'Missing field: {e}'}, status=400)
    except Vehicle.DoesNotExist:
        return JsonResponse({'error': 'Vehicle not found'}, status=404)
    except Driver.DoesNotExist:
        return JsonResponse({'error': 'Driver not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@_login_required_api
@require_http_methods(["POST"])
def api_trip_dispatch(request, pk):
    try:
        trip = Trip.objects.get(pk=pk)
        trip.dispatch(user=request.user)
        trip.refresh_from_db()
        return JsonResponse(_trip_to_dict(trip))
    except Trip.DoesNotExist:
        return JsonResponse({'error': 'Trip not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@_login_required_api
@require_http_methods(["POST"])
def api_trip_complete(request, pk):
    data = _json_body(request)
    try:
        trip = Trip.objects.get(pk=pk)
        trip.complete(
            final_odometer=_decimal(data.get('final_odometer', 0), Decimal('0')),
            fuel_consumed=_decimal(data.get('fuel_consumed', 0), Decimal('0')),
            actual_distance=_decimal(data.get('actual_distance', 0), Decimal('0')),
            revenue=_decimal(data.get('revenue', 0), Decimal('0')),
            user=request.user,
        )
        trip.refresh_from_db()
        return JsonResponse(_trip_to_dict(trip))
    except Trip.DoesNotExist:
        return JsonResponse({'error': 'Trip not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@_login_required_api
@require_http_methods(["POST"])
def api_trip_cancel(request, pk):
    try:
        trip = Trip.objects.get(pk=pk)
        trip.cancel(user=request.user)
        trip.refresh_from_db()
        return JsonResponse(_trip_to_dict(trip))
    except Trip.DoesNotExist:
        return JsonResponse({'error': 'Trip not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


# ── Fueling ──────────────────────────────────────────────────────────────────

def _fuellog_to_dict(f):
    return {
        'id': f.id,
        'vehicle_id': f.vehicle_id,
        'vehicle_name': f.vehicle.name if f.vehicle_id else '',
        'vehicle_reg': f.vehicle.registration_number if f.vehicle_id else '',
        'trip_id': f.trip_id,
        'liters': float(f.liters),
        'cost': float(f.cost),
        'date': str(f.date),
        'created_at': f.created_at.isoformat() if f.created_at else None,
    }


@_login_required_api
@require_http_methods(["GET"])
def api_fuellog_list(request):
    qs = FuelLog.objects.select_related('vehicle').order_by('-date')
    return JsonResponse([_fuellog_to_dict(f) for f in qs], safe=False)


@csrf_exempt
@_login_required_api
@require_http_methods(["POST"])
def api_fuellog_create(request):
    data = _json_body(request)
    try:
        vehicle = Vehicle.objects.get(pk=data['vehicle_id'])
        fl = FuelLog.objects.create(
            vehicle=vehicle,
            trip_id=data.get('trip_id'),
            liters=_decimal(data['liters'], Decimal('0')),
            cost=_decimal(data['cost'], Decimal('0')),
            date=data['date'],
        )
        log_action('vehicle', vehicle.pk, str(vehicle), f'Fuel log added ({fl.liters} L, ₹{fl.cost})', user=request.user)
        return JsonResponse(_fuellog_to_dict(fl), status=201)
    except KeyError as e:
        return JsonResponse({'error': f'Missing field: {e}'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


# ── Expenses ─────────────────────────────────────────────────────────────────

def _expense_to_dict(e):
    return {
        'id': e.id,
        'vehicle_id': e.vehicle_id,
        'vehicle_name': e.vehicle.name if e.vehicle_id else '',
        'vehicle_reg': e.vehicle.registration_number if e.vehicle_id else '',
        'trip_id': e.trip_id,
        'category': e.category,
        'amount': float(e.amount),
        'description': e.description,
        'date': str(e.date),
        'created_at': e.created_at.isoformat() if e.created_at else None,
    }


@_login_required_api
@require_http_methods(["GET"])
def api_expense_list(request):
    qs = Expense.objects.select_related('vehicle').order_by('-date')
    return JsonResponse([_expense_to_dict(e) for e in qs], safe=False)


@csrf_exempt
@_login_required_api
@require_http_methods(["POST"])
def api_expense_create(request):
    data = _json_body(request)
    try:
        vehicle = Vehicle.objects.get(pk=data['vehicle_id'])
        exp = Expense.objects.create(
            vehicle=vehicle,
            trip_id=data.get('trip_id'),
            category=data.get('category', 'other'),
            amount=_decimal(data['amount'], Decimal('0')),
            description=data.get('description', ''),
            date=data['date'],
        )
        log_action('vehicle', vehicle.pk, str(vehicle), f'Expense logged: {exp.category} ₹{exp.amount}', user=request.user)
        return JsonResponse(_expense_to_dict(exp), status=201)
    except KeyError as e:
        return JsonResponse({'error': f'Missing field: {e}'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


# ── Maintenance ──────────────────────────────────────────────────────────────

def _maintenance_to_dict(m):
    return {
        'id': m.id,
        'vehicle_id': m.vehicle_id,
        'vehicle_name': m.vehicle.name if m.vehicle_id else '',
        'vehicle_reg': m.vehicle.registration_number if m.vehicle_id else '',
        'description': m.description,
        'cost': float(m.cost),
        'status': m.status,
        'start_date': str(m.start_date),
        'end_date': str(m.end_date) if m.end_date else None,
        'created_at': m.created_at.isoformat() if m.created_at else None,
    }


@_login_required_api
@require_http_methods(["GET"])
def api_maintenance_list(request):
    qs = MaintenanceLog.objects.select_related('vehicle').order_by('-start_date')
    return JsonResponse([_maintenance_to_dict(m) for m in qs], safe=False)


@csrf_exempt
@_login_required_api
@require_http_methods(["POST"])
def api_maintenance_create(request):
    data = _json_body(request)
    try:
        vehicle = Vehicle.objects.get(pk=data['vehicle_id'])
        ml = MaintenanceLog.objects.create(
            vehicle=vehicle,
            description=data['description'],
            cost=_decimal(data.get('cost', 0), Decimal('0')),
            start_date=data['start_date'],
        )
        log_action('maintenance', ml.pk, str(ml), 'Maintenance record opened', user=request.user)
        return JsonResponse(_maintenance_to_dict(ml), status=201)
    except KeyError as e:
        return JsonResponse({'error': f'Missing field: {e}'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@_login_required_api
@require_http_methods(["POST"])
def api_maintenance_close(request, pk):
    try:
        ml = MaintenanceLog.objects.get(pk=pk)
        ml.close(user=request.user)
        ml.refresh_from_db()
        return JsonResponse(_maintenance_to_dict(ml))
    except MaintenanceLog.DoesNotExist:
        return JsonResponse({'error': 'Maintenance log not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
