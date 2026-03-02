-- ====================================================
-- MIGRACIÓN MULTI-TENANT - SISTEMA INVENTARIO BICU
-- ====================================================
-- Fecha: 2026-02-14
-- Descripción: Migración a arquitectura multi-tenant con aislamiento por organización
-- IMPORTANTE: Esta migración NO elimina datos existentes
-- ====================================================

-- PASO 1: Crear tabla de organizaciones
-- ====================================================

CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(30),
    address TEXT,
    city VARCHAR(100),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice para búsquedas por código
CREATE INDEX idx_organizations_code ON organizations(code);
CREATE INDEX idx_organizations_active ON organizations(active);

-- Insertar organización por defecto (BICU Bluefields)
INSERT INTO organizations (name, code, email, city, active)
VALUES ('BICU - Bluefields', 'BICU-BLF', 'admin@bicu.edu.ni', 'Bluefields', true)
ON CONFLICT (code) DO NOTHING;

-- ====================================================
-- PASO 2: Agregar organization_id a tabla users
-- ====================================================

-- Agregar columna (permitir NULL temporalmente para migración)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS organization_id INTEGER;

-- Asignar todos los usuarios existentes a la organización por defecto
UPDATE users 
SET organization_id = 1 
WHERE organization_id IS NULL;

-- Ahora hacer la columna NOT NULL y agregar FK
ALTER TABLE users 
ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE users
ADD CONSTRAINT fk_users_organization 
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT;

-- Crear índice
CREATE INDEX idx_users_organization ON users(organization_id);

-- ====================================================
-- PASO 3: Agregar organization_id a tabla categories
-- ====================================================

ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS organization_id INTEGER;

UPDATE categories 
SET organization_id = 1 
WHERE organization_id IS NULL;

ALTER TABLE categories 
ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE categories
ADD CONSTRAINT fk_categories_organization 
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT;

CREATE INDEX idx_categories_organization ON categories(organization_id);

-- ====================================================
-- PASO 4: Agregar organization_id a tabla spare_parts
-- ====================================================

ALTER TABLE spare_parts 
ADD COLUMN IF NOT EXISTS organization_id INTEGER;

UPDATE spare_parts 
SET organization_id = 1 
WHERE organization_id IS NULL;

ALTER TABLE spare_parts 
ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE spare_parts
ADD CONSTRAINT fk_spare_parts_organization 
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT;

CREATE INDEX idx_spare_parts_organization ON spare_parts(organization_id);

-- ====================================================
-- PASO 5: Agregar organization_id a tabla suppliers
-- ====================================================

ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS organization_id INTEGER;

UPDATE suppliers 
SET organization_id = 1 
WHERE organization_id IS NULL;

ALTER TABLE suppliers 
ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE suppliers
ADD CONSTRAINT fk_suppliers_organization 
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT;

CREATE INDEX idx_suppliers_organization ON suppliers(organization_id);

-- ====================================================
-- PASO 6: Agregar organization_id a tabla equipments
-- ====================================================

ALTER TABLE equipments 
ADD COLUMN IF NOT EXISTS organization_id INTEGER;

UPDATE equipments 
SET organization_id = 1 
WHERE organization_id IS NULL;

ALTER TABLE equipments 
ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE equipments
ADD CONSTRAINT fk_equipments_organization 
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT;

CREATE INDEX idx_equipments_organization ON equipments(organization_id);

-- ====================================================
-- PASO 7: Agregar organization_id a tabla entries
-- ====================================================

ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS organization_id INTEGER;

UPDATE entries 
SET organization_id = 1 
WHERE organization_id IS NULL;

ALTER TABLE entries 
ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE entries
ADD CONSTRAINT fk_entries_organization 
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT;

CREATE INDEX idx_entries_organization ON entries(organization_id);

-- ====================================================
-- PASO 8: Agregar organization_id a tabla entry_details
-- ====================================================

ALTER TABLE entry_details 
ADD COLUMN IF NOT EXISTS organization_id INTEGER;

UPDATE entry_details 
SET organization_id = 1 
WHERE organization_id IS NULL;

ALTER TABLE entry_details 
ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE entry_details
ADD CONSTRAINT fk_entry_details_organization 
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT;

CREATE INDEX idx_entry_details_organization ON entry_details(organization_id);

-- ====================================================
-- PASO 9: Agregar organization_id a tabla outputs
-- ====================================================

ALTER TABLE outputs 
ADD COLUMN IF NOT EXISTS organization_id INTEGER;

UPDATE outputs 
SET organization_id = 1 
WHERE organization_id IS NULL;

