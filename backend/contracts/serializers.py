from rest_framework import serializers
from .models import Contract
from datetime import date

class ContractSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_code = serializers.CharField(source='employee.code', read_only=True)
    is_expiring_soon = serializers.SerializerMethodField()

    class Meta:
        model = Contract
        fields = '__all__'

    def get_is_expiring_soon(self, obj):
        if obj.end_date:
            days_left = (obj.end_date - date.today()).days
            return 0 <= days_left <= 30
        return False