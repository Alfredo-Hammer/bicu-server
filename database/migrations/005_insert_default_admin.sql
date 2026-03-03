-- ====================================================
-- MIGRACIÓN: Insertar usuario administrador por defecto
-- ====================================================
-- Fecha: 2026-03-02
-- Descripción: Inserta el usuario admin para la organización por defecto BICU-BLF
-- Se ejecuta DESPUÉS de crear la tabla organizations (001_multi_tenant.sql)
-- ====================================================
-- Insertar usuario administrador por defecto para BICU-BLF
-- Password: admin123 (CAMBIAR INMEDIATAMENTE EN PRODUCCIÓN!)
-- Hash generado con bcrypt, salt rounds: 10
INSERT INTO users (
    name,
    email,
    password_hash,
    role,
    organization_id
  )
SELECT 'Administrador',
  'admin@bicu.edu.ni',
  '$2b$10$v0p.xiFAvbONfTbpJRTUneK0rlE3zbvRGdMbk6yjI7HBD7z4TzZna',
  'admin',
  org.id
FROM organizations org
WHERE org.code = 'BICU-BLF' ON CONFLICT (email) DO UPDATE
  SET password_hash = EXCLUDED.password_hash,
      organization_id = EXCLUDED.organization_id;
-- Verificación
DO $$
DECLARE user_count INTEGER;
BEGIN
SELECT COUNT(*) INTO user_count
FROM users
WHERE email = 'admin@bicu.edu.ni';
IF user_count > 0 THEN RAISE NOTICE '✓ Usuario admin@bicu.edu.ni creado/verificado exitosamente';
ELSE RAISE WARNING '⚠ No se pudo crear el usuario admin (organización BICU-BLF no existe)';
END IF;
END $$;
SELECT 'Migración 005 completada: usuario admin insertado' AS status;