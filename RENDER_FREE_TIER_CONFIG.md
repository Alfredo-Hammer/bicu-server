# 🚀 Configuración Optimizada para Render Free Tier

## ✅ Cambios Implementados

### 1. **Auto-Ejecución de Migraciones al Iniciar el Servidor**

El servidor ahora ejecuta automáticamente las migraciones cada vez que inicia, garantizando que la base de datos esté siempre sincronizada.

#### `package.json` - Scripts Optimizados

```json
{
  "scripts": {
    "start": "npm run migrate && node src/server.js",
    "dev": "nodemon src/server.js",
    "migrate": "node scripts/migrate.js",
    "build": "echo 'Build completed'",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

**Cambio Clave**: 
- ✅ `"start": "npm run migrate && node src/server.js"` - Ejecuta migraciones ANTES de iniciar
- ✅ Las migraciones fallan → el servidor NO inicia (seguro)
- ✅ Compatible con plan gratuito de Render

---

### 2. **Script de Migración con Logs Detallados**

#### `scripts/migrate.js` - Versión Completa Optimizada

```javascript
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
    const tableMatches = sql.match(/CREATE TABLE (IF NOT EXISTS )?[\w_]+/gi);
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
```

**Mejoras Implementadas**:
- ✅ Logs detallados de cada archivo SQL ejecutado
- ✅ Muestra tamaño del archivo y tiempo de ejecución
- ✅ Lista todas las tablas creadas por cada script
- ✅ Al finalizar, muestra TODAS las tablas en la BD para verificar
- ✅ Manejo robusto de errores idempotentes
- ✅ Compatible con DATABASE_URL de Render
- ✅ **SIEMPRE ejecuta todos los scripts en orden** (sin lógica condicional)
- ✅ Garantiza que las migraciones se ejecuten DESPUÉS de crear todas las tablas base

---

### 3. **Archivos SQL Completamente Idempotentes**

Todos los scripts SQL ahora usan `IF NOT EXISTS` para garantizar que pueden ejecutarse múltiples veces sin errores.

#### Cambios en Archivos SQL:

**`database/init.sql`**:
```sql
-- ✅ ANTES: DROP TABLE IF EXISTS users CASCADE; CREATE TABLE users (...)
-- ✅ AHORA: CREATE TABLE IF NOT EXISTS users (...)

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  -- ... resto de columnas
);

-- Índices idempotentes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);

-- Triggers idempotentes (DROP antes de CREATE)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**`database/support_entities.sql`**:
```sql
CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  -- ... columnas
);

CREATE TABLE IF NOT EXISTS equipments (
  id SERIAL PRIMARY KEY,
  -- ... columnas
);

-- Índices idempotentes
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_equipments_code ON equipments(code);

-- Inserts idempotentes
INSERT INTO suppliers (id, name, phone, email, address) VALUES
(1, 'TechSupply Nicaragua', '2222-3333', 'ventas@techsupply.ni', 'Managua, Nicaragua')
ON CONFLICT (id) DO NOTHING;
```

**`database/inventory.sql`**:
```sql
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  -- ... columnas
);

CREATE TABLE IF NOT EXISTS spare_parts (
  id SERIAL PRIMARY KEY,
  -- ... columnas
);

-- Inserts idempotentes
INSERT INTO categories (name, description) VALUES
('Procesadores', 'CPUs y procesadores de computadora')
ON CONFLICT (name) DO NOTHING;
```

**`database/movements.sql`**:
```sql
CREATE TABLE IF NOT EXISTS entries (
  id SERIAL PRIMARY KEY,
  -- ... columnas
);

CREATE TABLE IF NOT EXISTS entry_details (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  spare_part_id INTEGER NOT NULL REFERENCES spare_parts(id),
  -- ... columnas
);

CREATE TABLE IF NOT EXISTS outputs (
  id SERIAL PRIMARY KEY,
  -- ... columnas
);

CREATE TABLE IF NOT EXISTS output_details (
  id SERIAL PRIMARY KEY,
  -- ... columnas
);

-- Todos los índices con IF NOT EXISTS
CREATE INDEX IF NOT EXISTS idx_entries_supplier ON entries(supplier_id);
CREATE INDEX IF NOT EXISTS idx_outputs_date ON outputs(date);
```

