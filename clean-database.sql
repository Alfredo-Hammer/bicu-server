-- ============================================
-- SCRIPT PARA LIMPIAR COMPLETAMENTE LA BASE DE DATOS
-- ============================================
-- ⚠️ ADVERTENCIA: Este script elimina TODO
-- ❌ Elimina TODAS las organizaciones
-- ❌ Elimina TODOS los usuarios
-- ❌ Elimina TODOS los datos
-- ❌ NO recrea NADA
-- 🔴 CERO ABSOLUTO
-- ============================================
BEGIN;
RAISE NOTICE '🧹 LIMPIEZA TOTAL DE BASE DE DATOS...';
RAISE NOTICE '⚠️  ELIMINANDO TODO SIN RECREAR NADA';
RAISE NOTICE '🔴 CERO ABSOLUTO';
RAISE NOTICE '';
-- TRUNCATE todas las tablas en orden correcto (respetando FK)
TRUNCATE TABLE audit_logs RESTART IDENTITY CASCADE;
RAISE NOTICE '✅ Auditoría eliminada';
TRUNCATE TABLE output_details RESTART IDENTITY CASCADE;
RAISE NOTICE '✅ Detalles de salidas eliminados';
TRUNCATE TABLE outputs RESTART IDENTITY CASCADE;
RAISE NOTICE '✅ Salidas eliminadas';
TRUNCATE TABLE entry_details RESTART IDENTITY CASCADE;
RAISE NOTICE '✅ Detalles de entradas eliminados';
TRUNCATE TABLE entries RESTART IDENTITY CASCADE;
RAISE NOTICE '✅ Entradas eliminadas';
TRUNCATE TABLE spare_parts RESTART IDENTITY CASCADE;
RAISE NOTICE '✅ Repuestos eliminados';
TRUNCATE TABLE equipments RESTART IDENTITY CASCADE;
RAISE NOTICE '✅ Equipos eliminados';
TRUNCATE TABLE suppliers RESTART IDENTITY CASCADE;
RAISE NOTICE '✅ Proveedores eliminados';
TRUNCATE TABLE categories RESTART IDENTITY CASCADE;
RAISE NOTICE '✅ Categorías eliminadas';
TRUNCATE TABLE users RESTART IDENTITY CASCADE;
RAISE NOTICE '✅ TODOS los usuarios eliminados';
TRUNCATE TABLE organizations RESTART IDENTITY CASCADE;
RAISE NOTICE '✅ TODAS las organizaciones eliminadas';
RAISE NOTICE '';
COMMIT;
-- VERIFICAR ESTADO FINAL (TODO debe estar en 0)
RAISE NOTICE '📊 Verificando estado final...';
RAISE NOTICE '';
SELECT 'ORGANIZACIONES' as tabla,
  COUNT(*) as registros
FROM organizations
UNION ALL
SELECT 'USUARIOS' as tabla,
  COUNT(*) as registros
FROM users
UNION ALL
SELECT 'CATEGORÍAS' as tabla,
  COUNT(*) as registros
FROM categories
UNION ALL
SELECT 'PROVEEDORES' as tabla,
  COUNT(*) as registros
FROM suppliers
UNION ALL
SELECT 'REPUESTOS' as tabla,
  COUNT(*) as registros
FROM spare_parts
UNION ALL
SELECT 'EQUIPOS' as tabla,
  COUNT(*) as registros
FROM equipments
UNION ALL
SELECT 'ENTRADAS' as tabla,
  COUNT(*) as registros
FROM entries
UNION ALL
SELECT 'SALIDAS' as tabla,
  COUNT(*) as registros
FROM outputs
UNION ALL
SELECT 'AUDITORÍA' as tabla,
  COUNT(*) as registros
FROM audit_logs
ORDER BY tabla;
RAISE NOTICE '========================================';
RAISE NOTICE '✅ BASE DE DATOS EN CERO ABSOLUTO';
RAISE NOTICE '========================================';
RAISE NOTICE '';
RAISE NOTICE '⚠️  TODO fue eliminado. NO se recreó NADA.';
RAISE NOTICE '';
RAISE NOTICE '📋 Pasos siguientes:';
RAISE NOTICE '   1. Ejecuta las migraciones iniciales:';
RAISE NOTICE '      - 005_insert_default_admin.sql';
RAISE NOTICE '   2. O crea manualmente la organización y admin';
RAISE NOTICE '';