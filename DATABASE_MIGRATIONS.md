# 🗄️ Sistema de Migraciones Automáticas - PostgreSQL

## 📋 Descripción

Este sistema ejecuta automáticamente todas las migraciones SQL cuando el servicio se despliega en Render, utilizando la variable de entorno `DATABASE_URL`.

## 🚀 Funcionamiento

### En Render (Producción)

Las migraciones se ejecutan **automáticamente** en cada deploy:

1. Render ejecuta `npm install`
2. Render ejecuta `npm run migrate` (definido en `buildCommand` del `render.yaml`)
3. El script conecta a PostgreSQL usando `DATABASE_URL`
4. Ejecuta todos los archivos SQL en orden
5. Si las tablas ya existen, solo ejecuta migraciones incrementales
6. Inicia el servidor con `npm start`

**No necesitas hacer nada manualmente** ✅

### En Desarrollo Local

Ejecutar migraciones manualmente:

```bash
npm run migrate
```

## 📁 Estructura de Archivos SQL

```
server/database/
├── init.sql                              # 1. Tablas base (roles, organizations)
├── support_entities.sql                  # 2. Categorías, proveedores
├── inventory.sql                         # 3. Repuestos, equipos
├── movements.sql                         # 4. Entradas, salidas
├── audit.sql                             # 5. Auditoría
├── settings.sql                          # 6. Configuración
└── migrations/
    ├── 001_multi_tenant.sql              # 7. Multi-tenant
    ├── 002_add_equipment_image.sql       # 8. Imágenes equipos
    └── 003_add_equipment_repairs.sql     # 9. Reparaciones
```

Los scripts se ejecutan en este orden específico.

## 🔍 Comportamiento Inteligente

El script de migración detecta automáticamente el estado de la base de datos:

### Base de datos vacía (primera vez)
```
✅ Ejecuta TODOS los scripts SQL en orden
✅ Crea todas las tablas desde cero
```

### Base de datos existente (re-deploy)
```
⚠️  Detecta que las tablas ya existen
✅ Solo ejecuta migraciones incrementales (carpeta migrations/)
✅ Omite scripts que generarían error "already exists"
```

## 📝 Scripts Disponibles

### `npm run migrate`
Ejecuta todas las migraciones manualmente.

**Uso:**
```bash
# Desarrollo local
npm run migrate

# Producción (Render lo ejecuta automáticamente)
```

### `npm run build`
Alias de `npm run migrate`. Render lo detecta automáticamente.

## 🔧 Configuración

### Variables de Entorno

**Producción (Render):**
```env
DATABASE_URL=postgresql://user:pass@host:port/database
NODE_ENV=production
```

**Desarrollo Local:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=hammer
DB_PASSWORD=hammer2026
DB_NAME=bicu_inventory
NODE_ENV=development
```

## 📊 Logs de Migración

Ejemplo de salida exitosa:

```
═══════════════════════════════════════════════════════
🚀 INICIANDO MIGRACIÓN DE BASE DE DATOS
═══════════════════════════════════════════════════════
📌 Entorno: production
📌 Base de datos: PostgreSQL (DATABASE_URL)

🔌 Conectando a PostgreSQL...
✅ Conexión establecida

📦 Base de datos vacía. Ejecutando todas las migraciones...

📄 Ejecutando: database/init.sql...
✅ Completado: database/init.sql
📄 Ejecutando: database/support_entities.sql...
✅ Completado: database/support_entities.sql
📄 Ejecutando: database/inventory.sql...
✅ Completado: database/inventory.sql
📄 Ejecutando: database/movements.sql...
✅ Completado: database/movements.sql
📄 Ejecutando: database/audit.sql...
✅ Completado: database/audit.sql
📄 Ejecutando: database/settings.sql...
✅ Completado: database/settings.sql
📄 Ejecutando: database/migrations/001_multi_tenant.sql...
✅ Completado: database/migrations/001_multi_tenant.sql
📄 Ejecutando: database/migrations/002_add_equipment_image.sql...
✅ Completado: database/migrations/002_add_equipment_image.sql
📄 Ejecutando: database/migrations/003_add_equipment_repairs.sql...
✅ Completado: database/migrations/003_add_equipment_repairs.sql

