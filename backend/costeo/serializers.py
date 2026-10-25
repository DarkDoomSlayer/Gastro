from rest_framework import serializers
from .models import CosteoReceta

class CosteoRecetaSerializer(serializers.ModelSerializer):
    costo_elaboracion = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    porciones = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)
    costo_unitario = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    precio_sugerido_sin_iva = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    precio_sugerido_con_iva = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    precio_real_sin_iva = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    margen_real = serializers.DecimalField(max_digits=6, decimal_places=2, read_only=True)

    class Meta:
        model = CosteoReceta
        fields = [
            'id',
            'receta',
            'costo_elaboracion',
            'porciones',
            'costo_unitario',
            'margen_deseado',
            'precio_sugerido_sin_iva',
            'precio_sugerido_con_iva',
            'tasa_iva',
            'precio_real_con_iva',
            'precio_real_sin_iva',
            'margen_real',
            'actualizado_en',
        ]
