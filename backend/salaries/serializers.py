from rest_framework import serializers
from .models import SalaryMonth

class SalaryMonthSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_code = serializers.CharField(source='employee.code', read_only=True)

    class Meta:
        model = SalaryMonth
        fields = '__all__'

    def validate(self, data):
        p1 = data.get('p1_salary', 0)
        p2 = data.get('p2_salary', 0)
        p3 = data.get('p3_salary', 0)
        allowance = data.get('allowance', 0)
        data['total_salary'] = p1 + p2 + p3 + allowance
        return data