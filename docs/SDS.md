# Especificación de Diseño de Software (SDS) — Arquitectura Base
## GastroProyect — Sistema de Costeo y Precios de Venta Gastronómicos

| Metadato | Detalle |
| :--- | :--- |
| **Documento** | Especificación de Diseño de Software (SDS) — Arquitectura y Persistencia |
| **Proyecto** | GastroProyect |
| **Equipo** | Morelosoft International Solutions |
| **Institución** | Universidad Autónoma de Zacatecas (UAZ) |
| **Estándar** | ISO/IEC 29110-5-1-1:2025 |
| **Responsable** | Carlos Manuel Aguirre Norato (Líder Técnico) |
| **Revisores** | Karol Christopher Espino Galicia (Líder de Equipo), Héctor Varela Medina (Calidad) |
| **Versión** | 0.1.0 (Arquitectura Inicial Base) |

---

## 1. Propósito y Alcance del Documento
El propósito de esta especificación es formalizar la **arquitectura técnica base** y el **modelo de datos relacional** que sustentarán el desarrollo de la herramienta **GastroProyect**. 

Conforme al hito actual del proyecto (Sprint 0 / Arranque), este documento delimita la estructura arquitectónica fundamental, la topología de contenedores Docker, la conectividad y el diseño de la base de datos local, sirviendo como contrato técnico de referencia previo a la implementación de las reglas de negocio del Sprint 1.

---

## 2. Decisión Arquitectónica Principal
1. **Patrón Arquitectónico:** Arquitectura Cliente-Servidor Desacoplada (Three-Tier Architecture).
2. **Contenerización Total (Docker Compose):** Todos los componentes (Base de Datos, API Backend y SPA Frontend) se ejecutan en contenedores coordinados dentro de una red bridge dedicada (`gastro_network`), eliminando dependencias del sistema operativo anfitrión.
3. **Persistencia Transaccional:** Motor relacional **PostgreSQL 16 Alpine** con volumen Docker nombrado (`gastro_pgdata`) y scripts DDL automáticos montados como solo lectura (`/docker-entrypoint-initdb.d:ro`).

---

## 3. Diagrama de Arquitectura de Componentes

```mermaid
graph TB
    subgraph FrontendSPA["Capa de Presentación: Frontend SPA (React 18 + Vite)"]
        UI["Vistas & Layout Base (Tailwind CSS)"]
        Components["Componentes Modulares & Tableros"]
        ApiClient["Cliente HTTP Centralizado (api.js)"]

        UI --> Components
        Components --> ApiClient
    end

    subgraph BackendAPI["Capa de Negocio: Backend REST API (Node.js + Express)"]
        Router["Enrutador REST (/api)"]
        Controllers["Controladores HTTP & Validación"]
        Services["Lógica de Negocio & Algoritmos de Costeo"]
        ConfigDB["Pool de Persistencia PostgreSQL (pg pool)"]

        Router --> Controllers
        Controllers --> Services
        Services --> ConfigDB
    end

    subgraph DatabaseLayer["Capa de Datos: Base de Datos Relacional (PostgreSQL 16)"]
        Tables["Esquema Normalizado 3NF (8 Tablas Principales)"]
        Seeds["Datos Semilla (Unidades Culinarias & Categorías)"]
        Audit["Logs de Trazabilidad y Cascada"]

        Tables --- Seeds
        Tables --- Audit
    end

    ApiClient -->|Peticiones HTTP REST / JSON (Puerto 4000)| Router
    ConfigDB -->|Conexión SQL / TCP Pool (Puerto 5432)| Tables
```

---

## 4. Diagrama de Persistencia (Modelo Relacional ERD)

```mermaid
erDiagram
    users ||--o{ ingredients : "1 a N (Catálogo por estudiante)"
    users ||--o{ recipes : "1 a N (Recetas por estudiante)"
    
    ingredient_categories ||--o{ ingredients : "1 a N (Clasificación)"
    measurement_units ||--o{ ingredients : "1 a N (Unidades de compra y uso)"
    measurement_units ||--o{ recipe_ingredients : "1 a N (Unidad en receta)"
    
    recipes ||--|{ recipe_ingredients : "1 a N (Desglose de ingredientes)"
    ingredients ||--o{ recipe_ingredients : "1 a N (Uso en recetas)"
    
    ingredients ||--o{ ingredient_price_history : "1 a N (Historial de variaciones)"
    recipes ||--o{ recipe_cost_audit_log : "1 a N (Auditoría de recálculos)"
    ingredients ||--o{ recipe_cost_audit_log : "0..1 a N (Insumo detonador)"

    users {
        uuid id PK
        varchar email UK
        varchar full_name
        varchar student_id
        varchar role
    }

    measurement_units {
        uuid id PK
        varchar name UK
        varchar symbol UK
        varchar unit_type
        decimal conversion_factor
    }

    ingredient_categories {
        uuid id PK
        varchar name UK
        text description
    }

    ingredients {
        uuid id PK
        uuid user_id FK
        uuid category_id FK
        varchar name
        decimal purchase_price
        decimal unit_cost_base
        decimal default_waste_pct
    }

    recipes {
        uuid id PK
        uuid user_id FK
        varchar name
        decimal yield_portions
        decimal total_cost
        decimal cost_per_portion
        decimal profit_margin_pct
        decimal suggested_sale_price
    }

    recipe_ingredients {
        uuid id PK
        uuid recipe_id FK
        uuid ingredient_id FK
        decimal quantity
        decimal unit_cost_snapshot
        decimal subtotal_cost
    }

    ingredient_price_history {
        uuid id PK
        uuid ingredient_id FK
        decimal old_purchase_price
        decimal new_purchase_price
        timestamp recorded_at
    }

    recipe_cost_audit_log {
        uuid id PK
        uuid recipe_id FK
        decimal previous_total_cost
        decimal new_total_cost
        varchar event_type
        timestamp created_at
    }
```

---

## 5. Topología de Despliegue y Orquestación

```mermaid
graph TB
    subgraph HostSystem["Sistema Anfitrión (Linux / macOS / Windows)"]
        subgraph DockerCompose["Orquestación: docker-compose"]
            subgraph GastroNet["Red Aislada: gastro_network"]
                WebNode["Contenedor: gastro_web\n(React 18 / Vite)\nPuerto Host: 3000"]
                ApiNode["Contenedor: gastro_api\n(Node.js / Express)\nPuerto Host: 4000"]
                DbNode["Contenedor: gastro_db\n(PostgreSQL 16)\nPuerto Host: 5432"]
            end

            Storage[("Volumen Persistente: gastro_pgdata")]
        end
    end

    Usuario([Estudiante de Gastronomía]) -->|http://localhost:3000| WebNode
    WebNode -->|Peticiones API /:4000| ApiNode
    ApiNode -->|TCP /:5432| DbNode
    DbNode --- Storage
```

---

## 6. Verificación de Conformidad y Estado de Entrega
- **Base de Datos Local:** Implementada en PostgreSQL 16 con DDL y datos semilla iniciales.
- **Backend API:** Implementado con pool de conexión, verificación de latencia y healthcheck.
- **Frontend SPA:** Implementado con panel de control de arquitectura y monitoreo en tiempo real.
- **Trazabilidad ISO/IEC 29110:** 100% de cobertura entre Requerimientos, CUs, Tablas de BD y Endpoints.
