#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Script de migración automática para PostgreSQL en Render
 * Ejecuta todos los scripts SQL en orden
 */

// Configuración de conexión
const connectionString = process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const client = new Client({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Scripts SQL en orden de ejecución
const SQL_SCRIPTS = [
  'database/init.sql',
  'database/support_entities.sql',
  'database/inventory.sql',
  'database/movements.sql',
  'database/audit.sql',
  'database/settings.sql',
  'database/migrations/001_multi_tenant.sql',
  'database/migrations/002_add_equipment_image.sql',
  'database/migrations/003_add_equipment_repairs.sql',
  'database/migrations/004_add_user_profile_image.sql',
  'database/migrations/005_insert_default_admin.sql',
  'database/migrations/006_add_user_extended_fields.sql',
  'database/migrations/007_fix_unique_constraints_multi_tenant.sql',
];

/**
 * Ejecuta un archivo SQL con logs detallados
 */
async function executeSQLFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️  Archivo no encontrado: ${filePath} - Omitiendo...`);
    return false;
  }

  const sql = fs.readFileSync(fullPath, 'utf8');
  const fileName = path.basename(filePath);

  try {
    console.log(`\n📄 Ejecutando: ${filePath}`);
    console.log(`   Tamaño: ${(sql.length / 1024).toFixed(2)} KB`);

    const startTime = Date.now();
    await client.query(sql);
    const duration = Date.now() - startTime;

    console.log(`✅ Completado: ${fileName} (${duration}ms)`);

    // Log de tablas creadas/actualizadas
    const tableMatches = sql.match(/CREATE TABLE (IF NOT EXISTS )?([\w_]+)/gi);
    if (tableMatches && tableMatches.length > 0) {
      console.log(`   Tablas procesadas: ${tableMatches.length}`);
      tableMatches.forEach(match => {
        const tableName = match.replace(/CREATE TABLE (IF NOT EXISTS )?/i, '').trim();
        console.log(`   ✓ ${tableName}`);
      });
    }

    return true;
  } catch (error) {
    // Errores que son seguros ignorar (operaciones idempotentes)
    const safeErrors = [
      'already exists',
      'duplicate key',
      'violates unique constraint',
      'constraint already exists',
      'relation already exists'
    ];

    const isSafeError = safeErrors.some(msg =>
      error.message.toLowerCase().includes(msg.toLowerCase())
    );

    if (isSafeError) {
      console.log(`⚠️  Elementos ya existen en ${fileName} - Continuando...`);
      return true;
    }

    console.error(`\n❌ ERROR CRÍTICO en ${filePath}:`);
    console.error(`   Mensaje: ${error.message}`);
    console.error(`   Código: ${error.code}`);
    throw error;
  }
}

/**
 * Verifica si las tablas ya existen
 */
async function checkTablesExist() {
  try {
    const result = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'organizations', 'spare_parts')
    `);
    return parseInt(result.rows[0].count) > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Función principal
 */
async function migrate() {
  const startTime = Date.now();
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🚀 INICIANDO MIGRACIÓN DE BASE DE DATOS - RENDER FREE TIER');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📌 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📌 Base de datos: ${process.env.DB_NAME || 'PostgreSQL (DATABASE_URL)'}`);
  console.log(`📌 Timestamp: ${new Date().toISOString()}`);
  console.log(`📌 Scripts a ejecutar: ${SQL_SCRIPTS.length}`);
  console.log('');

  try {
    // Conectar a la base de datos
    console.log('🔌 Conectando a PostgreSQL...');
    await client.connect();
    console.log('✅ Conexión establecida\n');

    // Verificar si hay tablas (solo para logging)
    const tablesExist = await checkTablesExist();

    if (tablesExist) {
      console.log('ℹ️  Tablas detectadas. Ejecutando migraciones de forma idempotente...\n');
    } else {
      console.log('📦 Base de datos vacía. Creando estructura completa...\n');
    }

    // SIEMPRE ejecutar TODOS los scripts (son idempotentes)
    // Esto garantiza que todas las tablas existan antes de las migraciones
    for (const script of SQL_SCRIPTS) {
      await executeSQLFile(script);
    }

    const totalTime = Date.now() - startTime;

    // Verificar tablas creadas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`⏱️  Tiempo total: ${(totalTime / 1000).toFixed(2)}s`);
    console.log(`📊 Tablas en base de datos: ${tablesResult.rows.length}`);
    console.log('\n📋 Tablas disponibles:');
    tablesResult.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });
    console.log('\n🎉 Base de datos lista para usar!');
    console.log('═══════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════');
    console.error('❌ ERROR EN LA MIGRACIÓN');
    console.error('═══════════════════════════════════════════════════════');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('═══════════════════════════════════════════════════════');

    process.exit(1);
  } finally {
    await client.end();
  }
}

// Ejecutar migración si se ejecuta directamente
if (require.main === module) {
  migrate();
}

module.exports = { migrate };
