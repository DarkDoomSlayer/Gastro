from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Receta, RecetaIngrediente
from .serializers import RecetaSerializer, RecetaIngredienteSerializer

from rest_framework.authentication import SessionAuthentication, BasicAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return

class RecetaViewSet(viewsets.ModelViewSet):
    authentication_classes = [CsrfExemptSessionAuthentication, BasicAuthentication]
    serializer_class = RecetaSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            # Devuelve únicamente las recetas propias del usuario autenticado
            return Receta.objects.filter(usuario=user).prefetch_related('ingredientes__insumo')
        return Receta.objects.none()

    def create(self, request, *args, **kwargs):
        nombre = request.data.get('nombre', '').strip()
        user = request.user if request.user.is_authenticated else None

        # Si el usuario ya tiene recetas y crea otra con el mismo nombre, generar nombre autoincremental o validar
        if nombre:
            filtro = {'nombre__iexact': nombre}
            if user:
                filtro['usuario'] = user
            else:
                filtro['usuario__isnull'] = True

            # Si es la plantilla inicial 'NUEVA RECETA', generamos 'NUEVA RECETA (2)', etc.
            if Receta.objects.filter(**filtro).exists():
                if nombre.upper().startswith('NUEVA RECETA'):
                    count = Receta.objects.filter(nombre__istartswith='NUEVA RECETA', **({'usuario': user} if user else {'usuario__isnull': True})).count()
                    nombre = f"NUEVA RECETA ({count + 1})"
                    request.data['nombre'] = nombre
                else:
                    return Response({'error': f'Ya existe una receta registrada con el nombre "{nombre}".'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if user:
            serializer.save(usuario=user)
        else:
            serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        nuevo_nombre = request.data.get('nombre', '').strip()

        if nuevo_nombre and nuevo_nombre.lower() != instance.nombre.lower():
            user = request.user if request.user.is_authenticated else None
            filtro = {'nombre__iexact': nuevo_nombre}
            if user:
                filtro['usuario'] = user
            else:
                filtro['usuario__isnull'] = True

            if Receta.objects.filter(**filtro).exclude(id=instance.id).exists():
                return Response({'error': f'Ya existe otra receta registrada con el nombre "{nuevo_nombre}".'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='agregar-ingrediente')
    def agregar_ingrediente(self, request, pk=None):
        receta = self.get_object()
        serializer = RecetaIngredienteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(receta=receta)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch', 'put'], url_path='editar-ingrediente/(?P<ingrediente_id>[^/.]+)')
    def editar_ingrediente(self, request, pk=None, ingrediente_id=None):
        receta = self.get_object()
        try:
            ingrediente = receta.ingredientes.get(id=ingrediente_id)
            serializer = RecetaIngredienteSerializer(ingrediente, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except RecetaIngrediente.DoesNotExist:
            return Response({'error': 'Ingrediente no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['delete'], url_path='eliminar-ingrediente/(?P<ingrediente_id>[^/.]+)')
    def eliminar_ingrediente(self, request, pk=None, ingrediente_id=None):
        receta = self.get_object()
        try:
            ingrediente = receta.ingredientes.get(id=ingrediente_id)
            ingrediente.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except RecetaIngrediente.DoesNotExist:
            return Response({'error': 'Ingrediente no encontrado'}, status=status.HTTP_404_NOT_FOUND)
