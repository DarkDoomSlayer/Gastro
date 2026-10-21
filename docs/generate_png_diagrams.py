import os
from PIL import Image, ImageDraw, ImageFont

DOCS_DIR = "/home/dark/Documentos/UAZ/Gastro/docs"
IMG_DIR = os.path.join(DOCS_DIR, "images")
os.makedirs(IMG_DIR, exist_ok=True)

# Tipografías del sistema
try:
    font_main_title = ImageFont.truetype("/usr/share/fonts/liberation-sans-fonts/LiberationSans-Bold.ttf", 30)
    font_sub_title = ImageFont.truetype("/usr/share/fonts/liberation-sans-fonts/LiberationSans-Regular.ttf", 16)
    font_box_header = ImageFont.truetype("/usr/share/fonts/liberation-sans-fonts/LiberationSans-Bold.ttf", 18)
    font_box_title = ImageFont.truetype("/usr/share/fonts/liberation-sans-fonts/LiberationSans-Bold.ttf", 15)
    font_box_desc = ImageFont.truetype("/usr/share/fonts/liberation-sans-fonts/LiberationSans-Regular.ttf", 13)
    font_arrow = ImageFont.truetype("/usr/share/fonts/liberation-sans-fonts/LiberationSans-Bold.ttf", 13)
    
    font_tbl_hdr = ImageFont.truetype("/usr/share/fonts/liberation-sans-fonts/LiberationSans-Bold.ttf", 16)
    font_tbl_sub = ImageFont.truetype("/usr/share/fonts/liberation-sans-fonts/LiberationSans-Italic.ttf", 12)
    font_col_name = ImageFont.truetype("/usr/share/fonts/liberation-sans-fonts/LiberationSans-Bold.ttf", 13)
    font_col_type = ImageFont.truetype("/usr/share/fonts/adobe-source-code-pro-fonts/SourceCodePro-Medium.otf", 12)
    font_col_badge = ImageFont.truetype("/usr/share/fonts/liberation-sans-fonts/LiberationSans-Bold.ttf", 11)
    font_card_lbl = ImageFont.truetype("/usr/share/fonts/liberation-sans-fonts/LiberationSans-Bold.ttf", 12)
    font_card_desc = ImageFont.truetype("/usr/share/fonts/liberation-sans-fonts/LiberationSans-Regular.ttf", 11)
    font_legend_h = ImageFont.truetype("/usr/share/fonts/liberation-sans-fonts/LiberationSans-Bold.ttf", 15)
    font_legend_p = ImageFont.truetype("/usr/share/fonts/liberation-sans-fonts/LiberationSans-Regular.ttf", 12)
except Exception:
    font_main_title = font_sub_title = font_box_header = font_box_title = font_box_desc = font_arrow = ImageFont.load_default()
    font_tbl_hdr = font_tbl_sub = font_col_name = font_col_type = font_col_badge = font_card_lbl = font_card_desc = font_legend_h = font_legend_p = ImageFont.load_default()

# Paleta de Colores GastroProyect (Tonos Naranja Gastronómico, Slate y Teal)
WHITE = (255, 255, 255)
HEADER_BG = (15, 23, 42)          # Slate 900
NAVY = (30, 58, 138)             # Slate/Blue
ORANGE_HEADER = (194, 65, 12)     # Orange 700
ORANGE_BORDER = (234, 88, 12)     # Orange 600
ORANGE_BG = (255, 247, 237)       # Orange 50
TEAL = (13, 148, 136)            # Teal 600
TEAL_BG = (240, 253, 250)        # Teal 50
PURPLE_HEADER = (109, 40, 217)   # Purple 700
PURPLE_BG = (245, 243, 255)      # Purple 50
CARD_BG = (255, 255, 255)
SLATE_DARK = (30, 41, 59)
SLATE_MUTED = (100, 116, 139)
BORDER_COLOR = (203, 213, 225)
ROW_LINE = (226, 232, 240)
ROW_BG_ALT = (248, 250, 252)
ROW_BG = (255, 255, 255)

# Badges
PK_BG = (254, 243, 199)          # Amber 100
PK_FG = (180, 83, 9)            # Amber 700
FK_BG = (224, 231, 255)          # Indigo 100
FK_FG = (67, 56, 202)           # Indigo 700
UQ_BG = (236, 253, 245)          # Emerald 100
UQ_FG = (4, 120, 87)            # Emerald 700


# ==============================================================================
# 1. DIAGRAMA DE ARQUITECTURA DE SOFTWARE (PNG)
# ==============================================================================
W1, H1 = 1500, 820
img1 = Image.new("RGB", (W1, H1), (248, 250, 252))
draw1 = ImageDraw.Draw(img1)

# Encabezado superior
draw1.rectangle([0, 0, W1, 95], fill=HEADER_BG)
draw1.text((50, 22), "DIAGRAMA DE ARQUITECTURA DE SOFTWARE — GASTROPROYECT", fill=WHITE, font=font_main_title)
draw1.text((50, 60), "Arquitectura Cliente-Servidor Desacoplada (Three-Tier) | Estándar ISO/IEC 29110 | Morelosoft International Solutions", fill=(148, 163, 184), font=font_sub_title)

