from django.db import models

class Employee(models.Model):
    GENDER_CHOICES = [('M', 'Nam'), ('F', 'Nữ')]
    STATUS_CHOICES = [('active', 'Đang làm'), ('inactive', 'Đã nghỉ')]
    TYPE_CHOICES = [('probation', 'Thử việc'), ('official', 'Chính thức')]

    code = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    id_card = models.CharField(max_length=20, unique=True)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=15, blank=True)
    email = models.EmailField(unique=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    department = models.ForeignKey(
        'departments.Department',
        null=True, blank=True,
        on_delete=models.SET_NULL
    )
    position = models.ForeignKey(
        'departments.Position',
        null=True, blank=True,
        on_delete=models.SET_NULL
    )
    start_date = models.DateField()
    employee_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='probation')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.code} - {self.full_name}"