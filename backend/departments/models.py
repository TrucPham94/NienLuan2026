from django.db import models

class Department(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    manager = models.ForeignKey(
        'employees.Employee',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='managed_department'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Position(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    salary_coefficient = models.DecimalField(max_digits=4, decimal_places=2, default=1.0)

    def __str__(self):
        return self.name