---

## 📋 Verificación de Idempotencia

| Archivo SQL | Estado | Observaciones |
|------------|--------|---------------|
| `init.sql` | ✅ Idempotente | `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS` |
| `support_entities.sql` | ✅ Idempotente | Tablas + inserts con `ON CONFLICT DO NOTHING` |
| `inventory.sql` | ✅ Idempotente | Tablas + inserts con `ON CONFLICT (name) DO NOTHING` |
| `movements.sql` | ✅ Idempotente | Sin datos de ejemplo, solo estructura |
| `audit.sql` | ✅ Idempotente | Usa `CREATE TABLE IF NOT EXISTS` |
| `settings.sql` | ✅ Idempotente | INSERT con subquery `WHERE NOT EXISTS` |
| `001_multi_tenant.sql` | ✅ Idempotente | Migraciones con `ALTER TABLE ... IF NOT EXISTS` |

---

## 🎯 Ventajas de esta Configuración

1. **✅ Auto-healing**: Si las tablas faltan, se crean automáticamente
2. **✅ Sin errores de duplicados**: Todos los `CREATE` usan `IF NOT EXISTS`
3. **✅ Logs detallados**: Puedes ver en Render EXACTAMENTE qué tablas se crearon
4. **✅ Compatible con Free Tier**: No requiere recursos adicionales
5. **✅ Seguro**: Si las migraciones fallan, el servidor NO inicia
6. **✅ Predecible**: SIEMPRE ejecuta todos los scripts en el mismo orden
7. **✅ Sin lógica condicional**: No hay riesgo de saltar scripts necesarios
8. **✅ Orden garantizado**: Las migraciones siempre se ejecutan DESPUÉS de las tablas base

---

## 📊 Logs Esperados en Render

Cuando despliegues, verás logs similares a estos en Render:

```
═══════════════════════════════════════════════════════
🚀 INICIANDO MIGRACIÓN DE BASE DE DATOS - RENDER FREE TIER
═══════════════════════════════════════════════════════
📌 Entorno: production
📌 Base de datos: PostgreSQL (DATABASE_URL)
📌 Timestamp: 2026-03-01T15:30:00.000Z
📌 Scripts a ejecutar: 9

🔌 Conectando a PostgreSQL...
✅ Conexión establecida

ℹ️  Tablas detectadas. Ejecutando migraciones de forma idempotente...

📄 Ejecutando: database/init.sql
   Tamaño: 1.23 KB
✅ Completado: init.sql (245ms)
   Tablas procesadas: 1
   ✓ users

📄 Ejecutando: database/support_entities.sql
   Tamaño: 3.45 KB
✅ Completado: support_entities.sql (312ms)
   Tablas procesadas: 2
   ✓ suppliers
   ✓ equipments

📄 Ejecutando: database/inventory.sql
   Tamaño: 2.10 KB
✅ Completado: inventory.sql (189ms)
   Tablas procesadas: 2
   ✓ categories
   ✓ spare_parts

... (resto de archivos)

═══════════════════════════════════════════════════════
✅ MIGRACIÓN COMPLETADA EXITOSAMENTE
═══════════════════════════════════════════════════════
⏱️  Tiempo total: 3.42s
📊 Tablas en base de datos: 12
📋 Tablas disponibles:
   ✓ audit_logs
   ✓ categories
   ✓ entries
   ✓ entry_details
   ✓ equipments
   ✓ organizations
   ✓ output_details
   ✓ outputs
   ✓ spare_parts
   ✓ suppliers
   ✓ system_settings
   ✓ users

🎉 Base de datos lista para usar!
═══════════════════════════════════════════════════════

🚀 Starting server on port 10000...
✅ Database connected successfully
✅ Server running on http://0.0.0.0:10000
```

---

