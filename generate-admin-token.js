const jwt = require('jsonwebtoken');
const { pool } = require('./src/config/db');
require('dotenv').config();

async function generateAdminToken() {
  try {
    // Get admin user from database
    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE email = 'admin@bicu.edu.ni'"
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Usuario admin no encontrado');
      process.exit(1);
    }
    
    const user = result.rows[0];
    console.log('✓ Usuario encontrado:');
    console.log('  ID:', user.id);
    console.log('  Nombre:', user.name);
    console.log('  Email:', user.email);
    console.log('  Rol:', user.role);
    console.log('');
    
    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h',
      }
    );
    
    console.log('✓ Token JWT generado:');
    console.log('');
    console.log(token);
    console.log('');
    console.log('📋 INSTRUCCIONES:');
    console.log('1. Copia el token de arriba');
    console.log('2. Abre la consola del navegador (F12)');
    console.log('3. Ejecuta estos comandos:');
    console.log('');
    console.log(`localStorage.setItem('token', '${token}');`);
    console.log(`localStorage.setItem('user', '${JSON.stringify(JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }))}');`);
    console.log('location.reload();');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateAdminToken();