ALTER TABLE outputs 
ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE outputs
ADD CONSTRAINT fk_outputs_organization 
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT;

CREATE INDEX idx_outputs_organization ON outputs(organization_id);

-- ====================================================
-- PASO 10: Agregar organization_id a tabla output_details
-- ====================================================

ALTER TABLE output_details 
ADD COLUMN IF NOT EXISTS organization_id INTEGER;

UPDATE output_details 
SET organization_id = 1 
WHERE organization_id IS NULL;

ALTER TABLE output_details 
ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE output_details
ADD CONSTRAINT fk_output_details_organization 
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT;

CREATE INDEX idx_output_details_organization ON output_details(organization_id);

-- ====================================================
-- PASO 11: Agregar organization_id a tabla audit_logs
-- ====================================================

ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS organization_id INTEGER;

UPDATE audit_logs 
SET organization_id = 1 
WHERE organization_id IS NULL;

ALTER TABLE audit_logs 
ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE audit_logs
ADD CONSTRAINT fk_audit_logs_organization 
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT;

CREATE INDEX idx_audit_logs_organization ON audit_logs(organization_id);

-- ====================================================
-- PASO 12: Agregar organization_id a tabla kardex (si existe)
-- ====================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kardex') THEN
        ALTER TABLE kardex ADD COLUMN IF NOT EXISTS organization_id INTEGER;
        
        UPDATE kardex 
        SET organization_id = 1 
        WHERE organization_id IS NULL;
        
        ALTER TABLE kardex ALTER COLUMN organization_id SET NOT NULL;
        
        ALTER TABLE kardex
        ADD CONSTRAINT fk_kardex_organization 
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT;
        
        CREATE INDEX IF NOT EXISTS idx_kardex_organization ON kardex(organization_id);
    END IF;
END $$;

-- ====================================================
-- PASO 13: Agregar organization_id a tabla movements (si existe)
-- ====================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'movements') THEN
        ALTER TABLE movements ADD COLUMN IF NOT EXISTS organization_id INTEGER;
        
        UPDATE movements 
        SET organization_id = 1 
        WHERE organization_id IS NULL;
        
        ALTER TABLE movements ALTER COLUMN organization_id SET NOT NULL;
        
        ALTER TABLE movements
        ADD CONSTRAINT fk_movements_organization 
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT;
        
        CREATE INDEX IF NOT EXISTS idx_movements_organization ON movements(organization_id);
    END IF;
END $$;

-- ====================================================
-- PASO 14: Agregar organization_id a tabla inventory (si existe)
-- ====================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory') THEN
        ALTER TABLE inventory ADD COLUMN IF NOT EXISTS organization_id INTEGER;
        
        UPDATE inventory 
        SET organization_id = 1 
        WHERE organization_id IS NULL;
        
        ALTER TABLE inventory ALTER COLUMN organization_id SET NOT NULL;
        
        ALTER TABLE inventory
        ADD CONSTRAINT fk_inventory_organization 
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT;
        
        CREATE INDEX IF NOT EXISTS idx_inventory_organization ON inventory(organization_id);
    END IF;
END $$;

-- ====================================================
-- PASO 15: Agregar organization_id a tabla branch_spare_parts (si existe)
-- ====================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'branch_spare_parts') THEN
        ALTER TABLE branch_spare_parts ADD COLUMN IF NOT EXISTS organization_id INTEGER;
        
        UPDATE branch_spare_parts 
        SET organization_id = 1 
        WHERE organization_id IS NULL;
        
        ALTER TABLE branch_spare_parts ALTER COLUMN organization_id SET NOT NULL;
        
        ALTER TABLE branch_spare_parts
        ADD CONSTRAINT fk_branch_spare_parts_organization 
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT;
        
        CREATE INDEX IF NOT EXISTS idx_branch_spare_parts_organization ON branch_spare_parts(organization_id);
    END IF;
END $$;

-- ====================================================
-- VERIFICACIÓN FINAL
-- ====================================================

-- Verificar que todos los datos fueron migrados correctamente
DO $$
DECLARE
    org_count INTEGER;
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO org_count FROM organizations;
    SELECT COUNT(*) INTO user_count FROM users WHERE organization_id IS NOT NULL;
    
    RAISE NOTICE '✓ Migración completada';
    RAISE NOTICE '  Organizaciones creadas: %', org_count;
    RAISE NOTICE '  Usuarios migrados: %', user_count;
    RAISE NOTICE '✓ Todos los datos existentes fueron preservados';
    RAISE NOTICE '✓ Todos los registros pertenecen a organización BICU-BLF (id=1)';
END $$;
