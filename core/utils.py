from decimal import Decimal, InvalidOperation


class FormError(Exception):
    """Raised to bail out of a view with a friendly, user-facing message
    instead of letting Django throw a raw 500 on bad input."""
    pass


def required(post, key, label=None):
    label = label or key.replace('_', ' ').title()
    value = (post.get(key) or '').strip()
    if not value:
        raise FormError(f"{label} is required.")
    return value


def decimal_field(post, key, label=None, default=None, required_field=True):
    label = label or key.replace('_', ' ').title()
    raw = (post.get(key) or '').strip()
    if not raw:
        if required_field:
            raise FormError(f"{label} is required.")
        return default
    try:
        value = Decimal(raw)
    except InvalidOperation:
        raise FormError(f"{label} must be a valid number.")
    if value < 0:
        raise FormError(f"{label} cannot be negative.")
    return value