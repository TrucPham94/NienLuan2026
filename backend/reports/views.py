from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from employees.models import Employee
from departments.models import Department
from contracts.models import Contract
from datetime import date, timedelta

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_employees = Employee.objects.filter(status='active').count()
        total_departments = Department.objects.count()
        new_this_month = Employee.objects.filter(
            start_date__month=date.today().month,
            start_date__year=date.today().year
        ).count()
        expiring_contracts = Contract.objects.filter(
            end_date__isnull=False,
            end_date__lte=date.today() + timedelta(days=30),
            end_date__gte=date.today()
        ).count()

        # Nhân viên theo phòng ban
        dept_stats = []
        for dept in Department.objects.all():
            count = Employee.objects.filter(department=dept, status='active').count()
            dept_stats.append({'name': dept.name, 'count': count})

        # Tỉ lệ loại nhân sự
        probation = Employee.objects.filter(status='active', employee_type='probation').count()
        official = Employee.objects.filter(status='active', employee_type='official').count()

        return Response({
            'total_employees': total_employees,
            'total_departments': total_departments,
            'new_this_month': new_this_month,
            'expiring_contracts': expiring_contracts,
            'dept_stats': dept_stats,
            'employee_type_stats': {
                'probation': probation,
                'official': official,
            }
        })