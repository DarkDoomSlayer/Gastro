from rest_framework import serializers
from .models import Insumo

class InsumoSerializer(serializers.ModelSerializer):
    costo_unitario = serializers.DecimalField(max_digits=12, decimal_places=4, read_only=True)

    class Meta:
        model = Insumo
        fields = [
            'id',
            'nombre',
            'tipo',
            'presentacion',
            'unidad',
            'precio',
            'costo_unitario',
            'activo',
            'creado_en',
            'actualizado_en',
        ]
