from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Employee
from .serializers import EmployeeSerializer, EmployeeListSerializer

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all().order_by('-created_at')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'status', 'employee_type']
    search_fields = ['code', 'full_name', 'email', 'phone']

    def get_serializer_class(self):
        if self.action == 'list':
            return EmployeeListSerializer
        return EmployeeSerializer

    def perform_create(self, serializer):
        # Tự sinh mã nhân viên
        last = Employee.objects.order_by('-id').first()
        next_id = (last.id + 1) if last else 1
        code = f"NV{next_id:04d}"
        serializer.save(code=code)

    @action(detail=True, methods=['patch'])
    def deactivate(self, request, pk=None):
        employee = self.get_object()
        employee.status = 'inactive'
        employee.save()
        return Response({'message': f'{employee.full_name} đã ngưng hoạt động'})