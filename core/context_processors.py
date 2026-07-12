"""
Context processors to dynamically expose permission flags to templates.
Determines UI layout permissions based on user roles and superuser status.
"""

def role_flags(request):
    """
    Exposes boolean permission flags to templates for conditionally 
    displaying menu options, action buttons, and links based on user roles.
    """
    user = getattr(request, 'user', None)
    if not user or not user.is_authenticated:
        return {}
    role = user.role
    su = user.is_superuser
    return {
        # Fleet Managers can add/edit/delete vehicles, everyone else can only view.
        'can_manage_vehicles':    su or role == 'fleet_manager',
        
        # Fleet Managers and Safety Officers can edit driver records.
        'can_manage_drivers':     su or role in ('fleet_manager', 'safety_officer'),
        
        # Only Fleet Managers can completely delete driver records from the database.
        'can_delete_drivers':     su or role == 'fleet_manager',
        
        # Fleet Managers and Drivers can schedule and execute trips.
        'can_manage_trips':       su or role in ('fleet_manager', 'driver'),
        
        # Only Fleet Managers can schedule maintenance and close logs.
        'can_manage_maintenance': su or role == 'fleet_manager',
        
        # Fleet Managers and Financial Analysts can log fuel transactions and expenses.
        'can_manage_fueling':     su or role in ('fleet_manager', 'financial_analyst'),
        
        # Fleet Managers and Financial Analysts can view financial reports and export CSVs.
        'can_view_reports':       su or role in ('fleet_manager', 'financial_analyst'),
    }