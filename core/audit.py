from .models import AuditLog


def log_action(entity_type, entity_id, entity_label, action, old_value='', new_value='', user=None):
    """
    Write one audit trail entry. Deliberately swallows its own errors —
    a logging failure must never break the business operation that
    triggered it (e.g. a trip should still dispatch even if the audit
    write somehow fails).
    """
    try:
        AuditLog.objects.create(
            entity_type=entity_type, entity_id=entity_id, entity_label=entity_label,
            action=action, old_value=str(old_value), new_value=str(new_value),
            performed_by=user if user and user.is_authenticated else None,
        )
    except Exception:
        pass