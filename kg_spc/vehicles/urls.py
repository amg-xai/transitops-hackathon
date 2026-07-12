from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import VehicleViewSet

router = SimpleRouter()
router.register(r'', VehicleViewSet, basename='vehicle')

urlpatterns = [
    path('', include(router.urls)),
]