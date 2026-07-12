from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import MaintenanceLog
from .serializers import MaintenanceLogSerializer, MaintenanceLogListSerializer


class MaintenanceLogViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceLog.objects.select_related('vehicle').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'vehicle']
    search_fields = ['description', 'vehicle__registration_number', 'vehicle__name']
    ordering_fields = ['created_at', 'start_date', 'cost']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return MaintenanceLogListSerializer
        return MaintenanceLogSerializer

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close maintenance - restores vehicle to Available (unless Retired)"""
        maintenance_log = self.get_object()
        try:
            maintenance_log.close()
            return Response({
                'message': 'Maintenance closed successfully',
                'maintenance_log': MaintenanceLogSerializer(maintenance_log).data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
