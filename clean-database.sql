-- ============================================
-- SCRIPT PARA LIMPIAR LA BASE DE DATOS
-- ============================================
-- Este script elimina TODOS los datos pero mantiene:
-- ✅ La estructura de tablas
-- ✅ La organización BICU-BLF
-- ✅ El usuario administrador
-- ============================================

BEGIN;

-- 1. ELIMINAR DATOS DE AUDITORÍA
TRUNCATE TABLE audit_logs RESTART IDENTITY CASCADE;
RAISE NOTICE '✅ Auditoría limpiada';

-- 2. ELIMINAR DETALLES DE SALIDAS (dependen de outputs)
TRUNCATE TABLE output_details RESTART IDENTITY CASCADE;
RAISE NOTICE '✅ Detalles de salidas eliminados';

-- 3. ELIMINAR SALIDAS
TRUNCATE TABLE outputs RESTART IDENTITY CASCADE;
RAISE NOTICE '✅ Salidas eliminadas';

-- 4. ELIMINAR DETALLES DE ENTRADAS (dependen de entries)
TRUNCATE TABLE entry_details RESTART IDENTITY CASCADE;
RAISE NOTICE '✅ Detalles de entradas eliminados';

-- 5. ELIMINAR ENTRADAS
TRUNCATE TABLE entries RESTART IDENTITY CASCADE;
RAISE NOTICE '✅ Entradas eliminadas';

-- 6. ELIMINAR REPUESTOS
DELETE FROM spare_parts WHERE active = true;
RAISE NOTICE '✅ Repuestos eliminados';

-- 7. ELIMINAR EQUIPOS
DELETE FROM equipments WHERE active = true;
RAISE NOTICE '✅ Equipos eliminados';

-- 8. ELIMINAR PROVEEDORES
DELETE FROM suppliers WHERE active = true;
RAISE NOTICE '✅ Proveedores eliminados';

-- 9. ELIMINAR CATEGORÍAS
DELETE FROM categories WHERE active = true;
RAISE NOTICE '✅ Categorías eliminadas';

-- 10. ELIMINAR USUARIOS (excepto admin)
DELETE FROM users 
WHERE email != 'admin@bicu.edu.ni' 
  AND active = true;
RAISE NOTICE '✅ Usuarios eliminados (excepto admin)';

-- 11. RESETEAR CONTRASEÑA DEL ADMIN (admin123)
UPDATE users 
SET password_hash = '$2b$10$v0p.xiFAvbONfTbpJRTUneK0rlE3zbvRGdMbk6yjI7HBD7z4TzZna',
    profile_image = NULL,
    apellido = NULL,
    movil = NULL,
    cedula = NULL,
    profesion = NULL,
    direccion = NULL
WHERE email = 'admin@bicu.edu.ni';
RAISE NOTICE '✅ Admin reseteado (password: admin123)';

-- 12. LIMPIAR CONFIGURACIÓN DE ORGANIZACIÓN
UPDATE organizations
SET logo_url = NULL,
    phone = NULL,
    email = NULL,
    address = NULL,
    website = NULL
WHERE code = 'BICU-BLF';
RAISE NOTICE '✅ Configuración de organización limpiada';

-- 13. RESETEAR SECUENCIAS (AUTO INCREMENT)
ALTER SEQUENCE audit_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE output_details_id_seq RESTART WITH 1;
ALTER SEQUENCE outputs_id_seq RESTART WITH 1;
ALTER SEQUENCE entry_details_id_seq RESTART WITH 1;
ALTER SEQUENCE entries_id_seq RESTART WITH 1;
ALTER SEQUENCE spare_parts_id_seq RESTART WITH 1;
ALTER SEQUENCE equipments_id_seq RESTART WITH 1;
ALTER SEQUENCE suppliers_id_seq RESTART WITH 1;
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 2; -- Mantiene ID 1 para admin
RAISE NOTICE '✅ Secuencias reseteadas';

COMMIT;

-- VERIFICAR ESTADO FINAL
SELECT 
  'CATEGORÍAS' as tabla,
  COUNT(*) as registros
FROM categories WHERE active = true
UNION ALL
SELECT 
  'PROVEEDORES' as tabla,
  COUNT(*) as registros
FROM suppliers WHERE active = true
UNION ALL
SELECT 
  'REPUESTOS' as tabla,
  COUNT(*) as registros
FROM spare_parts WHERE active = true
UNION ALL
SELECT 
  'EQUIPOS' as tabla,
  COUNT(*) as registros
FROM equipments WHERE active = true
UNION ALL
SELECT 
  'USUARIOS' as tabla,
  COUNT(*) as registros
FROM users WHERE active = true
UNION ALL
SELECT 
  'ENTRADAS' as tabla,
  COUNT(*) as registros
FROM entries WHERE active = true
UNION ALL
SELECT 
  'SALIDAS' as tabla,
  COUNT(*) as registros
FROM outputs WHERE active = true
UNION ALL
SELECT 
  'AUDITORÍA' as tabla,
  COUNT(*) as registros
FROM audit_logs
ORDER BY tabla;

-- MOSTRAR CREDENCIALES
SELECT 
  '🔐 CREDENCIALES DE ACCESO' as info,
  '' as email,
  '' as password
UNION ALL
SELECT 
  '📧 Email:' as info,
  email,
  '' as password
FROM users WHERE email = 'admin@bicu.edu.ni'
UNION ALL
SELECT 
  '🔑 Password:' as info,
  'admin123' as email,
  '' as password;

RAISE NOTICE '';
RAISE NOTICE '========================================';
RAISE NOTICE '✅ BASE DE DATOS LIMPIADA EXITOSAMENTE';
RAISE NOTICE '========================================';
RAISE NOTICE '';
RAISE NOTICE '🔐 CREDENCIALES DE ACCESO:';
RAISE NOTICE '   Email: admin@bicu.edu.ni';
RAISE NOTICE '   Password: admin123';
RAISE NOTICE '';
RAISE NOTICE '📋 La base de datos está lista para pruebas desde cero';
RAISE NOTICE '';
