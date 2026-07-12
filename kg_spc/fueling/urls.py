from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import FuelLogViewSet, ExpenseViewSet

router = SimpleRouter()
router.register(r'fuel', FuelLogViewSet, basename='fuellog')
router.register(r'expenses', ExpenseViewSet, basename='expense')

urlpatterns = [
    path('', include(router.urls)),
]
