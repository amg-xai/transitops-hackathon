from django.urls import path
from . import views

urlpatterns = [
    path('', views.fuel_list, name='fuel_list'),
    path('add/', views.fuel_add, name='fuel_add'),
    path('expense/add/', views.expense_add, name='expense_add'),
]
