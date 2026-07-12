"""
Provides decorators for enforcing role-based access controls (RBAC) on views.
Checks if a user has one of the allowed roles before running a view, redirecting
unauthorized requests with user-facing flash messages.
"""
from functools import wraps
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.shortcuts import redirect


def role_required(*roles, redirect_to=None):
    """
    Decorator to restrict view access to specific user roles.
    
    Usage: @role_required('fleet_manager', 'safety_officer', redirect_to='driver_list')
    
    - Superusers are always allowed.
    - Authorized roles proceed directly to the view function.
    - Unauthorized users receive a warning message and are redirected.
    """
    def decorator(view_func):
        @wraps(view_func)
        @login_required
        def _wrapped(request, *args, **kwargs):
            # Check user role authorization
            if request.user.is_superuser or request.user.role in roles:
                return view_func(request, *args, **kwargs)
            
            # Warn and redirect unauthorized users
            messages.error(request, "You don't have permission to perform this action.")
            return redirect(redirect_to or '/')
        return _wrapped
    return decorator