# Badge de Estado en Encabezado
draw1.rounded_rectangle([W1 - 420, 20, W1 - 50, 75], radius=8, fill=(30, 41, 59), outline=(71, 85, 105), width=1)
draw1.text((W1 - 400, 30), "ESTADO: Arquitectura Base Desplegada", fill=(52, 211, 153), font=font_card_lbl)
draw1.text((W1 - 400, 50), "Sprint 0 • Base de Datos Local Verificada", fill=(148, 163, 184), font=font_card_desc)

# Contenedor 1: Frontend SPA
f_l, f_t, f_r, f_b = 50, 125, 480, 680
draw1.rounded_rectangle([f_l + 3, f_t + 3, f_r + 3, f_b + 3], radius=12, fill=(226, 232, 240))
draw1.rounded_rectangle([f_l, f_t, f_r, f_b], radius=12, fill=ORANGE_BG, outline=ORANGE_BORDER, width=2)
draw1.text((f_l + 25, f_t + 22), "«Capa Presentación» Frontend SPA", fill=ORANGE_HEADER, font=font_box_header)
draw1.text((f_l + 25, f_t + 48), "React 18 + Vite + Tailwind CSS (Puerto 3000)", fill=SLATE_MUTED, font=font_box_desc)

f_cards = [
    ("Interfaz de Usuario & Layout Base", "Diseño responsive adaptado a estudiantes\nNavegación ágil y centro de control", 90),
    ("Componentes & Vistas de Costeo", "Tableros de formulación, desglose\nde insumos y semáforo de margen %", 240),
    ("Cliente HTTP Centralizado (api.js)", "Consumo estructurado de endpoints REST\ny manejo de excepciones de red", 390)
]
for title, desc, y_off in f_cards:
    cy = f_t + y_off
    draw1.rounded_rectangle([f_l + 20, cy, f_r - 20, cy + 120], radius=8, fill=CARD_BG, outline=BORDER_COLOR, width=1)
    draw1.rectangle([f_l + 35, cy + 15, f_l + 47, cy + 28], fill=ORANGE_BORDER)
    draw1.text((f_l + 55, cy + 14), title, fill=ORANGE_HEADER, font=font_box_title)
    draw1.multiline_text((f_l + 35, cy + 46), desc, fill=SLATE_DARK, font=font_box_desc, spacing=4)

# Contenedor 2: Backend REST API
b_l, b_t, b_r, b_b = 540, 125, 970, 680
draw1.rounded_rectangle([b_l + 3, b_t + 3, b_r + 3, b_b + 3], radius=12, fill=(226, 232, 240))
draw1.rounded_rectangle([b_l, b_t, b_r, b_b], radius=12, fill=TEAL_BG, outline=TEAL, width=2)
draw1.text((b_l + 25, b_t + 22), "«Capa de Negocio» Backend REST API", fill=TEAL, font=font_box_header)
draw1.text((b_l + 25, b_t + 48), "Node.js v20 + Express (Puerto 4000)", fill=SLATE_MUTED, font=font_box_desc)

b_cards = [
    ("Enrutadores REST & Healthcheck", "Endpoints /api/health, /api/health/db\ny enrutamiento modular por CUs", 90),
    ("Controladores & Validación de Datos", "Filtrado de peticiones, validación de tipos\ny contratos de entrada según reglas", 240),
    ("Servicios de Costeo & Pool BD (pg)", "Algoritmos de merma, precios sugeridos\ny pool de conexiones optimizado a PostgreSQL", 390)
]
for title, desc, y_off in b_cards:
    cy = b_t + y_off
    draw1.rounded_rectangle([b_l + 20, cy, b_r - 20, cy + 120], radius=8, fill=CARD_BG, outline=BORDER_COLOR, width=1)
    draw1.rectangle([b_l + 35, cy + 15, b_l + 47, cy + 28], fill=TEAL)
    draw1.text((b_l + 55, cy + 14), title, fill=TEAL, font=font_box_title)
    draw1.multiline_text((b_l + 35, cy + 46), desc, fill=SLATE_DARK, font=font_box_desc, spacing=4)

# Contenedor 3: Base de Datos Relacional
d_l, d_t, d_r, d_b = 1030, 125, 1450, 680
draw1.rounded_rectangle([d_l + 3, d_t + 3, d_r + 3, d_b + 3], radius=12, fill=(226, 232, 240))
draw1.rounded_rectangle([d_l, d_t, d_r, d_b], radius=12, fill=PURPLE_BG, outline=PURPLE_HEADER, width=2)
draw1.text((d_l + 25, d_t + 22), "«Capa Persistencia» Base de Datos", fill=PURPLE_HEADER, font=font_box_header)
draw1.text((d_l + 25, d_t + 48), "PostgreSQL 16 Alpine (Puerto 5432)", fill=SLATE_MUTED, font=font_box_desc)

