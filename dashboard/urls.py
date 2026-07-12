from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('reports/', views.reports, name='reports'),
    path('reports/export/', views.reports_csv, name='reports_csv'),
    path('reports/export/pdf/', views.reports_pdf, name='reports_pdf'),
]