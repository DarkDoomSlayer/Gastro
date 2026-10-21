# Matriz de Trazabilidad de Requerimientos y Arquitectura (ISO/IEC 29110)
## Proyecto: GastroProyect — Morelosoft International Solutions

| Metadato | Detalle |
| :--- | :--- |
| **Documento** | Matriz de Trazabilidad Bidireccional de Requerimientos, Diseño y Persistencia |
| **Estándar** | ISO/IEC 29110-5-1-1:2025 (Gestión de Requerimientos y Arquitectura de Software) |
| **Fuentes Auditadas** | `Gastro-Agreement`, `Gastro-ProyectPlan`, `Gastro_IterationPlan1.xlsx` |
| **Líder Técnico** | Carlos Manuel Aguirre Norato |
| **Fecha** | 20 de Octubre de 2026 |
| **Versión** | 1.0.0 (Sprint 0 Base) |

---

## 1. Trazabilidad Bidireccional de Requerimientos (100% de Cobertura)

La siguiente matriz evidencia la correspondencia unívoca entre las necesidades declaradas por el cliente en el **Acuerdo de Proyecto**, los **Casos de Uso (CUs)** del **Plan de Proyecto**, las **Entidades de la Base de Datos PostgreSQL**, los **Módulos de la Arquitectura de Software** y las **Rutas API REST**:

| ID Caso de Uso | Nombre del Caso de Uso (Plan de Proyecto) | Requerimiento en Acuerdo (`Gastro-Agreement`) | Entidades de Base de Datos Vinculadas | Componente de Arquitectura | Ruta API REST Contemplada | Estado en Sprint 0 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CU-01** | **Gestionar cuenta de usuario** | Gestión de información a nivel de usuario (estudiante) | `users` | Módulo de Autenticación & Perfil | `/api/auth/*` | **Arquitectura Base & DDL Definidos** |
| **CU-02** | **Registrar insumo** | Captura y edición del catálogo de insumos | `ingredients`, `measurement_units`, `ingredient_categories` | Módulo Catálogo de Insumos & Conversiones | `/api/ingredients` (POST) | **Arquitectura Base & DDL Definidos** |
| **CU-03** | **Administrar catálogo de insumos** | Control y administración del catálogo de insumos | `ingredients`, `ingredient_categories` | Módulo Catálogo de Insumos & Búsqueda | `/api/ingredients` (GET, PUT, DELETE) | **Arquitectura Base & DDL Definidos** |
| **CU-04** | **Crear producto o receta** | Formular productos/recetas utilizando los insumos previamente registrados | `recipes`, `recipe_ingredients`, `measurement_units` | Módulo de Formulación de Recetas | `/api/recipes` (POST) | **Arquitectura Base & DDL Definidos** |
| **CU-05** | **Gestionar productos o recetas** | Visualizar, modificar formulaciones existentes o eliminar | `recipes`, `recipe_ingredients` | Módulo de Gestión de Recetas | `/api/recipes` (GET, PUT, DELETE) | **Arquitectura Base & DDL Definidos** |
| **CU-06** | **Calcular costo de producción** | Cálculo automatizado del costo total de elaboración por producto | `recipe_ingredients`, `recipes`, `measurement_units` | Servicio de Cálculo Matemático & Mermas | `/api/recipes/:id/cost` (GET, POST) | **Arquitectura Base & DDL Definidos** |
| **CU-07** | **Calcular precio de venta** | Aplicación de márgenes de ganancia personalizables y precio de venta | `recipes` (campos: `profit_margin_pct`, `suggested_sale_price`, `net_profit_per_portion`) | Servicio de Fijación de Precios y Utilidades | `/api/recipes/:id/pricing` (POST) | **Arquitectura Base & DDL Definidos** |
| **CU-08** | **Actualizar costos en cascada** | Recálculo automático de recetas cuando el insumo cambia de precio | `ingredient_price_history`, `recipe_cost_audit_log`, `recipes`, `recipe_ingredients` | Motor de Cascada y Auditoría de Costos | `/api/ingredients/:id/price` (PATCH) | **Arquitectura Base & DDL Definidos** |
| **CU-09** | **Consultar resumen de costeo** | Desglose detallado de producto: insumos, cantidades, costo, margen y precio | `recipes`, `recipe_ingredients`, `ingredients`, `measurement_units` | Módulo de Ficha Técnica Gastronómica | `/api/recipes/:id/summary` (GET) | **Arquitectura Base & DDL Definidos** |

---

## 2. Trazabilidad de Riesgos del Plan de Proyecto vs. Diseño Técnico

| ID Riesgo | Descripción del Riesgo (`Gastro-ProyectPlan`) | Estrategia de Mitigación en el Plan | Implementación Concreta en la Arquitectura y Base de Datos |
| :--- | :--- | :--- | :--- |
| **R-01** | Desconocimiento de fórmulas, mermas o criterios culinarios | Validaciones tempranas con estudiantes de gastronomía | Inclusión explícita de campos de merma estándar (`default_waste_pct`), merma por receta (`waste_pct_override`) y rendimiento en porciones (`yield_portions`). |
| **R-02** | Inconsistencias al calcular costos con diferentes unidades de medida (comprar en kg y usar en g) | Sistema estandarizado de equivalencias y conversiones automáticas | Entidad relacional `measurement_units` con tipo de dimensión (`MASS`, `VOLUME`, `UNIT`), factor de conversión canónico precalculado (`conversion_factor`) y semilla con 15 unidades estándar. |
| **R-03** | Posible complejidad de uso que dificulte la transición desde Excel | Pruebas de usabilidad con prototipo intuitivo | Arquitectura desacoplada SPA (React + Tailwind CSS) que permite interfaces ágiles, reactivas y de una sola pantalla para costeo dinámico. |

---

## 3. Conformidad con el Estándar ISO/IEC 29110-5-1-1

1. **Gestión de Configuración:** Repositorio Git inicializado con control de ramas y exclusiones estrictas en `.gitignore`.
2. **Línea Base de Arquitectura (LB-01):** Congelación del diseño multicapa y del esquema DDL de persistencia para el arranque del Sprint 1.
3. **Aislamiento Documental:** Repositorio de Documentación (Google Drive) y Repositorio de Código Fuente (Git) sincronizados sin duplicaciones indebidas ni contaminación de archivos temporales.
