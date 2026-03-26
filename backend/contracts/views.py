from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import date, timedelta
from .models import Contract
from .serializers import ContractSerializer

class ContractViewSet(viewsets.ModelViewSet):
    queryset = Contract.objects.all().order_by('-created_at')
    serializer_class = ContractSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        threshold = date.today() + timedelta(days=30)
        contracts = Contract.objects.filter(
            end_date__isnull=False,
            end_date__lte=threshold,
            end_date__gte=date.today()
        )
        serializer = self.get_serializer(contracts, many=True)
        return Response(serializer.data)