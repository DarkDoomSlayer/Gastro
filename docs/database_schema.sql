-- Referencia directa al script DDL oficial de inicialización:
-- db/init/01-init-schema.sql y db/init/02-seed-data.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    student_id VARCHAR(50),
    role VARCHAR(30) NOT NULL DEFAULT 'ESTUDIANTE' CHECK (role IN ('ESTUDIANTE', 'DOCENTE', 'ADMIN')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS measurement_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    symbol VARCHAR(10) NOT NULL UNIQUE,
    unit_type VARCHAR(20) NOT NULL CHECK (unit_type IN ('MASS', 'VOLUME', 'UNIT')),
    base_unit_symbol VARCHAR(10) NOT NULL,
    conversion_factor DECIMAL(14, 6) NOT NULL DEFAULT 1.0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ingredient_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES ingredient_categories(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    brand VARCHAR(100),
    purchase_unit_id UUID NOT NULL REFERENCES measurement_units(id),
    purchase_quantity DECIMAL(12, 4) NOT NULL CHECK (purchase_quantity > 0),
    purchase_price DECIMAL(12, 4) NOT NULL CHECK (purchase_price >= 0),
    usage_unit_id UUID NOT NULL REFERENCES measurement_units(id),
    unit_cost_base DECIMAL(14, 6) NOT NULL CHECK (unit_cost_base >= 0),
    default_waste_pct DECIMAL(5, 2) NOT NULL DEFAULT 0.00 CHECK (default_waste_pct >= 0 AND default_waste_pct < 100),
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_ingredient_name UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    yield_portions DECIMAL(8, 2) NOT NULL DEFAULT 1.00 CHECK (yield_portions > 0),
    prep_time_minutes INT DEFAULT 0 CHECK (prep_time_minutes >= 0),
    total_cost DECIMAL(12, 4) NOT NULL DEFAULT 0.0000 CHECK (total_cost >= 0),
    cost_per_portion DECIMAL(12, 4) NOT NULL DEFAULT 0.0000 CHECK (cost_per_portion >= 0),
    profit_margin_pct DECIMAL(5, 2) NOT NULL DEFAULT 30.00 CHECK (profit_margin_pct >= 0),
    suggested_sale_price DECIMAL(12, 4) NOT NULL DEFAULT 0.0000 CHECK (suggested_sale_price >= 0),
    target_sale_price DECIMAL(12, 4) NOT NULL DEFAULT 0.0000 CHECK (target_sale_price >= 0),
    net_profit_per_portion DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_recipe_name UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    quantity DECIMAL(12, 4) NOT NULL CHECK (quantity > 0),
    measurement_unit_id UUID NOT NULL REFERENCES measurement_units(id),
    waste_pct_override DECIMAL(5, 2) DEFAULT NULL CHECK (waste_pct_override IS NULL OR (waste_pct_override >= 0 AND waste_pct_override < 100)),
    effective_waste_pct DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    unit_cost_snapshot DECIMAL(14, 6) NOT NULL,
    subtotal_cost DECIMAL(12, 4) NOT NULL CHECK (subtotal_cost >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_recipe_ingredient UNIQUE (recipe_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS ingredient_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    old_purchase_price DECIMAL(12, 4) NOT NULL,
    new_purchase_price DECIMAL(12, 4) NOT NULL,
    old_unit_cost_base DECIMAL(14, 6) NOT NULL,
    new_unit_cost_base DECIMAL(14, 6) NOT NULL,
    change_reason VARCHAR(255),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipe_cost_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    trigger_ingredient_id UUID REFERENCES ingredients(id) ON DELETE SET NULL,
    previous_total_cost DECIMAL(12, 4) NOT NULL,
    new_total_cost DECIMAL(12, 4) NOT NULL,
    previous_suggested_price DECIMAL(12, 4) NOT NULL,
    new_suggested_price DECIMAL(12, 4) NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('CASCADE_UPDATE', 'MANUAL_RECALCULATE', 'INGREDIENT_MODIFIED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
