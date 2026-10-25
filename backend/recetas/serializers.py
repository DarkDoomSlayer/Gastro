from rest_framework import serializers
from .models import Receta, RecetaIngrediente
from insumos.serializers import InsumoSerializer
from insumos.models import Insumo

class RecetaIngredienteSerializer(serializers.ModelSerializer):
    insumo_detalle = InsumoSerializer(source='insumo', read_only=True)
    insumo_id = serializers.PrimaryKeyRelatedField(
        queryset=Insumo.objects.all(), source='insumo', write_only=True, required=False
    )
    rendimiento = serializers.DecimalField(max_digits=6, decimal_places=2, read_only=True)
    p_unitario = serializers.DecimalField(max_digits=12, decimal_places=4, read_only=True)
    importe = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = RecetaIngrediente
        fields = [
            'id',
            'insumo',
            'insumo_id',
            'insumo_detalle',
            'cantidad_neta',
            'cantidad_bruta',
            'rendimiento',
            'p_unitario',
            'importe',
        ]
        read_only_fields = ['insumo']


class RecetaSerializer(serializers.ModelSerializer):
    ingredientes = RecetaIngredienteSerializer(many=True, read_only=True)
    costo_total = serializers.SerializerMethodField()

    class Meta:
        model = Receta
        fields = [
            'id',
            'nombre',
            'clasificacion',
            'tipo_receta',
            'fecha_elaboracion',
            'tamano_porcion',
            'porciones',
            'ingredientes',
            'costo_total',
            'creado_en',
            'actualizado_en',
        ]

    def get_costo_total(self, obj):
        total = sum(item.importe for item in obj.ingredientes.all())
        return str(round(total, 2))
