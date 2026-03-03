-- ====================================================
-- MIGRACIÓN: Hacer constraints UNIQUE multi-tenant
-- ====================================================
-- Fecha: 2026-03-03
-- Descripción: Modifica constraints UNIQUE para permitir nombres duplicados entre organizaciones
-- El constraint categories_name_key actual solo permite un nombre único global
-- Esto debe cambiar a único por organización
-- ====================================================
-- TABLA: categories
-- Eliminar constraint UNIQUE(name) y crear UNIQUE(name, organization_id)
DO $$ BEGIN -- Eliminar constraint existente si existe
IF EXISTS (
  SELECT 1
  FROM pg_constraint
  WHERE conname = 'categories_name_key'
) THEN
ALTER TABLE categories DROP CONSTRAINT categories_name_key;
RAISE NOTICE '✓ Constraint categories_name_key eliminado';
END IF;
-- Crear nuevo constraint multi-tenant
IF NOT EXISTS (
  SELECT 1
  FROM pg_constraint
  WHERE conname = 'categories_name_organization_key'
) THEN
ALTER TABLE categories
ADD CONSTRAINT categories_name_organization_key UNIQUE (name, organization_id);
RAISE NOTICE '✓ Constraint categories_name_organization_key creado';
END IF;
END $$;
-- ====================================================
-- TABLA: spare_parts (si tiene constraint UNIQUE en nombre)
-- ====================================================
-- Verificar si spare_parts tiene constraint en nombre (generalmente no)
-- Si existe, también hacerlo multi-tenant
DO $$ BEGIN IF EXISTS (
  SELECT 1
  FROM pg_constraint
  WHERE conname = 'spare_parts_name_key'
) THEN
ALTER TABLE spare_parts DROP CONSTRAINT spare_parts_name_key;
ALTER TABLE spare_parts
ADD CONSTRAINT spare_parts_name_organization_key UNIQUE (name, organization_id);
RAISE NOTICE '✓ Constraint spare_parts_name_organization_key creado';
END IF;
END $$;
-- ====================================================
-- TABLA: suppliers (si tiene constraint UNIQUE en nombre)
-- ====================================================
DO $$ BEGIN IF EXISTS (
  SELECT 1
  FROM pg_constraint
  WHERE conname = 'suppliers_name_key'
) THEN
ALTER TABLE suppliers DROP CONSTRAINT suppliers_name_key;
ALTER TABLE suppliers
ADD CONSTRAINT suppliers_name_organization_key UNIQUE (name, organization_id);
RAISE NOTICE '✓ Constraint suppliers_name_organization_key creado';
END IF;
END $$;
-- ====================================================
-- TABLA: equipments (UNIQUE en code - debe ser multi-tenant)
-- ====================================================
DO $$ BEGIN -- El código de equipo debe ser único por organización, no globalmente
IF EXISTS (
  SELECT 1
  FROM pg_constraint
  WHERE conname = 'equipments_code_key'
) THEN
ALTER TABLE equipments DROP CONSTRAINT equipments_code_key;
RAISE NOTICE '✓ Constraint equipments_code_key eliminado';
END IF;
IF NOT EXISTS (
  SELECT 1
  FROM pg_constraint
  WHERE conname = 'equipments_code_organization_key'
) THEN
ALTER TABLE equipments
ADD CONSTRAINT equipments_code_organization_key UNIQUE (code, organization_id);
RAISE NOTICE '✓ Constraint equipments_code_organization_key creado';
END IF;
END $$;
-- ====================================================
-- Verificación final
-- ====================================================
DO $$
DECLARE constraint_count INTEGER;
BEGIN -- Contar constraints multi-tenant creados
SELECT COUNT(*) INTO constraint_count
FROM pg_constraint
WHERE conname LIKE '%_organization_key';
RAISE NOTICE '════════════════════════════════════════════';
RAISE NOTICE '✅ Migración 007 completada';
RAISE NOTICE '📊 Constraints multi-tenant: %',
constraint_count;
RAISE NOTICE 'Las organizaciones ahora pueden tener nombres duplicados en:';
RAISE NOTICE '  - Categorías';
RAISE NOTICE '  - Repuestos';
RAISE NOTICE '  - Proveedores';
RAISE NOTICE '  - Códigos de equipos';
RAISE NOTICE '════════════════════════════════════════════';
END $$;
SELECT 'Migración 007 completada: constraints multi-tenant creados' AS status;