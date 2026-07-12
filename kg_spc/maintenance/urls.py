from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import MaintenanceLogViewSet

router = SimpleRouter()
router.register(r'', MaintenanceLogViewSet, basename='maintenance')

urlpatterns = [
    path('', include(router.urls)),
]