═══════════════════════════════════════════════════════
✅ MIGRACIÓN COMPLETADA EXITOSAMENTE
═══════════════════════════════════════════════════════
```

## ⚠️ Manejo de Errores

### Error: "relation already exists"
```
⚠️  Ya existe (omitiendo): database/init.sql
```
**Solución:** Normal en re-deploys. El script lo maneja automáticamente.

### Error: "could not connect to server"
```
❌ Error en database/init.sql: connection refused
```
**Solución:** 
- Verificar que `DATABASE_URL` esté configurada
- Verificar que la base de datos esté corriendo

### Error: "syntax error in SQL"
```
❌ Error en database/custom.sql: syntax error at line 42
```
**Solución:** Revisar el archivo SQL indicado y corregir la sintaxis.

## 🆕 Agregar Nueva Migración

1. **Crear archivo SQL:**
```bash
touch database/migrations/004_add_new_feature.sql
```

2. **Editar el script de migración:**
```javascript
// scripts/migrate.js
const SQL_SCRIPTS = [
  'database/init.sql',
  // ... otros scripts ...
  'database/migrations/003_add_equipment_repairs.sql',
  'database/migrations/004_add_new_feature.sql', // ← AGREGAR AQUÍ
];
```

3. **Commit y push:**
```bash
git add .
git commit -m "Add migration 004: new feature"
git push origin main
```

4. **Render ejecutará automáticamente la nueva migración** en el siguiente deploy.

## 🧪 Probar Migraciones Localmente

```bash
# 1. Crear base de datos vacía
createdb bicu_inventory_test

# 2. Configurar .env con la nueva BD
DB_NAME=bicu_inventory_test

# 3. Ejecutar migraciones
npm run migrate

# 4. Verificar tablas creadas
psql bicu_inventory_test -c "\dt"
```

## 🔄 Rollback (Deshacer Migración)

**Importante:** Este sistema NO tiene rollback automático.

Para deshacer una migración:

1. **Crear script SQL de rollback:**
```sql
-- database/migrations/004_rollback_feature.sql
DROP TABLE IF EXISTS new_feature_table;
ALTER TABLE users DROP COLUMN IF EXISTS new_column;
```

2. **Ejecutar manualmente en producción:**
   - Conectarse a la BD de Render via Shell
   - Ejecutar el script de rollback

3. **Remover la migración del código:**
   - Eliminar del array `SQL_SCRIPTS` en `scripts/migrate.js`
   - Commit y push

## 📋 Checklist de Deploy

- [ ] Todos los archivos SQL están en `server/database/`
- [ ] Los scripts están listados en orden en `scripts/migrate.js`
- [ ] `package.json` tiene el script `migrate`
- [ ] `render.yaml` incluye `npm run migrate` en `buildCommand`
- [ ] Variable `DATABASE_URL` configurada en Render
- [ ] Probadas migraciones localmente

## 🎯 Ventajas del Sistema

✅ **Automático:** Se ejecuta en cada deploy, no requiere intervención manual  
✅ **Idempotente:** Se puede ejecutar múltiples veces sin errores  
✅ **Inteligente:** Detecta si las tablas ya existen  
✅ **Con logs:** Muestra claramente qué se está ejecutando  
✅ **Con errores:** Maneja errores comunes automáticamente  
✅ **Versionado:** Los scripts SQL están en Git  

## 🔗 Referencias

- Script: [scripts/migrate.js](scripts/migrate.js)
- Configuración: [render.yaml](render.yaml)
- Package: [package.json](package.json)
- Scripts SQL: [database/](database/)
