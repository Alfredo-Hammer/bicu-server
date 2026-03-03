const { pool } = require('../src/config/db');

async function checkDatabaseSchema() {
  try {
    console.log('📊 DIAGNÓSTICO DE ESQUEMA DE BASE DE DATOS\n');
    console.log('='.repeat(60));

    // 1. Verificar tablas existentes
    console.log('\n1️⃣ TABLAS EXISTENTES:');
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    const tables = await pool.query(tablesQuery);
    console.log(`   Total: ${tables.rows.length} tablas`);
    tables.rows.forEach(row => console.log(`   ✓ ${row.table_name}`));

    // 2. Verificar columnas de tabla users
    console.log('\n2️⃣ COLUMNAS DE TABLA users:');
    const usersColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    usersColumns.rows.forEach(col => {
      console.log(`   ✓ ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // 3. Verificar columnas de tabla categories
    console.log('\n3️⃣ COLUMNAS DE TABLA categories:');
    const categoriesColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'categories' 
      ORDER BY ordinal_position;
    `);
    if (categoriesColumns.rows.length > 0) {
      categoriesColumns.rows.forEach(col => {
        console.log(`   ✓ ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    } else {
      console.log('   ⚠️  Tabla categories no existe');
    }

    // 4. Verificar tabla organizations
    console.log('\n4️⃣ TABLA organizations:');
    const orgsExist = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'organizations'
      );
    `);
    if (orgsExist.rows[0].exists) {
      const orgs = await pool.query('SELECT id, name, code FROM organizations;');
      console.log(`   ✓ Tabla existe con ${orgs.rows.length} organizaciones`);
      orgs.rows.forEach(org => console.log(`      - ${org.name} (${org.code}) ID: ${org.id}`));
    } else {
      console.log('   ❌ Tabla organizations NO EXISTE');
    }

    // 5. Verificar usuario admin
    console.log('\n5️⃣ USUARIO ADMIN:');
    const admin = await pool.query(`
      SELECT id, name, email, role, organization_id, active 
      FROM users 
      WHERE email = 'admin@bicu.edu.ni';
    `);
    if (admin.rows.length > 0) {
      const user = admin.rows[0];
      console.log(`   ✓ Usuario encontrado:`);
      console.log(`      ID: ${user.id}`);
      console.log(`      Nombre: ${user.name}`);
      console.log(`      Email: ${user.email}`);
      console.log(`      Role: ${user.role}`);
      console.log(`      Organization ID: ${user.organization_id || '❌ NULL'}`);
      console.log(`      Activo: ${user.active}`);
    } else {
      console.log('   ❌ Usuario admin@bicu.edu.ni NO EXISTE');
    }

    // 6. Verificar índices de users
    console.log('\n6️⃣ ÍNDICES DE TABLA users:');
    const indexes = await pool.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'users';
    `);
    indexes.rows.forEach(idx => console.log(`   ✓ ${idx.indexname}`));

    // 7. Verificar datos de categorías
    console.log('\n7️⃣ CATEGORÍAS EXISTENTES:');
    try {
      const categories = await pool.query('SELECT * FROM categories LIMIT 5;');
      if (categories.rows.length > 0) {
        console.log(`   Total: ${categories.rows.length} categorías (mostrando primeras 5)`);
        categories.rows.forEach(cat => {
          console.log(`   - ${cat.name} (ID: ${cat.id}, Org: ${cat.organization_id || 'NULL'})`);
        });
      } else {
        console.log('   ⚠️  No hay categorías en la base de datos');
      }
    } catch (error) {
      console.log(`   ❌ Error al consultar: ${error.message}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Diagnóstico completado\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR EN DIAGNÓSTICO:', error.message);
    console.error('Stack:', error.stack);
    await pool.end();
    process.exit(1);
  }
}

checkDatabaseSchema();
