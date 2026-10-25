from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import CosteoReceta
from .serializers import CosteoRecetaSerializer
from recetas.models import Receta

from rest_framework.authentication import SessionAuthentication, BasicAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return

class CosteoRecetaViewSet(viewsets.ModelViewSet):
    authentication_classes = [CsrfExemptSessionAuthentication, BasicAuthentication]
    queryset = CosteoReceta.objects.all()
    serializer_class = CosteoRecetaSerializer

    @action(detail=False, methods=['get', 'post', 'put'], url_path='por-receta/(?P<receta_id>[^/.]+)')
    def por_receta(self, request, receta_id=None):
        try:
            receta = Receta.objects.get(id=receta_id)
        except Receta.DoesNotExist:
            return Response({'error': 'Receta no encontrada'}, status=status.HTTP_404_NOT_FOUND)

        costeo, _ = CosteoReceta.objects.get_or_create(receta=receta)

        if request.method in ['POST', 'PUT']:
            serializer = CosteoRecetaSerializer(costeo, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer = CosteoRecetaSerializer(costeo)
        return Response(serializer.data)
