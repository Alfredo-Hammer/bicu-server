/**
 * Script para poblar datos de prueba en el sistema
 * Crea entradas y salidas de ejemplo para testing y demostración
 * 
 * Ejecutar: node seed-test-data.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seedTestData() {
  const client = await pool.connect();

  try {
    console.log('🌱 Iniciando población de datos de prueba...\n');

    // 1. Verificar organización
    const orgResult = await client.query(
      "SELECT id, name FROM organizations WHERE code = 'BICU-BLF' LIMIT 1"
    );

    if (orgResult.rows.length === 0) {
      console.error('❌ No se encontró la organización BICU-BLF');
      return;
    }

    const orgId = orgResult.rows[0].id;
    console.log(`✅ Organización: ${orgResult.rows[0].name} (ID: ${orgId})`);

    // 2. Verificar admin user
    const adminResult = await client.query(
      'SELECT id, name FROM users WHERE organization_id = $1 AND role = $2 LIMIT 1',
      [orgId, 'admin']
    );

    if (adminResult.rows.length === 0) {
      console.error('❌ No se encontró usuario administrador');
      return;
    }

    const adminId = adminResult.rows[0].id;
    console.log(`✅ Usuario Admin: ${adminResult.rows[0].name} (ID: ${adminId})\n`);

    // 3. Crear categoría
    const categoryResult = await client.query(
      `INSERT INTO categories (name, description, organization_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (name, organization_id) DO UPDATE 
       SET description = EXCLUDED.description
       RETURNING id, name`,
      ['Hardware', 'Componentes de hardware', orgId]
    );
    const categoryId = categoryResult.rows[0].id;
    console.log(`✅ Categoría: ${categoryResult.rows[0].name} (ID: ${categoryId})`);

    // 4. Crear proveedor
    const supplierResult = await client.query(
      `INSERT INTO suppliers (name, contact_name, phone, email, address, organization_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email, organization_id) DO UPDATE 
       SET name = EXCLUDED.name
       RETURNING id, name`,
      ['Proveedor Demo', 'Juan Pérez', '88887777', 'proveedor@demo.com', 'Managua', orgId]
    );
    const supplierId = supplierResult.rows[0].id;
    console.log(`✅ Proveedor: ${supplierResult.rows[0].name} (ID: ${supplierId})`);

    // 5. Crear repuesto
    const sparePartResult = await client.query(
      `INSERT INTO spare_parts (
        name, description, part_number, code, category_id, 
        stock, min_stock, max_stock, price, organization_id
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (part_number, organization_id) DO UPDATE 
       SET stock = 0, price = EXCLUDED.price
       RETURNING id, name, part_number`,
      [
        'Memoria RAM DDR4 8GB',
        'Memoria RAM 8GB DDR4 2666MHz',
        'RAM-DDR4-8GB-001',
        'MEM-001',
        categoryId,
        0,      // Stock inicial
        5,      // Min stock
        50,     // Max stock
        850.00, // Precio
        orgId
      ]
    );
    const sparePartId = sparePartResult.rows[0].id;
    console.log(`✅ Repuesto: ${sparePartResult.rows[0].name} (ID: ${sparePartId}, P/N: ${sparePartResult.rows[0].part_number})`);

    // 6. Crear equipo
    const equipmentResult = await client.query(
      `INSERT INTO equipments (
        code, type, brand, model, serial_number, 
        status, location, organization_id
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (code, organization_id) DO UPDATE 
       SET status = 'en_reparacion'
       RETURNING id, code, type`,
      [
        'PC-001',
        'Computadora de Escritorio',
        'Dell',
        'OptiPlex 3080',
        'SN123456789',
        'en_reparacion',
        'Oficina Principal',
        orgId
      ]
    );
    const equipmentId = equipmentResult.rows[0].id;
    console.log(`✅ Equipo: ${equipmentResult.rows[0].code} - ${equipmentResult.rows[0].type} (ID: ${equipmentId})\n`);

    // 7. Iniciar transacción para entrada
    await client.query('BEGIN');

    console.log('📥 Creando ENTRADA de inventario...');

    const entryResult = await client.query(
      `INSERT INTO entries (supplier_id, user_id, notes, organization_id, date)
       VALUES ($1, $2, $3, $4, CURRENT_DATE)
       RETURNING id, date`,
      [supplierId, adminId, 'Compra inicial de inventario', orgId]
    );
    const entryId = entryResult.rows[0].id;
    console.log(`   ✅ Entrada ID: ${entryId}, Fecha: ${entryResult.rows[0].date}`);

    // Detalle de entrada
    await client.query(
      `INSERT INTO entry_details (entry_id, spare_part_id, quantity, unit_price, organization_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [entryId, sparePartId, 20, 850.00, orgId]
    );
    console.log(`   ✅ Detalle: 20 unidades x C$ 850.00 = C$ 17,000.00`);

    // Actualizar stock
    await client.query(
      `UPDATE spare_parts SET stock = stock + $1 WHERE id = $2 AND organization_id = $3`,
      [20, sparePartId, orgId]
    );
    console.log(`   ✅ Stock actualizado: +20 unidades\n`);

    await client.query('COMMIT');

    // 8. Iniciar transacción para salida
    await client.query('BEGIN');

    console.log('📤 Creando SALIDA de inventario...');

    const outputResult = await client.query(
      `INSERT INTO outputs (technician_id, equipment_id, notes, organization_id, date)
       VALUES ($1, $2, $3, $4, CURRENT_DATE)
       RETURNING id, date`,
      [adminId, equipmentId, 'Reparación de equipo PC-001', orgId]
    );
    const outputId = outputResult.rows[0].id;
    console.log(`   ✅ Salida ID: ${outputId}, Fecha: ${outputResult.rows[0].date}`);

    // Detalle de salida
    await client.query(
      `INSERT INTO output_details (output_id, spare_part_id, quantity, organization_id)
       VALUES ($1, $2, $3, $4)`,
      [outputId, sparePartId, 2, orgId]
    );
    console.log(`   ✅ Detalle: 2 unidades utilizadas`);

    // Actualizar stock
    await client.query(
      `UPDATE spare_parts SET stock = stock - $1 WHERE id = $2 AND organization_id = $3`,
      [2, sparePartId, orgId]
    );
    console.log(`   ✅ Stock actualizado: -2 unidades\n`);

    await client.query('COMMIT');

    // 9. Verificar resultados
    console.log('📊 Verificando datos creados...\n');

    const verifyEntries = await client.query(
      'SELECT COUNT(*) as total FROM entries WHERE organization_id = $1 AND active = true',
      [orgId]
    );
    console.log(`   📥 Total Entradas: ${verifyEntries.rows[0].total}`);

    const verifyOutputs = await client.query(
      'SELECT COUNT(*) as total FROM outputs WHERE organization_id = $1 AND active = true',
      [orgId]
    );
    console.log(`   📤 Total Salidas: ${verifyOutputs.rows[0].total}`);

    const verifyStock = await client.query(
      'SELECT stock FROM spare_parts WHERE id = $1',
      [sparePartId]
    );
    console.log(`   📦 Stock Final (Memoria RAM): ${verifyStock.rows[0].stock} unidades`);

    console.log('\n✅ ¡Datos de prueba creados exitosamente!');
    console.log('\n💡 Puedes verificar en:');
    console.log('   - /reportes → Historial de Entradas');
    console.log('   - /reportes → Historial de Salidas');
    console.log('   - /repuestos → Ver stock actualizado\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar
seedTestData().catch(console.error);
