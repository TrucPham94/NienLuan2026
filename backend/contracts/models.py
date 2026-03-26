from django.db import models
from employees.models import Employee

class Contract(models.Model):
    TYPE_CHOICES = [
        ('collaborator', 'Cộng tác viên'),
        ('probation', 'Thử việc'),
        ('official', 'Chính thức'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='contracts')
    contract_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    signed_date = models.DateField()
    salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    representative = models.CharField(max_length=100, blank=True)
    contract_file = models.FileField(upload_to='contracts/', null=True, blank=True)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee.full_name} - {self.contract_type}"