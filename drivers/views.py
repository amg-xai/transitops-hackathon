from django.core.exceptions import ValidationError as DjangoValidationError
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import IntegrityError
from django.db.models import Q
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from core.permissions import role_required
from core.audit import log_action
from core.utils import required, decimal_field, FormError
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

    return render(request, 'drivers/driver_list.html', {
        'drivers': drivers, 'q': q, 'selected_status': status, 'sort': sort,
        'status_choices': Driver.STATUS_CHOICES,
    })

@role_required('fleet_manager', 'safety_officer', redirect_to='driver_list')
def driver_add(request):
    if request.method == 'POST':
        try:
            name = required(request.POST, 'name', 'Full name')
            license_number = required(request.POST, 'license_number', 'License number')
            license_category = required(request.POST, 'license_category', 'License category')
            license_expiry = required(request.POST, 'license_expiry', 'License expiry date')
            contact_number = required(request.POST, 'contact_number', 'Contact number')
            email = (request.POST.get('email') or '').strip()
            safety_score = decimal_field(request.POST, 'safety_score', 'Safety score', default=10, required_field=False)

            driver = Driver.objects.create(
                name=name, license_number=license_number, license_category=license_category,
                license_expiry=license_expiry, contact_number=contact_number, email=email, safety_score=safety_score,
            )
            log_action('driver', driver.pk, str(driver), 'Driver registered', user=request.user)
            messages.success(request, 'Driver added successfully.')
            return redirect('driver_list')
        except FormError as e:
            messages.error(request, str(e))
        except IntegrityError:
            messages.error(request, f"License number '{request.POST.get('license_number')}' already exists.")
        except (ValueError, DjangoValidationError):
            messages.error(request, 'License expiry date is invalid. Please use the date picker.')
    return render(request, 'drivers/driver_form.html', {'action': 'Add'})

@role_required('fleet_manager', 'safety_officer', redirect_to='driver_list')
def driver_edit(request, pk):
    driver = get_object_or_404(Driver, pk=pk)
    if request.method == 'POST':
        try:
            old_status = driver.status
            driver.name             = required(request.POST, 'name', 'Full name')
            driver.license_number   = required(request.POST, 'license_number', 'License number')
            driver.license_category = required(request.POST, 'license_category', 'License category')
            driver.license_expiry   = required(request.POST, 'license_expiry', 'License expiry date')
            driver.contact_number   = required(request.POST, 'contact_number', 'Contact number')
            driver.email            = (request.POST.get('email') or '').strip()
            driver.safety_score     = decimal_field(request.POST, 'safety_score', 'Safety score', default=driver.safety_score, required_field=False)
            driver.status           = required(request.POST, 'status', 'Status')
            driver.save()
            if old_status != driver.status:
                log_action('driver', driver.pk, str(driver), 'Status manually changed', old_status, driver.status, request.user)
            messages.success(request, 'Driver updated.')
            return redirect('driver_list')
        except FormError as e:
            messages.error(request, str(e))
        except IntegrityError:
            messages.error(request, 'That license number is already in use.')
        except (ValueError, DjangoValidationError):
            messages.error(request, 'License expiry date is invalid. Please use the date picker.')
    return render(request, 'drivers/driver_form.html', {'action': 'Edit', 'driver': driver})

@role_required('fleet_manager', redirect_to='driver_list')
def driver_delete(request, pk):
    driver = get_object_or_404(Driver, pk=pk)
    if request.method == 'POST':
        label = str(driver)
        driver.delete()
        log_action('driver', pk, label, 'Driver deleted', user=request.user)
        messages.success(request, 'Driver deleted.')
        return redirect('driver_list')
    return render(request, 'drivers/driver_confirm_delete.html', {'driver': driver})

@role_required('fleet_manager', 'safety_officer', redirect_to='driver_list')
def driver_send_reminder(request, pk):
    driver = get_object_or_404(Driver, pk=pk)
    if not driver.email:
        messages.error(request, f"{driver.name} has no email on file — add one before sending a reminder.")
        return redirect('driver_list')
    send_mail(
        subject="TransitOps: License renewal reminder",
        message=(
            f"Hi {driver.name},\n\nThis is a reminder that your license "
            f"({driver.license_number}) expires on {driver.license_expiry.strftime('%d %b %Y')}. "
            f"Please renew it promptly.\n\nTransitOps Fleet Operations"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL, recipient_list=[driver.email], fail_silently=False,
    )
    driver.last_reminder_sent_at = timezone.now()
    driver.save(update_fields=['last_reminder_sent_at'])
    log_action('driver', driver.pk, str(driver), 'License reminder email sent', user=request.user)
    messages.success(request, f"Reminder email sent to {driver.name} ({driver.email}).")
    return redirect('driver_list')