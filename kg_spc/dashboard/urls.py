from django.urls import path
from .views import (
    dashboard_kpis, vehicle_status_summary, driver_status_summary, trip_status_summary,
    fuel_efficiency_report, operational_cost_report, vehicle_roi_report, fleet_utilization_report,
    export_vehicles_csv, export_drivers_csv, export_trips_csv, export_fuel_logs_csv, export_expenses_csv
)

urlpatterns = [
    path('kpis/', dashboard_kpis, name='dashboard_kpis'),
    path('summary/vehicles/', vehicle_status_summary, name='vehicle_status_summary'),
    path('summary/drivers/', driver_status_summary, name='driver_status_summary'),
    path('summary/trips/', trip_status_summary, name='trip_status_summary'),
    path('reports/fuel-efficiency/', fuel_efficiency_report, name='fuel_efficiency_report'),
    path('reports/operational-cost/', operational_cost_report, name='operational_cost_report'),
    path('reports/vehicle-roi/', vehicle_roi_report, name='vehicle_roi_report'),
    path('reports/fleet-utilization/', fleet_utilization_report, name='fleet_utilization_report'),
    path('export/vehicles/', export_vehicles_csv, name='export_vehicles_csv'),
    path('export/drivers/', export_drivers_csv, name='export_drivers_csv'),
    path('export/trips/', export_trips_csv, name='export_trips_csv'),
    path('export/fuel-logs/', export_fuel_logs_csv, name='export_fuel_logs_csv'),
    path('export/expenses/', export_expenses_csv, name='export_expenses_csv'),
]