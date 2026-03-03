const bcrypt = require('bcrypt');
const { pool } = require('./src/config/db');

async function seedAdminUser() {
  try {
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (name, email, password_hash, role, organization_id)
      SELECT $1, $2, $3, $4, org.id
      FROM organizations org
      WHERE org.code = 'BICU-BLF'
      ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          organization_id = EXCLUDED.organization_id
      RETURNING id, name, email, role;
    `;

    const result = await pool.query(query, [
      'Administrador BICU',
      'admin@bicu.edu.ni',
      passwordHash,
      'admin'
    ]);

    console.log('✓ Admin user created/updated successfully:');
    console.log('  Email:', result.rows[0].email);
    console.log('  Password:', password);
    console.log('  Role:', result.rows[0].role);
    console.log('\n⚠️  IMPORTANT: Change this password in production!');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding admin user:', error.message);
    process.exit(1);
  }
}

seedAdminUser();
