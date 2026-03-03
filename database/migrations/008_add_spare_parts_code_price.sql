-- ====================================================
-- MIGRACIÓN: Agregar columnas code y price a spare_parts
-- ====================================================
-- Fecha: 2026-03-03
-- Descripción: Agrega columnas faltantes que el modelo SparePartModel está intentando usar
-- ====================================================
-- Agregar columna code (código/SKU del repuesto)
DO $$ BEGIN IF NOT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_name = 'spare_parts'
    AND column_name = 'code'
) THEN
ALTER TABLE spare_parts
ADD COLUMN code VARCHAR(50);
RAISE NOTICE '✓ Columna code agregada a spare_parts';
ELSE RAISE NOTICE 'ℹ️  Columna code ya existe en spare_parts';
END IF;
END $$;
-- Agregar columna price (precio del repuesto)
DO $$ BEGIN IF NOT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_name = 'spare_parts'
    AND column_name = 'price'
) THEN
ALTER TABLE spare_parts
ADD COLUMN price DECIMAL(10, 2);
RAISE NOTICE '✓ Columna price agregada a spare_parts';
ELSE RAISE NOTICE 'ℹ️  Columna price ya existe en spare_parts';
END IF;
END $$;
-- Crear índice para búsquedas por código (si no existe)
DO $$ BEGIN IF NOT EXISTS (
  SELECT 1
  FROM pg_indexes
  WHERE tablename = 'spare_parts'
    AND indexname = 'idx_spare_parts_code'
) THEN CREATE INDEX idx_spare_parts_code ON spare_parts(code);
RAISE NOTICE '✓ Índice idx_spare_parts_code creado';
ELSE RAISE NOTICE 'ℹ️  Índice idx_spare_parts_code ya existe';
END IF;
END $$;
-- Crear índice para búsquedas por precio (si no existe)
DO $$ BEGIN IF NOT EXISTS (
  SELECT 1
  FROM pg_indexes
  WHERE tablename = 'spare_parts'
    AND indexname = 'idx_spare_parts_price'
) THEN CREATE INDEX idx_spare_parts_price ON spare_parts(price);
RAISE NOTICE '✓ Índice idx_spare_parts_price creado';
ELSE RAISE NOTICE 'ℹ️  Índice idx_spare_parts_price ya existe';
END IF;
END $$;
-- Verificación final
DO $$
DECLARE code_exists BOOLEAN;
price_exists BOOLEAN;
BEGIN
SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'spare_parts'
      AND column_name = 'code'
  ) INTO code_exists;
SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'spare_parts'
      AND column_name = 'price'
  ) INTO price_exists;
RAISE NOTICE '════════════════════════════════════════════';
RAISE NOTICE '✅ Migración 008 completada';
RAISE NOTICE 'Columnas agregadas a spare_parts:';
RAISE NOTICE '  - code (VARCHAR 50): %',
CASE
  WHEN code_exists THEN '✓'
  ELSE '✗'
END;
RAISE NOTICE '  - price (DECIMAL 10,2): %',
CASE
  WHEN price_exists THEN '✓'
  ELSE '✗'
END;
RAISE NOTICE '════════════════════════════════════════════';
END $$;
SELECT 'Migración 008 completada: columnas code y price agregadas a spare_parts' AS status;