from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('core.urls')),
    path('api/', include('dashboard.urls')),
    path('api/vehicles/', include('vehicles.urls')),
    path('api/drivers/', include('drivers.urls')),
    path('api/trips/', include('trips.urls')),
    path('api/maintenance/', include('maintenance.urls')),
    path('api/fueling/', include('fueling.urls')),
]