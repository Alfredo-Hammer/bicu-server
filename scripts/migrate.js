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
];

/**
 * Ejecuta un archivo SQL
 */
async function executeSQLFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️  Archivo no encontrado: ${filePath} - Omitiendo...`);
    return false;
  }

  const sql = fs.readFileSync(fullPath, 'utf8');

  try {
    console.log(`📄 Ejecutando: ${filePath}...`);
    await client.query(sql);
    console.log(`✅ Completado: ${filePath}`);
    return true;
  } catch (error) {
    // Errores que son seguros ignorar (operaciones idempotentes)
    const safeErrors = [
      'already exists',
      'duplicate key',
      'violates unique constraint',
      'constraint already exists'
    ];

    const isSafeError = safeErrors.some(msg =>
      error.message.toLowerCase().includes(msg.toLowerCase())
    );

    if (isSafeError) {
      console.log(`⚠️  Ya existe (omitiendo): ${filePath}`);
      return true;
    }

    console.error(`❌ Error en ${filePath}:`, error.message);
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
  console.log('═══════════════════════════════════════════════════════');
  console.log('🚀 INICIANDO MIGRACIÓN DE BASE DE DATOS');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📌 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📌 Base de datos: ${process.env.DB_NAME || 'PostgreSQL (DATABASE_URL)'}`);
  console.log('');

  try {
    // Conectar a la base de datos
    console.log('🔌 Conectando a PostgreSQL...');
    await client.connect();
    console.log('✅ Conexión establecida\n');

    // Verificar si ya hay tablas
    const tablesExist = await checkTablesExist();

    if (tablesExist) {
      console.log('⚠️  Las tablas principales ya existen.');
      console.log('⚠️  Ejecutando solo migraciones incrementales...\n');

      // Solo ejecutar las migraciones nuevas
      const migrationScripts = SQL_SCRIPTS.filter(script => script.includes('migrations/'));

      for (const script of migrationScripts) {
        await executeSQLFile(script);
      }
    } else {
      console.log('📦 Base de datos vacía. Ejecutando todas las migraciones...\n');

      // Ejecutar todos los scripts
      for (const script of SQL_SCRIPTS) {
        await executeSQLFile(script);
      }
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════');

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
