/**
 * ============================================
 * SCRIPT PARA LIMPIAR LA BASE DE DATOS
 * ============================================
 * 🔴 CERO ABSOLUTO - Este script elimina TODO:
 * ❌ TODAS las organizaciones
 * ❌ TODOS los usuarios (incluyendo admin)
 * ❌ TODOS los datos
 * 
 * ⚠️ NO SE RECREA NADA
 * 
 * Mantiene solo:
 * ✅ La estructura de tablas
 * ✅ Relaciones y constraints
 * ✅ Secuencias reiniciadas a 1
 * ============================================
 * 
 * EJECUCIÓN:
 * - Local: node clean-database.js
 * - Render Shell: node clean-database.js
 * 
 * ADVERTENCIA: Esta acción NO se puede deshacer
 * ============================================
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function cleanDatabase() {
  const client = await pool.connect();

  try {
    console.log('\n🧹 INICIANDO LIMPIEZA DE BASE DE DATOS...\n');
    console.log('🔴 ADVERTENCIA: Esta acción eliminará TODO ABSOLUTAMENTE');
    console.log('❌ NO se recreará organización ni admin');
    console.log('⏳ Espera 3 segundos para cancelar (Ctrl+C)...\n');

    // Esperar 3 segundos para dar chance de cancelar
    await new Promise(resolve => setTimeout(resolve, 3000));

    await client.query('BEGIN');

    // TRUNCATE ALL - CERO ABSOLUTO
    console.log('💥 Eliminando TODO...\n');

    await client.query('TRUNCATE TABLE audit_logs RESTART IDENTITY CASCADE');
    console.log('✅ Auditoría eliminada');

    await client.query('TRUNCATE TABLE output_details RESTART IDENTITY CASCADE');
    console.log('✅ Detalles de salidas eliminados');

    await client.query('TRUNCATE TABLE outputs RESTART IDENTITY CASCADE');
    console.log('✅ Salidas eliminadas');

    await client.query('TRUNCATE TABLE entry_details RESTART IDENTITY CASCADE');
    console.log('✅ Detalles de entradas eliminados');

    await client.query('TRUNCATE TABLE entries RESTART IDENTITY CASCADE');
    console.log('✅ Entradas eliminadas');

    await client.query('TRUNCATE TABLE spare_parts RESTART IDENTITY CASCADE');
    console.log('✅ Repuestos eliminados');

    await client.query('TRUNCATE TABLE equipments RESTART IDENTITY CASCADE');
    console.log('✅ Equipos eliminados');

    await client.query('TRUNCATE TABLE suppliers RESTART IDENTITY CASCADE');
    console.log('✅ Proveedores eliminados');

    await client.query('TRUNCATE TABLE categories RESTART IDENTITY CASCADE');
    console.log('✅ Categorías eliminadas');

    await client.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
    console.log('✅ TODOS los usuarios eliminados (incluyendo admin)');

    await client.query('TRUNCATE TABLE organizations RESTART IDENTITY CASCADE');
    console.log('✅ TODAS las organizaciones eliminadas');

    await client.query('COMMIT');

    // VERIFICAR ESTADO FINAL - TODO DEBERÍA ESTAR EN CERO
    console.log('\n📊 ESTADO FINAL DE LA BASE DE DATOS:\n');

    const verification = await client.query(`
      SELECT 
        'ORGANIZACIONES' as tabla,
        COUNT(*) as registros
      FROM organizations
      UNION ALL
      SELECT 
        'USUARIOS' as tabla,
        COUNT(*) as registros
      FROM users
      UNION ALL
      SELECT 
        'CATEGORÍAS' as tabla,
        COUNT(*) as registros
      FROM categories
      UNION ALL
      SELECT 
        'PROVEEDORES' as tabla,
        COUNT(*) as registros
      FROM suppliers
      UNION ALL
      SELECT 
        'REPUESTOS' as tabla,
        COUNT(*) as registros
      FROM spare_parts
      UNION ALL
      SELECT 
        'EQUIPOS' as tabla,
        COUNT(*) as registros
      FROM equipments
      UNION ALL
      SELECT 
        'ENTRADAS' as tabla,
        COUNT(*) as registros
      FROM entries
      UNION ALL
      SELECT 
        'SALIDAS' as tabla,
        COUNT(*) as registros
      FROM outputs
      UNION ALL
      SELECT 
        'AUDITORÍA' as tabla,
        COUNT(*) as registros
      FROM audit_logs
      ORDER BY tabla
    `);

    console.table(verification.rows);

    console.log('\n========================================');
    console.log('✅ BASE DE DATOS LIMPIADA - CERO ABSOLUTO');
    console.log('========================================\n');
    console.log('🔴 ADVERTENCIA: TODO ha sido eliminado\n');
    console.log('📋 Estado actual:');
    console.log('   ❌ Organizaciones: 0');
    console.log('   ❌ Usuarios: 0 (incluyendo admin)');
    console.log('   ❌ Datos: 0\n');
    console.log('💡 SIGUIENTE PASO:');
    console.log('   1. Ejecuta las migraciones para recrear org + admin');
    console.log('   2. O ejecuta manualmente SQL para crear organización y usuario');
    console.log('   3. O usa el endpoint /api/organizations/register\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ ERROR AL LIMPIAR LA BASE DE DATOS:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar
cleanDatabase().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
