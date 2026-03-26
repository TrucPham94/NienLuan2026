from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SalaryMonthViewSet

router = DefaultRouter()
router.register(r'', SalaryMonthViewSet, basename='salary')

urlpatterns = [
    path('', include(router.urls)),
]