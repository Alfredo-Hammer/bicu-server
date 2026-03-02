const app = require('./app');
const { pool } = require('./config/db');

// Render asigna dinámicamente el PORT
const PORT = process.env.PORT || 10000;

const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    const result = await pool.query('SELECT NOW() as current_time, current_database() as db_name');
    console.log('✓ Database connection verified');
    console.log(`✓ Connected to database: ${result.rows[0].db_name}`);
    console.log(`✓ Database time: ${result.rows[0].current_time}`);

    app.listen(PORT, '0.0.0.0', () => {
      console.log('═══════════════════════════════════════════');
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ API Health: http://localhost:${PORT}/api/health`);
      console.log('═══════════════════════════════════════════');
    });
  } catch (error) {
    console.error('═══════════════════════════════════════════');
    console.error('✗ CRITICAL: Failed to start server');
    console.error('✗ Error:', error.message);
    console.error('✗ Stack:', error.stack);
    if (error.code) console.error('✗ Error Code:', error.code);
    console.error('═══════════════════════════════════════════');
    process.exit(1);
  }
};

startServer();
