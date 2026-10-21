-- ==============================================================================
-- GastroProyect — Datos Semilla Iniciales (Seed Data)
-- Estándar: ISO/IEC 29110-5-1-1:2025
-- ==============================================================================

-- 1. Unidades de Medida Base y Conversiones Culinarias
INSERT INTO measurement_units (name, symbol, unit_type, base_unit_symbol, conversion_factor) VALUES
    ('Gramo', 'g', 'MASS', 'g', 1.000000),
    ('Kilogramo', 'kg', 'MASS', 'g', 1000.000000),
    ('Miligramo', 'mg', 'MASS', 'g', 0.001000),
    ('Libra', 'lb', 'MASS', 'g', 453.592370),
    ('Onza', 'oz', 'MASS', 'g', 28.349500),
    ('Mililitro', 'ml', 'VOLUME', 'ml', 1.000000),
    ('Litro', 'l', 'VOLUME', 'ml', 1000.000000),
    ('Taza (Cup)', 'tz', 'VOLUME', 'ml', 240.000000),
    ('Cucharada (Tbsp)', 'cda', 'VOLUME', 'ml', 15.000000),
    ('Cucharadita (Tsp)', 'cdita', 'VOLUME', 'ml', 5.000000),
    ('Pieza', 'pz', 'UNIT', 'pz', 1.000000),
    ('Unidad', 'u', 'UNIT', 'pz', 1.000000),
    ('Manojo', 'manojo', 'UNIT', 'pz', 1.000000),
    ('Lata', 'lata', 'UNIT', 'pz', 1.000000),
    ('Paquete', 'pqte', 'UNIT', 'pz', 1.000000)
ON CONFLICT (symbol) DO NOTHING;

-- 2. Categorías Gastronómicas Oficiales
INSERT INTO ingredient_categories (name, description) VALUES
    ('Lácteos y Derivados', 'Leche, quesos, mantequillas, cremas y yogures'),
    ('Carnes y Aves', 'Carnes de res, cerdo, pollo, pavo y embutidos'),
    ('Pescados y Mariscos', 'Pescados frescos, mariscos y conservas del mar'),
    ('Frutas, Verduras y Hortalizas', 'Vegetales, hierbas frescas, frutas y tubérculos'),
    ('Granos, Harinas y Cereales', 'Arroz, harinas de trigo/maíz, avena, pastas y legumbres'),
    ('Especias, Condimentos y Hierbas Secas', 'Pimienta, sal, orégano, canela, comino y condimentos'),
    ('Aceites, Grasas y Vinagres', 'Aceites vegetales, de oliva, manteca y vinagres'),
    ('Endulzantes y Chocolatería', 'Azúcar estándar, mascabado, mieles, chocolates y jarabes'),
    ('Abarrotes y Conservas', 'Enlatados, salsas base, pastas de tomate y caldos')
ON CONFLICT (name) DO NOTHING;

-- 3. Usuario Estudiante Inicial (Demostración de Arquitectura Base)
INSERT INTO users (id, email, password_hash, full_name, student_id, role, is_active) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'estudiante.gastro@uaz.edu.mx', '$2b$10$w8F2bJ3cKnH6QO0sN7M1zeW8i7Q6fUuP7LzK4b2D0h.9iJk8Xy.8u', 'Carlos Manuel Aguirre (Estudiante Gastronomía)', 'UAZ-GASTRO-2026', 'ESTUDIANTE', TRUE)
ON CONFLICT (email) DO NOTHING;
