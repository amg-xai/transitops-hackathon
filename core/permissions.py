from functools import wraps
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.shortcuts import redirect


def role_required(*roles, redirect_to=None):
    """
    Usage: @role_required('fleet_manager', 'safety_officer', redirect_to='driver_list')
    Superusers always pass. Anyone else not in `roles` gets bounced back
    with an error message instead of a raw 403 page.
    """
    def decorator(view_func):
        @wraps(view_func)
        @login_required
        def _wrapped(request, *args, **kwargs):
            if request.user.is_superuser or request.user.role in roles:
                return view_func(request, *args, **kwargs)
            messages.error(request, "You don't have permission to perform this action.")
            return redirect(redirect_to or '/')
        return _wrapped
    return decorator