from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal
from insumos.models import Insumo

class Receta(models.Model):
    CLASIFICACION_CHOICES = [
        ('ENTRADA', 'ENTRADA'),
        ('PARA COMPARTIR', 'PARA COMPARTIR'),
    ]

    TIPO_RECETA_CHOICES = [
        ('Std.', 'Std.'),
        ('Comp.', 'Comp.'),
    ]

    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recetas', null=True, blank=True)
    nombre = models.CharField(max_length=255, default='NOMBRE', verbose_name="Nombre del platillo")
    clasificacion = models.CharField(max_length=100, choices=CLASIFICACION_CHOICES, default='ENTRADA', verbose_name="Clasificación")
    tipo_receta = models.CharField(max_length=20, choices=TIPO_RECETA_CHOICES, default='Std.', verbose_name="Tipo de receta")
    fecha_elaboracion = models.DateField(null=True, blank=True, verbose_name="Fecha de Elaboración")
    tamano_porcion = models.CharField(max_length=100, blank=True, default='', verbose_name="Tamaño de la porción")
    porciones = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0.00'), verbose_name="Rendimiento / Porciones")
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-actualizado_en']
        verbose_name = 'Receta'
        verbose_name_plural = 'Recetas'

    def __str__(self):
        return f"{self.nombre} ({self.get_tipo_receta_display()})"


class RecetaIngrediente(models.Model):
    receta = models.ForeignKey(Receta, on_delete=models.CASCADE, related_name='ingredientes')
    insumo = models.ForeignKey(Insumo, on_delete=models.PROTECT, related_name='usos_en_recetas')
    cantidad_neta = models.DecimalField(max_digits=10, decimal_places=3, verbose_name="Cantidad Neta")
    cantidad_bruta = models.DecimalField(max_digits=10, decimal_places=3, verbose_name="Cantidad Bruta")
    
    # Congelamos el costo base al momento de guardar para mantener histórico contable
    precio_unitario_aplicado = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)

    class Meta:
        verbose_name = 'Ingrediente de Receta'
        verbose_name_plural = 'Ingredientes de Receta'

    @property
    def rendimiento(self) -> Decimal:
        """Rendimiento = Neto / Bruto"""
        if self.cantidad_bruta and self.cantidad_bruta > Decimal('0'):
            return round((self.cantidad_neta / self.cantidad_bruta) * Decimal('100'), 2)
        return Decimal('0.00')

    @property
    def p_unitario(self) -> Decimal:
        """Precio unitario base por Kg/Lt del insumo"""
        if self.precio_unitario_aplicado:
            return self.precio_unitario_aplicado
        return self.insumo.costo_unitario

    @property
    def importe(self) -> Decimal:
        """Importe = Cantidad Bruta * P. Unitario"""
        return round(self.cantidad_bruta * self.p_unitario, 2)

    def save(self, *args, **kwargs):
        if not self.precio_unitario_aplicado:
            self.precio_unitario_aplicado = self.insumo.costo_unitario
        super().save(*args, **kwargs)