d_cards = [
    ("Esquema Relacional Normalizado (3NF)", "8 tablas estructuradas (users, ingredients,\nrecipes, recipe_ingredients, etc.)", 90),
    ("Catálogo de Unidades & Categorías", "15 unidades gastronómicas canónicas\ny 9 categorías oficiales precargadas", 240),
    ("Persistencia & Auditoría en Cascada", "Volumen persistente Docker 'gastro_pgdata'\ny bitácora de actualización en cascada", 390)
]
for title, desc, y_off in d_cards:
    cy = d_t + y_off
    draw1.rounded_rectangle([d_l + 20, cy, d_r - 20, cy + 120], radius=8, fill=CARD_BG, outline=BORDER_COLOR, width=1)
    draw1.rectangle([d_l + 35, cy + 15, d_l + 47, cy + 28], fill=PURPLE_HEADER)
    draw1.text((d_l + 55, cy + 14), title, fill=PURPLE_HEADER, font=font_box_title)
    draw1.multiline_text((d_l + 35, cy + 46), desc, fill=SLATE_DARK, font=font_box_desc, spacing=4)

# Flechas Conectoras de Comunicación
arr1_y = f_t + 450
draw1.line([(f_r - 20, arr1_y), (b_l + 20, arr1_y)], fill=ORANGE_BORDER, width=3)
draw1.polygon([(b_l + 20, arr1_y), (b_l + 8, arr1_y - 6), (b_l + 8, arr1_y + 6)], fill=ORANGE_BORDER)
draw1.text(((f_r + b_l)//2, arr1_y - 18), "HTTP / JSON", fill=ORANGE_HEADER, font=font_arrow, anchor="mm")
draw1.text(((f_r + b_l)//2, arr1_y + 16), "Puerto 4000", fill=SLATE_MUTED, font=font_arrow, anchor="mm")

arr2_y = b_t + 450
draw1.line([(b_r - 20, arr2_y), (d_l + 20, arr2_y)], fill=TEAL, width=3)
draw1.polygon([(d_l + 20, arr2_y), (d_l + 8, arr2_y - 6), (d_l + 8, arr2_y + 6)], fill=TEAL)
draw1.text(((b_r + d_l)//2, arr2_y - 18), "TCP / Pool SQL", fill=TEAL, font=font_arrow, anchor="mm")
draw1.text(((b_r + d_l)//2, arr2_y + 16), "Puerto 5432", fill=SLATE_MUTED, font=font_arrow, anchor="mm")

# Barra inferior de orquestación Docker
draw1.rounded_rectangle([50, 705, W1 - 50, 795], radius=10, fill=WHITE, outline=BORDER_COLOR, width=2)
draw1.text((75, 725), "TOPOLOGÍA DOCKER COMPOSE:", fill=HEADER_BG, font=font_box_title)
draw1.text((330, 727), "Red Bridge Aislada: gastro_network | Volumen Nombrado: gastro_pgdata | Ejecución: docker compose up -d", fill=SLATE_DARK, font=font_legend_p)
draw1.text((75, 755), "TRAZABILIDAD ISO/IEC 29110:", fill=HEADER_BG, font=font_box_title)
draw1.text((330, 757), "100% de concordancia con Gastro-Agreement y Gastro-ProyectPlan (CU-01 a CU-09)", fill=(4, 120, 87), font=font_legend_p)

# Guardar Imagen de Arquitectura
arch_png_path = os.path.join(IMG_DIR, "arquitectura.png")
arch_png_root = os.path.join(DOCS_DIR, "arquitectura.png")
img1.save(arch_png_path, "PNG")
img1.save(arch_png_root, "PNG")
print("Guardado:", arch_png_path)


# ==============================================================================
# 2. DIAGRAMA ENTIDAD-RELACIÓN DE BASE DE DATOS (PNG)
# ==============================================================================
W2, H2 = 3400, 1600
img2 = Image.new("RGB", (W2, H2), (248, 250, 252))
draw2 = ImageDraw.Draw(img2)

# Encabezado Canvas
draw2.rectangle([0, 0, W2, 95], fill=HEADER_BG)
draw2.text((60, 24), "DIAGRAMA ENTIDAD-RELACIÓN (ERD) — BASE DE DATOS GASTROPROYECT", fill=WHITE, font=font_main_title)
draw2.text((60, 62), "Modelo Relacional PostgreSQL 16 (3NF) | Norma ISO/IEC 29110-5-1-1 | Morelosoft International Solutions", fill=(148, 163, 184), font=font_sub_title)

draw2.rounded_rectangle([W2 - 480, 20, W2 - 60, 75], radius=8, fill=(30, 41, 59), outline=(71, 85, 105), width=1)
draw2.text((W2 - 460, 30), "MOTOR: PostgreSQL 16 Alpine", fill=(56, 189, 248), font=font_card_lbl)
draw2.text((W2 - 460, 50), "CONTENEDOR: gastro_db | PUERTO: 5432", fill=(148, 163, 184), font=font_card_desc)

TABLE_MODULES = {
    "USERS":        {"header_bg": (30, 58, 138),  "border": (59, 130, 246),  "tag": "CU-01: USUARIOS"},
    "UNITS":        {"header_bg": (15, 118, 110), "border": (20, 184, 166), "tag": "R-02: UNIDADES"},
    "CATEGORIES":   {"header_bg": (13, 148, 136), "border": (45, 212, 191), "tag": "CATÁLOGO"},
    "INGREDIENTS":  {"header_bg": (194, 65, 12),  "border": (234, 88, 12),  "tag": "CU-02 / CU-03: INSUMOS"},
    "RECIPES":      {"header_bg": (109, 40, 217), "border": (139, 92, 246), "tag": "CU-04 / CU-07: RECETAS"},
    "RECIPE_ITEMS": {"header_bg": (88, 28, 135),  "border": (124, 58, 237), "tag": "CU-06: FORMULACIÓN"},
    "PRICE_HIST":   {"header_bg": (185, 28, 28),  "border": (239, 68, 68),  "tag": "CU-08: PRECIOS"},
    "COST_AUDIT":   {"header_bg": (51, 65, 85),   "border": (100, 116, 139), "tag": "CU-08 / CU-09: AUDITORÍA"}
}

TABLES = {
    "users": {
        "module": "USERS",
        "title": "users",
        "subtitle": "Cuentas de estudiantes y roles (CU-01)",
        "x": 60, "y": 140, "w": 520,
        "columns": [
            ("id", "UUID", "PK", "DEFAULT gen_random_uuid()"),
            ("email", "VARCHAR(255)", "UQ", "NOT NULL"),
            ("password_hash", "VARCHAR(255)", "", "NOT NULL (Criptográfico)"),
            ("full_name", "VARCHAR(150)", "", "NOT NULL"),
            ("student_id", "VARCHAR(50)", "", "Matrícula institucional"),
            ("role", "VARCHAR(30)", "", "CHECK: ESTUDIANTE|DOCENTE"),
            ("is_active", "BOOLEAN", "", "DEFAULT true"),
            ("created_at", "TIMESTAMP", "", "DEFAULT now()"),
            ("updated_at", "TIMESTAMP", "", "DEFAULT now()")
        ]
    },
    "measurement_units": {
        "module": "UNITS",
        "title": "measurement_units",
        "subtitle": "Estandarización y equivalencias (R-02)",
        "x": 60, "y": 550, "w": 520,
        "columns": [
            ("id", "UUID", "PK", "DEFAULT gen_random_uuid()"),
            ("name", "VARCHAR(50)", "UQ", "Kilogramo, Litro, Gramo..."),
            ("symbol", "VARCHAR(10)", "UQ", "kg, g, l, ml, pz..."),
            ("unit_type", "VARCHAR(20)", "", "MASS | VOLUME | UNIT"),
            ("base_unit_symbol", "VARCHAR(10)", "", "Símbolo canónico (g, ml)"),
            ("conversion_factor", "DECIMAL(14,6)", "", "Multiplicador a base"),
            ("is_active", "BOOLEAN", "", "DEFAULT true"),
            ("created_at", "TIMESTAMP", "", "DEFAULT now()")
        ]
    },
    "ingredient_categories": {
        "module": "CATEGORIES",
        "title": "ingredient_categories",
        "subtitle": "Clasificación culinaria de insumos",
        "x": 60, "y": 910, "w": 520,
        "columns": [
            ("id", "UUID", "PK", "DEFAULT gen_random_uuid()"),
            ("name", "VARCHAR(100)", "UQ", "Lácteos, Carnes, Abarrotes..."),
            ("description", "TEXT", "", "Descripción de categoría"),
            ("is_active", "BOOLEAN", "", "DEFAULT true"),
            ("created_at", "TIMESTAMP", "", "DEFAULT now()")
        ]
    },
    "ingredients": {
        "module": "INGREDIENTS",
        "title": "ingredients",
        "subtitle": "Catálogo de insumos y mermas (CU-02, CU-03)",
        "x": 660, "y": 140, "w": 550,
        "columns": [
            ("id", "UUID", "PK", "DEFAULT gen_random_uuid()"),
            ("user_id", "UUID", "FK", "REFERENCES users(id)"),
            ("category_id", "UUID", "FK", "NULLABLE REFERENCES categories"),
            ("name", "VARCHAR(150)", "", "NOT NULL (UQ por usuario)"),
            ("brand", "VARCHAR(100)", "", "Marca comercial"),
            ("purchase_unit_id", "UUID", "FK", "REFERENCES units(id)"),
            ("purchase_quantity", "DECIMAL(12,4)", "", "Cantidad neta compra"),
            ("purchase_price", "DECIMAL(12,4)", "", "Costo adquisición total"),
            ("usage_unit_id", "UUID", "FK", "REFERENCES units(id)"),
            ("unit_cost_base", "DECIMAL(14,6)", "", "Costo por unidad base"),
            ("default_waste_pct", "DECIMAL(5,2)", "", "% Merma estándar"),
            ("is_active", "BOOLEAN", "", "DEFAULT true (Baja lógica)"),
            ("created_at", "TIMESTAMP", "", "DEFAULT now()"),
            ("updated_at", "TIMESTAMP", "", "DEFAULT now()")
        ]
    },
    "recipes": {
        "module": "RECIPES",
        "title": "recipes",
        "subtitle": "Formulación, costos y precio venta (CU-04, CU-07)",
        "x": 1300, "y": 140, "w": 560,
        "columns": [
            ("id", "UUID", "PK", "DEFAULT gen_random_uuid()"),
            ("user_id", "UUID", "FK", "REFERENCES users(id)"),
            ("name", "VARCHAR(150)", "", "NOT NULL (UQ por usuario)"),
            ("description", "TEXT", "", "Procedimiento o técnica"),
            ("yield_portions", "DECIMAL(8,2)", "", "Rendimiento en porciones"),
            ("prep_time_minutes", "INT", "", "Tiempo estimado elaboración"),
            ("total_cost", "DECIMAL(12,4)", "", "Costo total producción (CU-06)"),
            ("cost_per_portion", "DECIMAL(12,4)", "", "Costo unitario por porción"),
            ("profit_margin_pct", "DECIMAL(5,2)", "", "% Margen deseado (CU-07)"),
            ("suggested_sale_price", "DECIMAL(12,4)", "", "Precio venta sugerido"),
            ("target_sale_price", "DECIMAL(12,4)", "", "Precio fijado por alumno"),
            ("net_profit_per_portion", "DECIMAL(12,4)", "", "Utilidad neta por porción"),
            ("status", "VARCHAR(20)", "", "DRAFT | ACTIVE | ARCHIVED"),
            ("created_at", "TIMESTAMP", "", "DEFAULT now()"),
            ("updated_at", "TIMESTAMP", "", "DEFAULT now()")
        ]
    },
    "recipe_ingredients": {
        "module": "RECIPE_ITEMS",
        "title": "recipe_ingredients",
        "subtitle": "Desglose y costo unitario proporcional (CU-06, CU-09)",
        "x": 1940, "y": 140, "w": 560,
        "columns": [
            ("id", "UUID", "PK", "DEFAULT gen_random_uuid()"),
            ("recipe_id", "UUID", "FK", "REFERENCES recipes(id) CASCADE"),
            ("ingredient_id", "UUID", "FK", "REFERENCES ingredients(id)"),
            ("quantity", "DECIMAL(12,4)", "", "Cantidad bruta requerida"),
            ("measurement_unit_id", "UUID", "FK", "REFERENCES units(id)"),
            ("waste_pct_override", "DECIMAL(5,2)", "", "% Merma específica"),
            ("effective_waste_pct", "DECIMAL(5,2)", "", "% Merma efectiva aplicada"),
            ("unit_cost_snapshot", "DECIMAL(14,6)", "", "Costo unitario capturado"),
            ("subtotal_cost", "DECIMAL(12,4)", "", "Subtotal calculado (CU-06)"),
            ("notes", "TEXT", "", "Técnica de corte o notas"),
            ("created_at", "TIMESTAMP", "", "DEFAULT now()"),
            ("updated_at", "TIMESTAMP", "", "DEFAULT now()")
        ]
    },
    "ingredient_price_history": {
        "module": "PRICE_HIST",
        "title": "ingredient_price_history",
        "subtitle": "Historial de variaciones de insumos (CU-08)",
        "x": 2580, "y": 140, "w": 520,
        "columns": [
            ("id", "UUID", "PK", "DEFAULT gen_random_uuid()"),
            ("ingredient_id", "UUID", "FK", "REFERENCES ingredients(id)"),
            ("old_purchase_price", "DECIMAL(12,4)", "", "Precio comercial anterior"),
            ("new_purchase_price", "DECIMAL(12,4)", "", "Nuevo precio comercial"),
            ("old_unit_cost_base", "DECIMAL(14,6)", "", "Costo base anterior"),
            ("new_unit_cost_base", "DECIMAL(14,6)", "", "Nuevo costo base"),
            ("change_reason", "VARCHAR(255)", "", "Motivo o proveedor"),
            ("recorded_at", "TIMESTAMP", "", "DEFAULT now()")
        ]
    },
    "recipe_cost_audit_log": {
        "module": "COST_AUDIT",
        "title": "recipe_cost_audit_log",
        "subtitle": "Auditoría de recálculo en cascada (CU-08, CU-09)",
        "x": 2580, "y": 550, "w": 520,
        "columns": [
            ("id", "UUID", "PK", "DEFAULT gen_random_uuid()"),
            ("recipe_id", "UUID", "FK", "REFERENCES recipes(id) CASCADE"),
            ("trigger_ingredient_id", "UUID", "FK", "NULLABLE REFERENCES ingredients"),
            ("previous_total_cost", "DECIMAL(12,4)", "", "Costo total anterior"),
            ("new_total_cost", "DECIMAL(12,4)", "", "Nuevo costo recalculado"),
            ("previous_suggested_price", "DECIMAL(12,4)", "", "Precio sugerido previo"),
            ("new_suggested_price", "DECIMAL(12,4)", "", "Nuevo precio sugerido"),
            ("event_type", "VARCHAR(50)", "", "CASCADE_UPDATE | MANUAL"),
            ("created_at", "TIMESTAMP", "", "DEFAULT now()")
        ]
    }
}

ROW_HEIGHT = 28
HEADER_HEIGHT = 50

for t_key, t_data in TABLES.items():
    t_data["h"] = HEADER_HEIGHT + (len(t_data["columns"]) * ROW_HEIGHT) + 6

def draw_ortho(draw, points, stroke=(100, 116, 139), width=2):
    for i in range(len(points) - 1):
        draw.line([points[i], points[i+1]], fill=stroke, width=width)
    ox, oy = points[0]
    draw.ellipse([ox-4, oy-4, ox+4, oy+4], fill=stroke)
    dx, dy = points[-1]
    px, py = points[-2]
    if dx > px:
        draw.polygon([(dx, dy), (dx-7, dy-5), (dx-7, dy+5)], fill=stroke)
    elif dx < px:
        draw.polygon([(dx, dy), (dx+7, dy-5), (dx+7, dy+5)], fill=stroke)
    elif dy > py:
        draw.polygon([(dx, dy), (dx-5, dy-7), (dx+5, dy-7)], fill=stroke)
    elif dy < py:
        draw.polygon([(dx, dy), (dx-5, dy+7), (dx+5, dy+7)], fill=stroke)

# Relaciones:
# 1. users -> ingredients
u_r = (TABLES["users"]["x"] + TABLES["users"]["w"], TABLES["users"]["y"] + 60)
ing_l = (TABLES["ingredients"]["x"], TABLES["ingredients"]["y"] + 60)
draw_ortho(draw2, [u_r, ing_l], stroke=(37, 99, 235), width=2)
draw2.text((u_r[0] + 8, u_r[1] - 16), "1", fill=(37, 99, 235), font=font_card_lbl)
draw2.text((ing_l[0] - 25, ing_l[1] - 16), "0..*", fill=(37, 99, 235), font=font_card_lbl)

# 2. users -> recipes (vía superior)
u_t = (TABLES["users"]["x"] + 250, TABLES["users"]["y"])
rec_t = (TABLES["recipes"]["x"] + 250, TABLES["recipes"]["y"])
pass_top = 110
draw_ortho(draw2, [u_t, (u_t[0], pass_top), (rec_t[0], pass_top), rec_t], stroke=(37, 99, 235), width=2)
draw2.text((u_t[0] + 6, u_t[1] - 20), "1", fill=(37, 99, 235), font=font_card_lbl)
draw2.text((rec_t[0] + 6, rec_t[1] - 20), "0..*", fill=(37, 99, 235), font=font_card_lbl)

# 3. ingredient_categories -> ingredients
cat_r = (TABLES["ingredient_categories"]["x"] + TABLES["ingredient_categories"]["w"], TABLES["ingredient_categories"]["y"] + 40)
ing_b = (TABLES["ingredients"]["x"] + 150, TABLES["ingredients"]["y"] + TABLES["ingredients"]["h"])
mid_x_cat = (cat_r[0] + ing_b[0]) // 2
draw_ortho(draw2, [cat_r, (mid_x_cat, cat_r[1]), (mid_x_cat, ing_b[1] + 30), (ing_b[0], ing_b[1] + 30), ing_b], stroke=(13, 148, 136), width=2)
draw2.text((cat_r[0] + 8, cat_r[1] - 16), "1", fill=(13, 148, 136), font=font_card_lbl)
draw2.text((ing_b[0] + 8, ing_b[1] + 8), "0..*", fill=(13, 148, 136), font=font_card_lbl)

# 4. measurement_units -> ingredients
mu_r = (TABLES["measurement_units"]["x"] + TABLES["measurement_units"]["w"], TABLES["measurement_units"]["y"] + 60)
ing_l_mu = (TABLES["ingredients"]["x"], TABLES["ingredients"]["y"] + 220)
draw_ortho(draw2, [mu_r, (mu_r[0] + 30, mu_r[1]), (mu_r[0] + 30, ing_l_mu[1]), ing_l_mu], stroke=(15, 118, 110), width=2)
draw2.text((mu_r[0] + 8, mu_r[1] - 16), "1", fill=(15, 118, 110), font=font_card_lbl)
draw2.text((ing_l_mu[0] - 25, ing_l_mu[1] - 16), "0..*", fill=(15, 118, 110), font=font_card_lbl)

# 5. recipes -> recipe_ingredients
rec_r = (TABLES["recipes"]["x"] + TABLES["recipes"]["w"], TABLES["recipes"]["y"] + 80)
ri_l = (TABLES["recipe_ingredients"]["x"], TABLES["recipe_ingredients"]["y"] + 80)
draw_ortho(draw2, [rec_r, ri_l], stroke=(109, 40, 217), width=2)
draw2.text((rec_r[0] + 8, rec_r[1] - 16), "1", fill=(109, 40, 217), font=font_card_lbl)
draw2.text((ri_l[0] - 25, ri_l[1] - 16), "1..*", fill=(109, 40, 217), font=font_card_lbl)

# 6. ingredients -> recipe_ingredients (vía inferior)
ing_r = (TABLES["ingredients"]["x"] + TABLES["ingredients"]["w"], TABLES["ingredients"]["y"] + 300)
ri_l_ing = (TABLES["recipe_ingredients"]["x"], TABLES["recipe_ingredients"]["y"] + 220)
mid_x_ing = (ing_r[0] + TABLES["recipes"]["x"]) // 2
pass_y_ing = 600
draw_ortho(draw2, [ing_r, (ing_r[0] + 25, ing_r[1]), (ing_r[0] + 25, pass_y_ing), (ri_l_ing[0] - 25, pass_y_ing), (ri_l_ing[0] - 25, ri_l_ing[1]), ri_l_ing], stroke=(194, 65, 12), width=2)
draw2.text((ing_r[0] + 8, ing_r[1] - 16), "1", fill=(194, 65, 12), font=font_card_lbl)
draw2.text((ri_l_ing[0] - 25, ri_l_ing[1] - 16), "0..*", fill=(194, 65, 12), font=font_card_lbl)

# 7. ingredients -> ingredient_price_history (vía inferior amplia)
ing_b_hist = (TABLES["ingredients"]["x"] + 400, TABLES["ingredients"]["y"] + TABLES["ingredients"]["h"])
iph_l = (TABLES["ingredient_price_history"]["x"], TABLES["ingredient_price_history"]["y"] + 80)
pass_y_iph = 720
draw_ortho(draw2, [ing_b_hist, (ing_b_hist[0], pass_y_iph), (iph_l[0] - 30, pass_y_iph), (iph_l[0] - 30, iph_l[1]), iph_l], stroke=(185, 28, 28), width=2)
draw2.text((ing_b_hist[0] + 8, ing_b_hist[1] + 12), "1", fill=(185, 28, 28), font=font_card_lbl)
draw2.text((iph_l[0] - 25, iph_l[1] - 16), "0..*", fill=(185, 28, 28), font=font_card_lbl)

# 8. recipes -> recipe_cost_audit_log
rec_b_audit = (TABLES["recipes"]["x"] + 300, TABLES["recipes"]["y"] + TABLES["recipes"]["h"])
rca_l = (TABLES["recipe_cost_audit_log"]["x"], TABLES["recipe_cost_audit_log"]["y"] + 80)
pass_y_rca = 640
draw_ortho(draw2, [rec_b_audit, (rec_b_audit[0], pass_y_rca), (rca_l[0] - 20, pass_y_rca), (rca_l[0] - 20, rca_l[1]), rca_l], stroke=(51, 65, 85), width=2)
draw2.text((rec_b_audit[0] + 8, rec_b_audit[1] + 12), "1", fill=(51, 65, 85), font=font_card_lbl)
draw2.text((rca_l[0] - 25, rca_l[1] - 16), "0..*", fill=(51, 65, 85), font=font_card_lbl)

# Dibujar las 8 Tablas
for t_key, t in TABLES.items():
    tx, ty, tw, th = t["x"], t["y"], t["w"], t["h"]
    mod = TABLE_MODULES[t["module"]]

    # Sombra suave
    draw2.rounded_rectangle([tx + 4, ty + 4, tx + tw + 4, ty + th + 4], radius=10, fill=(226, 232, 240))
    # Caja principal
    draw2.rounded_rectangle([tx, ty, tx + tw, ty + th], radius=10, fill=WHITE, outline=mod["border"], width=2)
    # Cabecera coloreada
    draw2.rounded_rectangle([tx, ty, tx + tw, ty + HEADER_HEIGHT], radius=8, fill=mod["header_bg"])
    draw2.rectangle([tx, ty + HEADER_HEIGHT - 8, tx + tw, ty + HEADER_HEIGHT], fill=mod["header_bg"])

    draw2.text((tx + 16, ty + 8), t["title"], fill=WHITE, font=font_tbl_hdr)
    draw2.text((tx + 16, ty + 28), t["subtitle"], fill=(203, 213, 225), font=font_tbl_sub)
    draw2.text((tx + tw - 14, ty + 10), mod["tag"], fill=(226, 232, 240), font=font_col_badge, anchor="ra")

    curr_y = ty + HEADER_HEIGHT
    for idx, (col_name, col_type, badge, constraint) in enumerate(t["columns"]):
        row_bg = ROW_BG_ALT if (idx % 2 == 1) else ROW_BG
        draw2.rectangle([tx + 1, curr_y, tx + tw - 1, curr_y + ROW_HEIGHT], fill=row_bg)
        draw2.line([(tx + 1, curr_y), (tx + tw - 1, curr_y)], fill=ROW_LINE, width=1)

        bx = tx + 12
        if "PK" in badge:
            draw2.rounded_rectangle([bx, curr_y + 4, bx + 26, curr_y + 22], radius=4, fill=PK_BG, outline=PK_FG, width=1)
            draw2.text((bx + 13, curr_y + 8), "PK", fill=PK_FG, font=font_col_badge, anchor="mt")
        elif "FK" in badge:
            draw2.rounded_rectangle([bx, curr_y + 4, bx + 26, curr_y + 22], radius=4, fill=FK_BG, outline=FK_FG, width=1)
            draw2.text((bx + 13, curr_y + 8), "FK", fill=FK_FG, font=font_col_badge, anchor="mt")
        elif "UQ" in badge:
            draw2.rounded_rectangle([bx, curr_y + 4, bx + 26, curr_y + 22], radius=4, fill=UQ_BG, outline=UQ_FG, width=1)
            draw2.text((bx + 13, curr_y + 8), "UQ", fill=UQ_FG, font=font_col_badge, anchor="mt")
        else:
            draw2.ellipse([bx + 8, curr_y + 11, bx + 14, curr_y + 17], fill=(148, 163, 184))

        # Columna 1: Nombre
        draw2.text((tx + 54, curr_y + 6), col_name, fill=SLATE_DARK, font=font_col_name)
        # Columna 2: Tipo de dato SQL
        draw2.text((tx + 235, curr_y + 7), col_type, fill=(3, 105, 161), font=font_col_type)
        # Columna 3: Restricción / FK
        draw2.text((tx + tw - 14, curr_y + 7), constraint, fill=SLATE_MUTED, font=font_col_badge, anchor="ra")

        curr_y += ROW_HEIGHT

# Panel de Leyenda y Reglas Culinarias Inferior
leg_y = 1120
leg_h = 420
draw2.rounded_rectangle([60, leg_y, W2 - 60, leg_y + leg_h], radius=12, fill=WHITE, outline=BORDER_COLOR, width=2)

draw2.text((90, leg_y + 25), "SIMBOLOGÍA DE INTEGRIDAD RELACIONAL", fill=HEADER_BG, font=font_legend_h)
keys_info = [
    (PK_BG, PK_FG, "PK", "Primary Key (UUID v4 criptográfico autogenerado por gen_random_uuid())"),
    (FK_BG, FK_FG, "FK", "Foreign Key (Integridad referencial estricta y cascada controlada)"),
    (UQ_BG, UQ_FG, "UQ", "Unique Constraint (Garantiza unicidad de insumos/recetas por estudiante)")
]
for k_idx, (k_bg, k_fg, k_lbl, k_desc) in enumerate(keys_info):
    ky = leg_y + 65 + (k_idx * 38)
    draw2.rounded_rectangle([90, ky, 126, ky + 22], radius=4, fill=k_bg, outline=k_fg, width=1)
    draw2.text((108, ky + 4), k_lbl, fill=k_fg, font=font_col_badge, anchor="mt")
    draw2.text((140, ky + 4), k_desc, fill=SLATE_DARK, font=font_legend_p)

draw2.text((900, leg_y + 25), "FÓRMULAS MATEMÁTICAS DE COSTEO CULINARIO (CU-06 Y CU-07)", fill=HEADER_BG, font=font_legend_h)
formulas_info = [
    ("1. Costo Base de Insumo:", "Costo Base = Precio Compra / (Cantidad Presentación × Factor Conversión)"),
    ("2. Merma Culinaria:", "Subtotal Insumo = (Cantidad Bruta × Costo Base) / (1 - %Merma / 100)"),
    ("3. Costo Total de Receta:", "Costo Total = ∑ Subtotales Insumos | Costo por Porción = Costo Total / Rendimiento"),
    ("4. Precio de Venta Sugerido:", "Precio Sugerido = Costo por Porción / (1 - %Margen / 100) | Utilidad Neta = Precio - Costo")
]
for f_idx, (f_lbl, f_desc) in enumerate(formulas_info):
    fy = leg_y + 65 + (f_idx * 38)
    draw2.text((900, fy), f_lbl, fill=ORANGE_HEADER, font=font_col_name)
    draw2.text((1150, fy), f_desc, fill=SLATE_DARK, font=font_legend_p)

draw2.text((1950, leg_y + 25), "TRAZABILIDAD Y REGLAS DE NEGOCIO (ISO/IEC 29110)", fill=HEADER_BG, font=font_legend_h)
rules_info = [
    ("• Aislamiento por Estudiante:", "Cada usuario resguarda su propio catálogo de insumos y recetas (CU-01)."),
    ("• Actualización en Cascada:", "Modificar el costo de un insumo actualiza automáticamente todas sus recetas (CU-08)."),
    ("• Auditoría Inmutable:", "Cada recálculo queda registrado con precio previo y nuevo en recipe_cost_audit_log."),
    ("• Resumen y Ficha Técnica:", "Desglose por porción, ingredientes proporcionales y precio fijado (CU-09).")
]
for r_idx, (r_lbl, r_desc) in enumerate(rules_info):
    ry = leg_y + 65 + (r_idx * 38)
    draw2.text((1950, ry), r_lbl, fill=TEAL, font=font_col_name)
    draw2.text((2200, ry), r_desc, fill=SLATE_DARK, font=font_legend_p)

draw2.text((2750, leg_y + 25), "INFRAESTRUCTURA Y PARIDAD DE AMBIENTES", fill=HEADER_BG, font=font_legend_h)
infra_info = [
    ("• Motor Local:", "PostgreSQL 16 Alpine en contenedor gastro_db."),
    ("• Persistencia:", "Volumen Docker permanente 'gastro_pgdata'."),
    ("• Semillas:", "15 unidades gastronómicas y 9 categorías precargadas."),
    ("• Conectividad:", "Pool TCP en localhost:5432 / gastro_network.")
]
for i_idx, (i_lbl, i_desc) in enumerate(infra_info):
    iy = leg_y + 65 + (i_idx * 38)
    draw2.text((2750, iy), i_lbl, fill=PURPLE_HEADER, font=font_col_name)
    draw2.text((2900, iy), i_desc, fill=SLATE_DARK, font=font_legend_p)

# Guardar Imagen ERD
erd_png_path = os.path.join(IMG_DIR, "database_erd.png")
erd_png_root = os.path.join(DOCS_DIR, "database_erd.png")
img2.save(erd_png_path, "PNG")
img2.save(erd_png_root, "PNG")
print("Guardado:", erd_png_path)
