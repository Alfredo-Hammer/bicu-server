const db = require('../config/db');
const messages = require('../utils/messages');

class AdminController {
  /**
   * Limpia COMPLETAMENTE la base de datos
   * Elimina TODO y NO recrea nada
   * La base de datos queda en CERO ABSOLUTO
   */
  static async cleanDatabase(req, res) {
    try {
      const client = await db.pool.connect();

      try {
        await client.query('BEGIN');

        console.log('🧹 LIMPIEZA TOTAL DE BASE DE DATOS...');
        console.log('⚠️  ELIMINANDO TODO SIN RECREAR NADA');
        console.log('');

        // TRUNCATE todas las tablas en orden correcto (respetando FK)
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
        console.log('✅ TODOS los usuarios eliminados');

        await client.query('TRUNCATE TABLE organizations RESTART IDENTITY CASCADE');
        console.log('✅ TODAS las organizaciones eliminadas');

        await client.query('COMMIT');

        // Verificar estado final (debe ser TODO en 0)
        const stats = await client.query(`
          SELECT 
            (SELECT COUNT(*) FROM organizations) as organizaciones,
            (SELECT COUNT(*) FROM users) as usuarios,
            (SELECT COUNT(*) FROM categories) as categorias,
            (SELECT COUNT(*) FROM suppliers) as proveedores,
            (SELECT COUNT(*) FROM spare_parts) as repuestos,
            (SELECT COUNT(*) FROM equipments) as equipos,
            (SELECT COUNT(*) FROM entries) as entradas,
            (SELECT COUNT(*) FROM outputs) as salidas,
            (SELECT COUNT(*) FROM audit_logs) as auditoria
        `);

        console.log('');
        console.log('========================================');
        console.log('✅ BASE DE DATOS EN CERO ABSOLUTO');
        console.log('========================================');
        console.log('');

        return res.status(200).json({
          success: true,
          message: '✅ Base de datos limpiada completamente. TODO eliminado. CERO ABSOLUTO.',
          data: {
            current_state: stats.rows[0],
            warning: '⚠️ TODA la base de datos fue eliminada. NO se recreó nada.',
            next_steps: [
              '1. Ejecuta las migraciones iniciales para recrear estructura básica:',
              '   - 005_insert_default_admin.sql (organización y admin)',
              '2. O usa el sistema de registro de organizaciones si está disponible',
              '3. O ejecuta manualmente los scripts SQL de inicialización',
            ],
            note: 'La base de datos está completamente vacía. Necesitas recrear la organización y usuario admin manualmente.',
          },
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Error al limpiar la base de datos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al limpiar la base de datos',
        error: error.message,
      });
    }
  }
}

module.exports = AdminController;
