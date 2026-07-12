from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Driver
from .serializers import DriverSerializer, DriverListSerializer


class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'license_category']
    search_fields = ['name', 'license_number', 'contact_number']
    ordering_fields = ['created_at', 'name', 'safety_score']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return DriverListSerializer
        return DriverSerializer

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get only available drivers for dispatch"""
        available = self.queryset.filter(status='available')
        serializer = DriverListSerializer(available, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def dispatchable(self, request):
        """Get dispatchable drivers (available with valid license)"""
        dispatchable = [d for d in self.queryset.all() if d.is_dispatchable]
        serializer = DriverListSerializer(dispatchable, many=True)
        return Response(serializer.data)
