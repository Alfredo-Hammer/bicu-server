-- ====================================================
-- MIGRACIÓN: Agregar campos extendidos a users
-- ====================================================
-- Fecha: 2026-03-02
-- Descripción: Agrega campos adicionales de perfil de usuario
-- ====================================================
-- Agregar columnas extendidas si no existen
DO $$ BEGIN -- Apellido
IF NOT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_name = 'users'
    AND column_name = 'apellido'
) THEN
ALTER TABLE users
ADD COLUMN apellido VARCHAR(100);
RAISE NOTICE 'Columna apellido agregada';
END IF;
-- Móvil
IF NOT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_name = 'users'
    AND column_name = 'movil'
) THEN
ALTER TABLE users
ADD COLUMN movil VARCHAR(20);
RAISE NOTICE 'Columna movil agregada';
END IF;
-- Cédula
IF NOT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_name = 'users'
    AND column_name = 'cedula'
) THEN
ALTER TABLE users
ADD COLUMN cedula VARCHAR(20);
RAISE NOTICE 'Columna cedula agregada';
END IF;
-- Profesión
IF NOT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_name = 'users'
    AND column_name = 'profesion'
) THEN
ALTER TABLE users
ADD COLUMN profesion VARCHAR(100);
RAISE NOTICE 'Columna profesion agregada';
END IF;
-- Dirección
IF NOT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_name = 'users'
    AND column_name = 'direccion'
) THEN
ALTER TABLE users
ADD COLUMN direccion TEXT;
RAISE NOTICE 'Columna direccion agregada';
END IF;
-- Estado
IF NOT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_name = 'users'
    AND column_name = 'estado'
) THEN
ALTER TABLE users
ADD COLUMN estado VARCHAR(50);
RAISE NOTICE 'Columna estado agregada';
END IF;
END $$;
-- Crear índice en cedula para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_users_cedula ON users(cedula);
-- Verificación
SELECT 'Migración 006 completada: campos extendidos de usuario agregados' AS status;