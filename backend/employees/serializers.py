from rest_framework import serializers
from .models import Employee

class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    position_name = serializers.CharField(source='position.name', read_only=True)
    code = serializers.CharField(read_only=True)

    class Meta:
        model = Employee
        fields = '__all__'

class EmployeeListSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    position_name = serializers.CharField(source='position.name', read_only=True)
    code = serializers.CharField(read_only=True)

    class Meta:
        model = Employee
        fields = ['id', 'code', 'full_name', 'email', 'phone',
                  'department_name', 'position_name', 'employee_type', 'status', 'avatar']