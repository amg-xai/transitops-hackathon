from django.contrib import admin
from .models import FuelLog, Expense

@admin.register(FuelLog)
class FuelLogAdmin(admin.ModelAdmin):
    list_display = ['vehicle', 'liters', 'cost', 'date']

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['vehicle', 'category', 'amount', 'date']