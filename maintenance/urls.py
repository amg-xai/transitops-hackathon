from django.urls import path
from . import views

urlpatterns = [
    path('', views.maintenance_list, name='maintenance_list'),
    path('add/', views.maintenance_add, name='maintenance_add'),
    path('<int:pk>/close/', views.maintenance_close, name='maintenance_close'),
]