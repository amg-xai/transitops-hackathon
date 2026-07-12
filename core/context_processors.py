def role_flags(request):
    user = getattr(request, 'user', None)
    if not user or not user.is_authenticated:
        return {}
    role = user.role
    su = user.is_superuser
    return {
        'can_manage_vehicles':    su or role == 'fleet_manager',
        'can_manage_drivers':     su or role in ('fleet_manager', 'safety_officer'),
        'can_delete_drivers':     su or role == 'fleet_manager',
        'can_manage_trips':       su or role in ('fleet_manager', 'driver'),
        'can_manage_maintenance': su or role == 'fleet_manager',
        'can_manage_fueling':     su or role in ('fleet_manager', 'financial_analyst'),
        'can_view_reports':       su or role in ('fleet_manager', 'financial_analyst'),
    }