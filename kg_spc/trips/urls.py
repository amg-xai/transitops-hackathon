from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import TripViewSet

router = SimpleRouter()
router.register(r'', TripViewSet, basename='trip')

urlpatterns = [
    path('', include(router.urls)),
]