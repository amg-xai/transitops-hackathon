from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/login/', views.api_login, name='api_login'),
    path('auth/logout/', views.api_logout, name='api_logout'),
    path('auth/me/', views.api_me, name='api_me'),

    # Dashboard
    path('dashboard/stats/', views.api_dashboard_stats, name='api_dashboard_stats'),

    # Vehicles
    path('vehicles/', views.api_vehicle_list, name='api_vehicle_list'),
    path('vehicles/create/', views.api_vehicle_create, name='api_vehicle_create'),
    path('vehicles/<int:pk>/', views.api_vehicle_detail, name='api_vehicle_detail'),

    # Drivers
    path('drivers/', views.api_driver_list, name='api_driver_list'),
    path('drivers/create/', views.api_driver_create, name='api_driver_create'),
    path('drivers/<int:pk>/', views.api_driver_detail, name='api_driver_detail'),

    # Trips
    path('trips/', views.api_trip_list, name='api_trip_list'),
    path('trips/create/', views.api_trip_create, name='api_trip_create'),
    path('trips/<int:pk>/dispatch/', views.api_trip_dispatch, name='api_trip_dispatch'),
    path('trips/<int:pk>/complete/', views.api_trip_complete, name='api_trip_complete'),
    path('trips/<int:pk>/cancel/', views.api_trip_cancel, name='api_trip_cancel'),

    # Fueling
    path('fueling/', views.api_fuellog_list, name='api_fuellog_list'),
    path('fueling/create/', views.api_fuellog_create, name='api_fuellog_create'),

    # Expenses
    path('expenses/', views.api_expense_list, name='api_expense_list'),
    path('expenses/create/', views.api_expense_create, name='api_expense_create'),

    # Maintenance
    path('maintenance/', views.api_maintenance_list, name='api_maintenance_list'),
    path('maintenance/create/', views.api_maintenance_create, name='api_maintenance_create'),
    path('maintenance/<int:pk>/close/', views.api_maintenance_close, name='api_maintenance_close'),
]
