from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import SalaryMonth
from .serializers import SalaryMonthSerializer

class SalaryMonthViewSet(viewsets.ModelViewSet):
    queryset = SalaryMonth.objects.all().order_by('-year', '-month')
    serializer_class = SalaryMonthSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['employee', 'month', 'year', 'status']
    search_fields = ['employee__full_name', 'employee__code']

    @action(detail=True, methods=['patch'])
    def confirm(self, request, pk=None):
        salary = self.get_object()
        salary.status = 'confirmed'
        salary.updated_by = request.user.username
        salary.save()
        return Response({'message': f'Đã chốt lương tháng {salary.month}/{salary.year}'})

    @action(detail=False, methods=['get'])
    def by_month(self, request):
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        if not month or not year:
            return Response({'error': 'Cần truyền month và year'}, status=400)
        salaries = SalaryMonth.objects.filter(month=month, year=year)
        serializer = self.get_serializer(salaries, many=True)
        return Response(serializer.data)