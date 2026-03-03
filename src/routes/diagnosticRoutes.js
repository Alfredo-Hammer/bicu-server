const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * ENDPOINT TEMPORAL DE DIAGNÓSTICO
 * Para verificar el estado de la base de datos en Render
 * 
 * ELIMINAR DESPUÉS DE DEBUGGING
 */

router.get('/db-schema', async (req, res) => {
  try {
    const diagnostics = {};

    // 1. Listar todas las tablas
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    diagnostics.tables = tablesResult.rows.map(r => r.table_name);

    // 2. Verificar columnas de users
    const usersColumns = await db.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    diagnostics.users_columns = usersColumns.rows;

    // 3. Verificar columnas de categories
    const categoriesColumns = await db.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'categories' 
      ORDER BY ordinal_position;
    `);
    diagnostics.categories_columns = categoriesColumns.rows;

    // 4. Verificar columnas de spare_parts
    const sparePartsColumns = await db.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'spare_parts' 
      ORDER BY ordinal_position;
    `);
    diagnostics.spare_parts_columns = sparePartsColumns.rows;

    // 5. Verificar tabla organizations
    const orgsExist = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'organizations'
      );
    `);

    if (orgsExist.rows[0].exists) {
      const orgsData = await db.query('SELECT id, name, code FROM organizations;');
      diagnostics.organizations = orgsData.rows;
    } else {
      diagnostics.organizations = null;
    }

    // 6. Verificar usuario admin
    const adminResult = await db.query(`
      SELECT id, name, email, role, organization_id, active 
      FROM users 
      WHERE email = 'admin@bicu.edu.ni';
    `);
    diagnostics.admin_user = adminResult.rows[0] || null;

    // 7. Contar registros
    const counts = {};
    for (const table of diagnostics.tables) {
      try {
        const countResult = await db.query(`SELECT COUNT(*) as count FROM ${table};`);
        counts[table] = parseInt(countResult.rows[0].count);
      } catch (error) {
        counts[table] = 'ERROR: ' + error.message;
      }
    }
    diagnostics.record_counts = counts;

    // 8. Verificar índices
    const indexesResult = await db.query(`
      SELECT tablename, indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      ORDER BY tablename, indexname;
    `);
    diagnostics.indexes = indexesResult.rows;

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: process.env.DB_NAME || 'PostgreSQL',
      diagnostics
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

/**
 * Endpoint para ejecutar migraciones manualmente
 */
router.post('/run-migrations', async (req, res) => {
  try {
    const { migrate } = require('../../scripts/migrate');

    // Ejecutar en background
    migrate()
      .then(() => {
        console.log('✅ Migraciones completadas en background');
      })
      .catch(err => {
        console.error('❌ Error en migraciones:', err);
      });

    return res.status(200).json({
      success: true,
      message: 'Migraciones iniciadas en background. Revisa los logs del servidor.'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Endpoint para verificar columna organization_id en tabla específica
 */
router.get('/check-column/:table/:column', async (req, res) => {
  try {
    const { table, column } = req.params;

    const result = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
      );
    `, [table, column]);

    const exists = result.rows[0].exists;

    return res.status(200).json({
      success: true,
      table,
      column,
      exists,
      message: exists
        ? `✅ Columna ${column} existe en tabla ${table}`
        : `❌ Columna ${column} NO EXISTE en tabla ${table}`
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
