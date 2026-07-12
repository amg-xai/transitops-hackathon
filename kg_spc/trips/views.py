from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.core.exceptions import ValidationError
from .models import Trip
from .serializers import TripSerializer, TripListSerializer, TripDispatchSerializer, TripCompleteSerializer


class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.select_related('vehicle', 'driver', 'created_by').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'vehicle', 'driver']
    search_fields = ['source', 'destination', 'vehicle__registration_number', 'driver__name']
    ordering_fields = ['created_at', 'planned_distance', 'cargo_weight']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return TripListSerializer
        return TripSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def dispatch(self, request, pk=None):
        """Dispatch a trip - validates and flips vehicle/driver statuses"""
        trip = self.get_object()
        serializer = TripDispatchSerializer(data={}, context={'trip': trip})
        if serializer.is_valid():
            try:
                trip.dispatch()
                return Response({
                    'message': 'Trip dispatched successfully',
                    'trip': TripSerializer(trip).data
                }, status=status.HTTP_200_OK)
            except ValidationError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete a trip - restores vehicle/driver statuses"""
        trip = self.get_object()
        serializer = TripCompleteSerializer(data=request.data, context={'trip': trip})
        if serializer.is_valid():
            try:
                trip.complete(
                    final_odometer=serializer.validated_data['final_odometer'],
                    fuel_consumed=serializer.validated_data['fuel_consumed'],
                    actual_distance=serializer.validated_data['actual_distance'],
                    revenue=serializer.validated_data.get('revenue', 0)
                )
                return Response({
                    'message': 'Trip completed successfully',
                    'trip': TripSerializer(trip).data
                }, status=status.HTTP_200_OK)
            except ValidationError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a trip - restores statuses if dispatched"""
        trip = self.get_object()
        try:
            trip.cancel()
            return Response({
                'message': 'Trip cancelled successfully',
                'trip': TripSerializer(trip).data
            }, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
