from decimal import Decimal
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import IntegrityError
from django.db.models import Q
from core.permissions import role_required
from core.audit import log_action
from core.utils import required, decimal_field, FormError
from .models import Vehicle, VehicleDocument

@login_required
def vehicle_list(request):
    vehicles = Vehicle.objects.all()
    q = request.GET.get('q', '').strip()
    status = request.GET.get('status', '')
    vtype = request.GET.get('vehicle_type', '')
    sort = request.GET.get('sort', 'registration_number')

    if q:
        vehicles = vehicles.filter(Q(registration_number__icontains=q) | Q(name__icontains=q) | Q(region__icontains=q))
    if status:
        vehicles = vehicles.filter(status=status)
    if vtype:
        vehicles = vehicles.filter(vehicle_type=vtype)

    allowed_sorts = ['registration_number', 'name', 'vehicle_type', 'max_load_capacity', 'odometer', 'status']
    if sort.lstrip('-') not in allowed_sorts:
        sort = 'registration_number'
    vehicles = vehicles.order_by(sort)

    return render(request, 'vehicles/vehicle_list.html', {
        'vehicles': vehicles, 'q': q, 'selected_status': status, 'selected_type': vtype, 'sort': sort,
        'status_choices': Vehicle.STATUS_CHOICES, 'type_choices': Vehicle.TYPE_CHOICES,
    })

@role_required('fleet_manager', redirect_to='vehicle_list')
def vehicle_add(request):
    if request.method == 'POST':
        try:
            reg = required(request.POST, 'registration_number', 'Registration number')
            name = required(request.POST, 'name', 'Name')
            vtype = required(request.POST, 'vehicle_type', 'Vehicle type')
            capacity = decimal_field(request.POST, 'max_load_capacity', 'Max load capacity')
            cost = decimal_field(request.POST, 'acquisition_cost', 'Acquisition cost')
            odometer = decimal_field(request.POST, 'odometer', 'Odometer', default=Decimal('0'), required_field=False)
            region = (request.POST.get('region') or '').strip()

            vehicle = Vehicle.objects.create(
                registration_number=reg, name=name, vehicle_type=vtype,
                max_load_capacity=capacity, acquisition_cost=cost, odometer=odometer, region=region,
            )
            log_action('vehicle', vehicle.pk, str(vehicle), 'Vehicle registered', user=request.user)
            messages.success(request, 'Vehicle added successfully.')
            return redirect('vehicle_list')
        except FormError as e:
            messages.error(request, str(e))
        except IntegrityError:
            messages.error(request, f"Registration number '{request.POST.get('registration_number')}' already exists.")
    return render(request, 'vehicles/vehicle_form.html', {'action': 'Add'})

@role_required('fleet_manager', redirect_to='vehicle_list')
def vehicle_edit(request, pk):
    vehicle = get_object_or_404(Vehicle, pk=pk)
    if request.method == 'POST':
        try:
            old_status = vehicle.status
            vehicle.registration_number = required(request.POST, 'registration_number', 'Registration number')
            vehicle.name                = required(request.POST, 'name', 'Name')
            vehicle.vehicle_type        = required(request.POST, 'vehicle_type', 'Vehicle type')
            vehicle.max_load_capacity   = decimal_field(request.POST, 'max_load_capacity', 'Max load capacity')
            vehicle.acquisition_cost    = decimal_field(request.POST, 'acquisition_cost', 'Acquisition cost')
            vehicle.odometer            = decimal_field(request.POST, 'odometer', 'Odometer', default=vehicle.odometer, required_field=False)
            vehicle.region              = (request.POST.get('region') or '').strip()
            vehicle.status              = required(request.POST, 'status', 'Status')
            vehicle.save()
            if old_status != vehicle.status:
                log_action('vehicle', vehicle.pk, str(vehicle), 'Status manually changed', old_status, vehicle.status, request.user)
            messages.success(request, 'Vehicle updated.')
            return redirect('vehicle_list')
        except FormError as e:
            messages.error(request, str(e))
        except IntegrityError:
            messages.error(request, 'That registration number is already in use.')
    return render(request, 'vehicles/vehicle_form.html', {'action': 'Edit', 'vehicle': vehicle})

@role_required('fleet_manager', redirect_to='vehicle_list')
def vehicle_delete(request, pk):
    vehicle = get_object_or_404(Vehicle, pk=pk)
    if request.method == 'POST':
        label = str(vehicle)
        vehicle.delete()
        log_action('vehicle', pk, label, 'Vehicle deleted', user=request.user)
        messages.success(request, 'Vehicle deleted.')
        return redirect('vehicle_list')
    return render(request, 'vehicles/vehicle_confirm_delete.html', {'vehicle': vehicle})

@login_required
def vehicle_documents(request, pk):
    vehicle = get_object_or_404(Vehicle, pk=pk)
    documents = vehicle.documents.all().order_by('-uploaded_at')
    return render(request, 'vehicles/vehicle_documents.html', {'vehicle': vehicle, 'documents': documents})

@role_required('fleet_manager', redirect_to='vehicle_list')
def document_upload(request, pk):
    vehicle = get_object_or_404(Vehicle, pk=pk)
    if request.method == 'POST':
        f = request.FILES.get('file')
        if not f:
            messages.error(request, 'Please choose a file to upload.')
        else:
            doc_type = request.POST.get('document_type', 'other')
            VehicleDocument.objects.create(
                vehicle=vehicle, document_type=doc_type, file=f,
                expiry_date=request.POST.get('expiry_date') or None, uploaded_by=request.user,
            )
            log_action('vehicle', vehicle.pk, str(vehicle), f'Document uploaded ({doc_type})', user=request.user)
            messages.success(request, 'Document uploaded.')
            return redirect('vehicle_documents', pk=vehicle.pk)
    return render(request, 'vehicles/document_upload.html', {'vehicle': vehicle})

@role_required('fleet_manager', redirect_to='vehicle_list')
def document_delete(request, doc_pk):
    doc = get_object_or_404(VehicleDocument, pk=doc_pk)
    vehicle_pk = doc.vehicle.pk
    if request.method == 'POST':
        doc.file.delete(save=False)
        doc.delete()
        messages.success(request, 'Document deleted.')
    return redirect('vehicle_documents', pk=vehicle_pk)