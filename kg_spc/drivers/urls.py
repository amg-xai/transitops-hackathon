from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import DriverViewSet

router = SimpleRouter()
router.register(r'', DriverViewSet, basename='driver')

urlpatterns = [
    path('', include(router.urls)),
]