## 🔧 Cómo Probar Localmente

```bash
# 1. Asegúrate de tener PostgreSQL corriendo
# 2. Configura tu .env con las credenciales
# 3. Ejecuta las migraciones manualmente
cd server
npm run migrate

# 4. O ejecuta el servidor (que auto-ejecutará las migraciones)
npm start
```

---

## 🚀 Próximos Pasos para Deploy en Render

1. **Hacer commit de todos los cambios**:
   ```bash
   cd /Volumes/Hammer-Drive/Poyectos/PROGRAMACION/SISTEMA-INVENTARIO/server
   git add .
   git commit -m "feat: configuración optimizada para Render Free Tier con auto-migraciones"
   git push origin main
   ```

2. **Render detectará el push y redesplegará automáticamente**

3. **Verificar logs en Render**:
   - Ir a dashboard.render.com
   - Seleccionar el servicio `bicu-server`
   - Clic en "Logs"
   - Buscar los mensajes de migración exitosa

4. **Verificar que la API funciona**:
   ```bash
   curl https://bicu-server.onrender.com/api/health
   ```

5. **Probar login**:
   ```bash
   curl -X POST https://bicu-server.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@bicu.edu.ni","password":"admin123"}'
   ```

---

## ⚠️ Solución de Problemas

### Si las migraciones fallan:

1. **Revisar logs en Render** - El error exacto aparecerá con `❌ ERROR CRÍTICO`
2. **Verificar DATABASE_URL** - Asegurarse que esté configurada en Render
3. **Verificar sintaxis SQL** - Probar localmente primero con `npm run migrate`

### Si el servidor no inicia:

- Las migraciones DEBEN completarse exitosamente primero
- Si hay error en SQL, el servidor NO iniciará (por seguridad)
- Revisar logs para identificar qué script SQL falló

---

## 🔧 Resolución del Error "relation does not exist"

### Problema Original

```
❌ ERROR CRÍTICO en database/migrations/001_multi_tenant.sql:
   Mensaje: relation "entries" does not exist
```

### Causa Raíz

El script de migración tenía lógica condicional que, al detectar tablas existentes (como `organizations`), **saltaba** los scripts base (init.sql, movements.sql, etc.) y solo ejecutaba las migraciones incrementales. Esto causaba que `001_multi_tenant.sql` intentara modificar tablas que no existían.

### Solución Implementada

**Eliminada la lógica condicional**. Ahora el script **SIEMPRE ejecuta TODOS los archivos SQL en orden**:

```javascript
// ❌ ANTES: Lógica condicional que saltaba scripts
if (tablesExist) {
  // Solo migraciones incrementales
  const migrationScripts = SQL_SCRIPTS.filter(script => script.includes('migrations/'));
  for (const script of migrationScripts) {
    await executeSQLFile(script);
  }
} else {
  // Todos los scripts
  for (const script of SQL_SCRIPTS) {
    await executeSQLFile(script);
  }
}

// ✅ AHORA: Siempre ejecuta todos los scripts
for (const script of SQL_SCRIPTS) {
  await executeSQLFile(script);
}
```

### Por Qué Funciona

1. **Todos los scripts son idempotentes**: Usan `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, etc.
2. **No hay duplicación**: Si una tabla ya existe, PostgreSQL la ignora (no hay error)
3. **Orden garantizado**: Las migraciones (001, 002, 003) SIEMPRE se ejecutan DESPUÉS de crear todas las tablas base
4. **Predecible**: El mismo comportamiento en deploy inicial y en redespliegues

### Beneficios

- ✅ No más errores "relation does not exist"
- ✅ Comportamiento consistente en todos los despliegues
- ✅ Más simple de entender y mantener
- ✅ No requiere lógica compleja para detectar estado de la BD

---

**Fecha de Configuración**: 2026-03-01  
**Última Actualización**: 2026-03-02 (Fix: relation does not exist)  
**Versión**: 2.1 (Optimizada para Render Free Tier con ejecución secuencial garantizada)  
**Estado**: ✅ Lista para producción
