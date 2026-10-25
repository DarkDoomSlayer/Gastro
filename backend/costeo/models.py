from django.db import models
from decimal import Decimal
from recetas.models import Receta

class CosteoReceta(models.Model):
    receta = models.OneToOneField(Receta, on_delete=models.CASCADE, related_name='costeo')
    margen_deseado = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, default=None, verbose_name="% Margen deseado")
    precio_real_con_iva = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, default=None, verbose_name="Precio de venta real con IVA")
    tasa_iva = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('16.00'), verbose_name="Tasa de IVA (%)")

    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Costeo de Receta'
        verbose_name_plural = 'Costeos de Recetas'

    @property
    def costo_elaboracion(self) -> Decimal:
        """Suma del importe de todos los ingredientes"""
        total = sum((item.importe for item in self.receta.ingredientes.all()), Decimal('0.00'))
        return round(total, 2)

    @property
    def porciones(self) -> Decimal:
        return self.receta.porciones if self.receta.porciones is not None else Decimal('0.00')

    @property
    def costo_unitario(self) -> Decimal:
        """Costo unitario = Costo de elaboración / Porciones (Rendimiento)"""
        if self.porciones and self.porciones > Decimal('0'):
            return round(self.costo_elaboracion / self.porciones, 2)
        return Decimal('0.00')

    @property
    def precio_sugerido_sin_iva(self) -> Decimal:
        """Fórmula Excel: Costo Unitario / (1 - Margen Deseado)"""
        if self.margen_deseado is None:
            return Decimal('0.00')
        margen_ratio = self.margen_deseado / Decimal('100')
        if margen_ratio >= Decimal('1.0'):
            return Decimal('0.00')
        denominador = Decimal('1.0') - margen_ratio
        if denominador <= Decimal('0'):
            return Decimal('0.00')
        return round(self.costo_unitario / denominador, 2)

    @property
    def precio_sugerido_con_iva(self) -> Decimal:
        """Fórmula Excel: Precio sugerido * (1 + IVA)"""
        iva_factor = Decimal('1.0') + (self.tasa_iva / Decimal('100'))
        return round(self.precio_sugerido_sin_iva * iva_factor, 2)

    @property
    def precio_real_sin_iva(self) -> Decimal:
        """Fórmula Excel: Precio Real con IVA / (1 + IVA)"""
        iva_factor = Decimal('1.0') + (self.tasa_iva / Decimal('100'))
        if self.precio_real_con_iva is not None and self.precio_real_con_iva > Decimal('0') and iva_factor > Decimal('0'):
            return round(self.precio_real_con_iva / iva_factor, 2)
        return Decimal('0.00')

    @property
    def margen_real(self) -> Decimal:
        """Fórmula Excel: (Precio sin IVA - Costo unitario) / Precio sin IVA"""
        if self.precio_real_sin_iva and self.precio_real_sin_iva > Decimal('0'):
            ganancia = (self.precio_real_sin_iva - self.costo_unitario) / self.precio_real_sin_iva
            return round(ganancia * Decimal('100'), 2)
        return Decimal('0.00')

    def __str__(self):
        return f"Costeo de {self.receta.nombre} - Costo unitario: ${self.costo_unitario}"
