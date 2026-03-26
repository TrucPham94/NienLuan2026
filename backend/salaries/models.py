from django.db import models
from employees.models import Employee

class SalaryMonth(models.Model):
    STATUS_CHOICES = [('draft', 'Nháp'), ('confirmed', 'Đã chốt')]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='salaries')
    month = models.IntegerField()
    year = models.IntegerField()
    p1_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)  # Lương vị trí
    p2_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)  # Lương năng lực
    p3_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)    # Điểm KPI
    p3_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)  # Tiền KPI
    allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0)  # Phụ cấp
    total_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    note = models.TextField(blank=True)
    updated_by = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('employee', 'month', 'year')

    def __str__(self):
        return f"{self.employee.full_name} - {self.month}/{self.year}"