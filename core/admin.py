from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, AuditLog

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Role', {'fields': ('role',)}),
    )


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['timestamp', 'entity_type', 'entity_label', 'action', 'old_value', 'new_value', 'performed_by']
    list_filter = ['entity_type']
    search_fields = ['entity_label', 'action']
    readonly_fields = [f.name for f in AuditLog._meta.fields]

    def has_add_permission(self, request):
        return False  # audit entries are system-generated only, never manual