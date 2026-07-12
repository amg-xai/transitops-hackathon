from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Vehicle
from .serializers import VehicleSerializer, VehicleListSerializer


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'vehicle_type', 'region']
    search_fields = ['registration_number', 'name']
    ordering_fields = ['created_at', 'name', 'registration_number']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return VehicleListSerializer
        return VehicleSerializer

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get only available vehicles for dispatch"""
        available = self.queryset.filter(status='available')
        serializer = VehicleListSerializer(available, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def dispatchable(self, request):
        """Get dispatchable vehicles (available only)"""
        dispatchable = [v for v in self.queryset.all() if v.is_dispatchable]
        serializer = VehicleListSerializer(dispatchable, many=True)
        return Response(serializer.data)
