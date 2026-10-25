from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal

class Insumo(models.Model):
    TIPO_CHOICES = [
        ('materia_prima', 'Materia prima'),
        ('complementaria', 'Complementaria'),
    ]

    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='insumos', null=True, blank=True)
    nombre = models.CharField(max_length=255, verbose_name="Nombre del ingrediente")
    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES, default='materia_prima', verbose_name="Tipo de ingrediente")
    presentacion = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True, verbose_name="Presentación (Cantidad de compra)")
    unidad = models.CharField(max_length=20, default='Kg', verbose_name="Unidad de medida (Kg, Lt, Pza)")
    precio = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Precio del envase o presentación")
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']
        verbose_name = 'Insumo'
        verbose_name_plural = 'Insumos'

    @property
    def costo_unitario(self) -> Decimal:
        """Calcula el costo por unidad base (por Kg o por Lt) dividiendo precio entre presentación"""
        if self.precio is not None and self.presentacion and self.presentacion > Decimal('0'):
            return round(self.precio / self.presentacion, 4)
        return Decimal('0.0000')

    def __str__(self):
        return f"{self.nombre} ({self.get_tipo_display()}) - {self.presentacion} {self.unidad}"
