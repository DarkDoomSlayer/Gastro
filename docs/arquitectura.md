# Definición y Documentación de Arquitectura de Software
## Plataforma de Administración de Insumos y Costeo Gastronómico (GastroProyect)

| Proyecto | GastroProyect — Sistema de Costeo y Precios de Venta Gastronómicos |
| :--- | :--- |
| **Institución** | Universidad Autónoma de Zacatecas (UAZ) |
| **Equipo** | Morelosoft International Solutions |
| **Estándar** | ISO/IEC 29110-5-1-1:2025 |
| **Hito / Entrega** | Sprint 0 (Arquitectura Base y Diseño de Base de Datos) |
| **Líder Técnico** | Carlos Manuel Aguirre Norato |
| **Especificación de BD** | [`docs/database_schema.md`](file:///home/dark/Documentos/UAZ/Gastro/docs/database_schema.md) |
| **Matriz de Trazabilidad** | [`docs/trazabilidad_iso29110.md`](file:///home/dark/Documentos/UAZ/Gastro/docs/trazabilidad_iso29110.md) |
| **SDS Formal** | [`docs/SDS.md`](file:///home/dark/Documentos/UAZ/Gastro/docs/SDS.md) |

---

## 1. Resumen Ejecutivo de la Arquitectura
El sistema adopta una **Arquitectura Cliente-Servidor Desacoplada Multicapa (Three-Tier Architecture)**, completamente contenerizada y orquestada mediante **Docker Compose**. 

Esta decisión de diseño arquitectónico garantiza:
1. **Portabilidad y Reproducibilidad Total:** Los entornos de desarrollo y evaluación se ejecutan exactamente igual en Linux, macOS o Windows mediante un único comando (`docker compose up -d`).
2. **Aislamiento de Responsabilidades:** Cada capa (Presentación, Lógica de Negocio y Persistencia) opera de forma independiente y se comunica a través de contratos de datos bien definidos (HTTP REST / JSON y TCP SQL).
3. **Escalabilidad y Mantenibilidad:** Permite añadir nuevas funcionalidades y reglas de cálculo culinario sin afectar el diseño estructural ni la integridad de los datos.

---

## 2. Diagrama de Componentes de la Arquitectura

```mermaid
graph TB
    subgraph FrontendApp["Capa de Presentación: Frontend SPA (React 18 + Vite)"]
        UI["Vistas & Layout Base (Tailwind CSS)"]
        Components["Componentes Modulares & Tableros"]
        ApiClient["Cliente HTTP Centralizado (api.js)"]

        UI --> Components
        Components --> ApiClient
    end

    subgraph BackendApp["Capa de Negocio: Backend REST API (Node.js + Express)"]
        Router["Enrutador REST (/api)"]
        Controllers["Controladores HTTP & Validación"]
        Services["Lógica de Negocio & Algoritmos de Costeo"]
        ConfigDB["Pool de Persistencia PostgreSQL (pg pool)"]

        Router --> Controllers
        Controllers --> Services
        Services --> ConfigDB
    end

    subgraph PersistenceLayer["Capa de Datos: Base de Datos Relacional (PostgreSQL 16)"]
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

## 3. Diagrama de Despliegue y Topología de Contenedores

```mermaid
graph TB
    subgraph Host["Sistema Anfitrión (Linux / macOS / Windows)"]
        subgraph Orchestration["Orquestador: Docker Compose"]
            subgraph IsolatedNet["Red Bridge Aislada: gastro_network"]
                WebContainer["Contenedor: gastro_web\n(Node:20 Alpine + Vite)\nPuerto Host: 3000"]
                ApiContainer["Contenedor: gastro_api\n(Node:20 Alpine + Express)\nPuerto Host: 4000"]
                DbContainer["Contenedor: gastro_db\n(PostgreSQL:16 Alpine)\nPuerto Host: 5432"]
            end
            
            VolumeStorage[("Volumen Persistente: gastro_pgdata")]
        end
    end

    ClientUser([Estudiante / Usuario de Gastronomía]) -->|http://localhost:3000| WebContainer
    WebContainer -->|Peticiones API /:4000| ApiContainer
    ApiContainer -->|Conexión TCP /:5432 (pg_isready)| DbContainer
    DbContainer --- VolumeStorage
```

---

## 4. Descripción y Responsabilidades de las Capas

### 4.1 Capa de Presentación (Frontend SPA — `gastro_web`)
*   **Stack:** React 18, Vite 5, Tailwind CSS.
*   **Responsabilidad:** Proporcionar al estudiante de gastronomía una interfaz ágil, visual e intuitiva que sustituya las hojas de cálculo tradicionales. En esta fase base, expone el tablero de monitoreo de arquitectura, estado de salud de servicios y visibilidad de los 9 casos de uso trazados.
*   **Puerto:** `3000:3000`.

### 4.2 Capa de Lógica de Aplicación (Backend REST API — `gastro_api`)
*   **Stack:** Node.js v20+, Express, biblioteca nativa `pg` (Connection Pooling).
*   **Estructura Interna:**
    *   `src/config/db.js`: Manejo de pool de conexiones, healthcheck y latencia de base de datos.
    *   `src/routes/health.routes.js`: Endpoints oficiales de comprobación de salud del sistema (`/api/health`, `/api/health/db`, `/api/architecture`).
    *   `src/routes/index.js`: Enrutador central con placeholders estructurados para los casos de uso del Sprint 1.
*   **Puerto:** `4000:4000`.

### 4.3 Capa de Persistencia (Base de Datos Relacional — `gastro_db`)
*   **Stack:** PostgreSQL 16 Alpine con inicialización automatizada en `/docker-entrypoint-initdb.d/`.
*   **Estructura:**
    *   `01-init-schema.sql`: 8 entidades relacionales fuertemente tipadas con claves foráneas, restricciones de unicidad e índices para alta concurrencia.
    *   `02-seed-data.sql`: 15 unidades de medida gastronómicas con factores de conversión canónicos, 9 categorías oficiales y un estudiante semilla inicial.
*   **Almacenamiento Persistente:** Volumen Docker con nombre `gastro_pgdata` que preserva la información entre reinicios.
*   **Puerto:** `5432:5432`.

---

## 5. Principios de Diseño Arquitectónico Aplicados
1. **Desacoplamiento Estricto:** Frontend y Backend no comparten estado en memoria; la comunicación es 100% sin estado (Stateless REST) mediante JSON.
2. **Alta Cohesión y Bajo Acoplamiento:** La lógica de cálculo culinario, conversión de unidades y auditoría de variaciones en cascada está aislada en la capa de servicios del backend.
3. **Reproducibilidad Inmediata:** Despliegue con cero configuración manual mediante `docker-compose.yml`.
4. **Trazabilidad 100%:** Cada entidad de base de datos y componente de software responde directamente a los requerimientos del Acuerdo de Proyecto (`Gastro-Agreement`) y el Plan de Proyecto (`Gastro-ProyectPlan`).
