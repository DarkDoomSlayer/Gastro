# GastroProyect

Herramienta de software para la administración de insumos y automatización de costos y precios de venta gastronómicos.  
El sistema está estructurado bajo una arquitectura modular desacoplada de 3 capas y se ejecuta completamente mediante contenedores Docker.

---

## 1. Estructura del Repositorio

```text
├── frontend/           # Código fuente de la interfaz de usuario (React 18 + Vite + Tailwind CSS)
├── backend/            # Código fuente de la API REST (Node.js + Express)
├── db/                 # Scripts DDL de inicialización de la base de datos relacional (PostgreSQL 16)
│   └── init/
│       └── 01-init-schema.sql
├── docker-compose.yml  # Orquestador multi-contenedor
├── .env.example        # Plantilla de variables de entorno
└── README.md           # Este documento
```

---

## 2. Diagrama de Arquitectura del Sistema

```mermaid
graph TD
    subgraph Host["Sistema Anfitrión (Docker Compose)"]
        subgraph GastroNet["Red Aislada: gastro_network"]
            Frontend["Frontend SPA (React 18 + Vite + Tailwind)\nPuerto: 3000 (gastro_web)"]
            Backend["Backend REST API (Node.js 20 + Express)\nPuerto: 4000 (gastro_api)"]
            Database[("Base de Datos (PostgreSQL 16 Alpine)\nPuerto: 5432 (gastro_db)")]
        end
        Volume[("Volumen Persistente: gastro_pgdata")]
    end

    User([Estudiante / Usuario]) -->|HTTP /:3000| Frontend
    Frontend -->|Peticiones REST /:4000| Backend
    Backend -->|Pool TCP /:5432| Database
    Database --- Volume
```

---

## 3. Instrucciones de Despliegue Local

1. **Clonar el repositorio y preparar variables de entorno:**
   ```bash
   cp .env.example .env
   ```

2. **Construir y levantar los contenedores con Docker Compose:**
   ```bash
   docker compose up -d
   ```

3. **Verificar el estado de los servicios:**
   ```bash
   docker compose ps
   ```

4. **URLs de acceso a los servicios:**
   - **Frontend SPA:** [http://localhost:3000](http://localhost:3000)
   - **Backend API (Healthcheck):** [http://localhost:4000/api/health](http://localhost:4000/api/health)
   - **Backend DB Status:** [http://localhost:4000/api/health/db](http://localhost:4000/api/health/db)
   - **Base de Datos PostgreSQL:** `localhost:5432` (Base de datos: `gastro_db`, Usuario: `gastro_user`)
