from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.shortcuts import render
from .models import AuditLog


@login_required
def activity_log(request):
    logs = AuditLog.objects.select_related('performed_by').all()
    entity_type = request.GET.get('entity_type', '')
    if entity_type:
        logs = logs.filter(entity_type=entity_type)

    paginator = Paginator(logs, 25)
    page_obj = paginator.get_page(request.GET.get('page', 1))

    return render(request, 'core/activity_log.html', {
        'page_obj': page_obj,
        'entity_types': AuditLog.ENTITY_CHOICES,
        'selected_entity_type': entity_type,
    })