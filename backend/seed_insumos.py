import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from insumos.models import Insumo

SAMPLE_INSUMOS = [
    {"nombre": "Aceite de maíz", "tipo": "materia_prima", "presentacion": Decimal("0.850"), "unidad": "Lt", "precio": Decimal("61.00")},
    {"nombre": "Aceite de oliva", "tipo": "materia_prima", "presentacion": Decimal("0.500"), "unidad": "Kg", "precio": Decimal("117.50")},
    {"nombre": "Aceite vegetal", "tipo": "materia_prima", "presentacion": Decimal("0.850"), "unidad": "Kg", "precio": Decimal("40.00")},
    {"nombre": "Aceituna negra", "tipo": "materia_prima", "presentacion": Decimal("0.340"), "unidad": "Kg", "precio": Decimal("34.00")},
    {"nombre": "Agua", "tipo": "materia_prima", "presentacion": Decimal("20.000"), "unidad": "Lt", "precio": Decimal("40.00")},
    {"nombre": "Aguacate", "tipo": "materia_prima", "presentacion": Decimal("1.000"), "unidad": "Kg", "precio": Decimal("90.00")},
    {"nombre": "Ajo", "tipo": "materia_prima", "presentacion": Decimal("1.000"), "unidad": "Kg", "precio": Decimal("129.00")},
    {"nombre": "Ajonjolí", "tipo": "materia_prima", "presentacion": Decimal("0.075"), "unidad": "Kg", "precio": Decimal("22.00")},
    {"nombre": "Albahaca", "tipo": "materia_prima", "presentacion": Decimal("0.100"), "unidad": "Kg", "precio": Decimal("14.90")},
    {"nombre": "Alioli", "tipo": "complementaria", "presentacion": Decimal("1.000"), "unidad": "Kg", "precio": Decimal("98.46")},
    {"nombre": "Almendra", "tipo": "materia_prima", "presentacion": Decimal("1.000"), "unidad": "Kg", "precio": Decimal("300.00")},
    {"nombre": "Almidon de papa", "tipo": "materia_prima", "presentacion": Decimal("0.567"), "unidad": "Kg", "precio": Decimal("94.50")},
    {"nombre": "Anis estrellado", "tipo": "materia_prima", "presentacion": Decimal("0.025"), "unidad": "Kg", "precio": Decimal("8.60")},
    {"nombre": "Apio", "tipo": "materia_prima", "presentacion": Decimal("1.000"), "unidad": "Kg", "precio": Decimal("29.90")},
    {"nombre": "Arandano Deshidratado", "tipo": "materia_prima", "presentacion": Decimal("1.000"), "unidad": "Kg", "precio": Decimal("281.29")},
    {"nombre": "Arrachera", "tipo": "complementaria", "presentacion": Decimal("1.000"), "unidad": "Kg", "precio": Decimal("149.00")},
    {"nombre": "Arroz arborio", "tipo": "materia_prima", "presentacion": Decimal("0.500"), "unidad": "Kg", "precio": Decimal("67.00")},
    {"nombre": "Arroz de grano largo", "tipo": "materia_prima", "presentacion": Decimal("0.900"), "unidad": "Kg", "precio": Decimal("21.00")},
    {"nombre": "Arroz morado", "tipo": "complementaria", "presentacion": Decimal("0.575"), "unidad": "Kg", "precio": Decimal("24.84")},
    {"nombre": "Arúgula", "tipo": "materia_prima", "presentacion": Decimal("0.120"), "unidad": "Kg", "precio": Decimal("52.00")},
    {"nombre": "Azucar estandar", "tipo": "materia_prima", "presentacion": Decimal("2.000"), "unidad": "Kg", "precio": Decimal("42.00")},
    {"nombre": "Azúcar glass", "tipo": "materia_prima", "presentacion": Decimal("0.900"), "unidad": "Kg", "precio": Decimal("59.90")},
    {"nombre": "Baguette", "tipo": "materia_prima", "presentacion": Decimal("0.250"), "unidad": "Kg", "precio": Decimal("10.00")},
    {"nombre": "Bechamel", "tipo": "complementaria", "presentacion": Decimal("1.000"), "unidad": "Kg", "precio": Decimal("62.00")},
]

count = 0
for item in SAMPLE_INSUMOS:
    _, created = Insumo.objects.get_or_create(
        nombre=item["nombre"],
        defaults=item
    )
    if created:
        count += 1

print(f"Carga completada: {count} insumos registrados con éxito.")
