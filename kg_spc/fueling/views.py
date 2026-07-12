from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum
from .models import FuelLog, Expense
from .serializers import FuelLogSerializer, FuelLogListSerializer, ExpenseSerializer, ExpenseListSerializer


class FuelLogViewSet(viewsets.ModelViewSet):
    queryset = FuelLog.objects.select_related('vehicle', 'trip').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vehicle', 'trip', 'date']
    search_fields = ['vehicle__registration_number', 'vehicle__name']
    ordering_fields = ['created_at', 'date', 'liters', 'cost']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return FuelLogListSerializer
        return FuelLogSerializer


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.select_related('vehicle', 'trip').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vehicle', 'trip', 'category', 'date']
    search_fields = ['vehicle__registration_number', 'vehicle__name', 'description']
    ordering_fields = ['created_at', 'date', 'amount']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ExpenseListSerializer
        return ExpenseSerializer

    @action(detail=False, methods=['get'])
    def by_vehicle(self, request):
        """Get expenses grouped by vehicle with totals"""
        vehicle_id = request.query_params.get('vehicle_id')
        if vehicle_id:
            expenses = self.queryset.filter(vehicle_id=vehicle_id)
        else:
            expenses = self.queryset.all()
        
        total = expenses.aggregate(total=Sum('amount'))['total'] or 0
        serializer = ExpenseListSerializer(expenses, many=True)
        return Response({
            'total': total,
            'expenses': serializer.data
        })
