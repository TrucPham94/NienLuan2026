from django.db import models
from employees.models import Employee

class Contract(models.Model):
    TYPE_CHOICES = [
        ('probation', 'Thử việc'),
        ('fixed', 'Xác định thời hạn'),
        ('indefinite', 'Không xác định thời hạn'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='contracts')
    contract_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    signed_date = models.DateField()
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee.full_name} - {self.contract_type}"