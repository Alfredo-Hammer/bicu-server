/**
 * ============================================
 * SCRIPT PARA LIMPIAR LA BASE DE DATOS
 * ============================================
 * Este script elimina TODOS los datos pero mantiene:
 * ✅ La estructura de tablas
 * ✅ La organización BICU-BLF
 * ✅ El usuario administrador (admin@bicu.edu.ni / admin123)
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
    console.log('⚠️  ADVERTENCIA: Esta acción eliminará TODOS los datos');
    console.log('⏳ Espera 3 segundos para cancelar (Ctrl+C)...\n');

    // Esperar 3 segundos para dar chance de cancelar
    await new Promise(resolve => setTimeout(resolve, 3000));

    await client.query('BEGIN');

    // 1. LIMPIAR AUDITORÍA
    await client.query('TRUNCATE TABLE audit_logs RESTART IDENTITY CASCADE');
    console.log('✅ Auditoría limpiada');

    // 2. LIMPIAR DETALLES DE SALIDAS
    await client.query('TRUNCATE TABLE output_details RESTART IDENTITY CASCADE');
    console.log('✅ Detalles de salidas eliminados');

    // 3. LIMPIAR SALIDAS
    await client.query('TRUNCATE TABLE outputs RESTART IDENTITY CASCADE');
    console.log('✅ Salidas eliminadas');

    // 4. LIMPIAR DETALLES DE ENTRADAS
    await client.query('TRUNCATE TABLE entry_details RESTART IDENTITY CASCADE');
    console.log('✅ Detalles de entradas eliminados');

    // 5. LIMPIAR ENTRADAS
    await client.query('TRUNCATE TABLE entries RESTART IDENTITY CASCADE');
    console.log('✅ Entradas eliminadas');

    // 6. LIMPIAR REPUESTOS
    await client.query('DELETE FROM spare_parts WHERE active = true');
    console.log('✅ Repuestos eliminados');

    // 7. LIMPIAR EQUIPOS
    await client.query('DELETE FROM equipments WHERE active = true');
    console.log('✅ Equipos eliminados');

    // 8. LIMPIAR PROVEEDORES
    await client.query('DELETE FROM suppliers WHERE active = true');
    console.log('✅ Proveedores eliminados');

    // 9. LIMPIAR CATEGORÍAS
    await client.query('DELETE FROM categories WHERE active = true');
    console.log('✅ Categorías eliminadas');

    // 10. LIMPIAR USUARIOS (excepto admin)
    const usersDeleted = await client.query(
      `DELETE FROM users 
       WHERE email != 'admin@bicu.edu.ni' AND active = true
       RETURNING id, name, email`
    );
    console.log(`✅ Usuarios eliminados: ${usersDeleted.rowCount} (excepto admin)`);

    // 11. RESETEAR ADMIN
    await client.query(
      `UPDATE users 
       SET password_hash = '$2b$10$v0p.xiFAvbONfTbpJRTUneK0rlE3zbvRGdMbk6yjI7HBD7z4TzZna',
           profile_image = NULL,
           apellido = NULL,
           movil = NULL,
           cedula = NULL,
           profesion = NULL,
           direccion = NULL
       WHERE email = 'admin@bicu.edu.ni'`
    );
    console.log('✅ Usuario admin reseteado (password: admin123)');

    // 12. LIMPIAR CONFIGURACIÓN DE ORGANIZACIÓN
    await client.query(
      `UPDATE organizations
       SET logo_url = NULL,
           phone = NULL,
           email = NULL,
           address = NULL,
           website = NULL
       WHERE code = 'BICU-BLF'`
    );
    console.log('✅ Configuración de organización limpiada');

    // 13. RESETEAR SECUENCIAS
    await client.query('ALTER SEQUENCE audit_logs_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE output_details_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE outputs_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE entry_details_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE entries_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE spare_parts_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE equipments_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE suppliers_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE categories_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 2'); // Mantiene ID 1 para admin
    console.log('✅ Secuencias de IDs reseteadas\n');

    await client.query('COMMIT');

    // VERIFICAR ESTADO FINAL
    console.log('📊 ESTADO FINAL DE LA BASE DE DATOS:\n');

    const verification = await client.query(`
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
      ORDER BY tabla
    `);

    console.table(verification.rows);

    console.log('\n========================================');
    console.log('✅ BASE DE DATOS LIMPIADA EXITOSAMENTE');
    console.log('========================================\n');
    console.log('🔐 CREDENCIALES DE ACCESO:\n');
    console.log('   📧 Email:    admin@bicu.edu.ni');
    console.log('   🔑 Password: admin123\n');
    console.log('📋 La base de datos está lista para pruebas desde cero\n');
    console.log('💡 SIGUIENTE PASO:');
    console.log('   1. Inicia sesión con las credenciales de arriba');
    console.log('   2. Configura la institución en /configuracion');
    console.log('   3. Crea categorías, proveedores y repuestos');
    console.log('   4. Comienza a usar el sistema\n');

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
