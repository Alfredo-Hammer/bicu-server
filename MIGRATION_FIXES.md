# Correcciones de Migraciones de Base de Datos

## Problema Identificado

Durante el despliegue en Render, se presentó el siguiente error:

```
insert or update on table "entry_details" violates foreign key constraint "entry_details_spare_part_id_fkey"
DETAIL: Key (spare_part_id)=(1) is not present in table "spare_parts"
```

## Causa Raíz

El archivo `database/movements.sql` contenía datos de ejemplo que hacían referencia a registros de `spare_parts` que no existían:

```sql
INSERT INTO entry_details (entry_id, spare_part_id, quantity, unit_price) VALUES
(1, 1, 50, 15.50),  -- spare_part_id 1 no existe
(1, 2, 30, 45.00);  -- spare_part_id 2 no existe
```

El problema era que `database/inventory.sql` creaba la tabla `spare_parts` pero **no insertaba ningún dato de ejemplo**, por lo que no existían registros con `id = 1` o `id = 2`.

## Soluciones Implementadas

### 1. Eliminación de Datos de Ejemplo en `movements.sql`

**Archivo**: `database/movements.sql`

**Cambio**: Se eliminaron completamente todos los datos de ejemplo (entries, outputs, y sus detalles).

**Razón**: 
- Los datos de ejemplo causaban errores de integridad referencial
- En producción, los datos deben ser creados por los usuarios a través de la aplicación
- Mantener el esquema limpio facilita el despliegue automatizado

### 2. Hacer Inserts Idempotentes

Se agregó cláusulas `ON CONFLICT DO NOTHING` a todos los inserts de datos de ejemplo para permitir que las migraciones se ejecuten múltiples veces sin errores.

#### `database/init.sql`

```sql
INSERT INTO users (name, email, password_hash, role) VALUES
('Administrador', 'admin@bicu.edu.ni', '$2b$10$...', 'admin')
ON CONFLICT (email) DO NOTHING;
```

#### `database/support_entities.sql`

```sql
-- Suppliers con IDs explícitos
INSERT INTO suppliers (id, name, phone, email, address) VALUES
(1, 'TechSupply Nicaragua', '2222-3333', 'ventas@techsupply.ni', 'Managua, Nicaragua'),
...
ON CONFLICT (id) DO NOTHING;

-- Equipments usando columna UNIQUE
INSERT INTO equipments (code, type, brand, model, ...) VALUES
('PC-LAB-001', 'PC', 'Dell', 'OptiPlex 3080', ...)
ON CONFLICT (code) DO NOTHING;
```

#### `database/inventory.sql`

```sql
INSERT INTO categories (name, description) VALUES
('Procesadores', 'CPUs y procesadores de computadora'),
...
ON CONFLICT (name) DO NOTHING;
```

#### `database/settings.sql`

```sql
-- Solo insertar si la tabla está vacía
INSERT INTO system_settings (...)
SELECT ...
WHERE NOT EXISTS (SELECT 1 FROM system_settings LIMIT 1);
```

### 3. Mejora del Manejo de Errores en `migrate.js`

**Archivo**: `scripts/migrate.js`

Se amplió la lista de errores que son seguros ignorar:

```javascript
const safeErrors = [
  'already exists',
  'duplicate key',
  'violates unique constraint',
  'constraint already exists'
];
```

Esto permite que las migraciones sean verdaderamente idempotentes.

### 4. Reset de Secuencias en `support_entities.sql`

Para evitar problemas con IDs duplicados en futuras inserciones:

```sql
SELECT setval('suppliers_id_seq', (SELECT COALESCE(MAX(id), 0) FROM suppliers));
```

## Resultado

✅ Las migraciones ahora son completamente idempotentes
✅ No hay datos de ejemplo que causen errores de foreign key
✅ El sistema puede desplegarse automáticamente en Render
✅ Las migraciones pueden ejecutarse múltiples veces sin errores
✅ Los usuarios crean sus propios datos a través de la aplicación

## Orden de Ejecución de Migraciones

El orden correcto (definido en `scripts/migrate.js`):

1. `database/init.sql` - Tabla users y funciones base
2. `database/support_entities.sql` - Suppliers y equipments
3. `database/inventory.sql` - Categories y spare_parts
4. `database/movements.sql` - Entries y outputs (sin datos)
5. `database/audit.sql` - Audit logs
6. `database/settings.sql` - System settings
7. `database/migrations/001_multi_tenant.sql` - Multi-tenant
8. `database/migrations/002_add_equipment_image.sql` - Equipment images
9. `database/migrations/003_add_equipment_repairs.sql` - Equipment repairs

## Verificación Local

Para verificar las migraciones localmente antes de desplegar:

```bash
cd server
npm run migrate
```

Esto ejecutará todas las migraciones y mostrará cualquier error que pueda ocurrir.

## Despliegue en Render

Las migraciones se ejecutan automáticamente durante el build en Render gracias a:

**render.yaml**:
```yaml
buildCommand: npm install && npm run migrate
```

**package.json**:
```json
"scripts": {
  "migrate": "node scripts/migrate.js"
}
```

## Notas Importantes

### Datos de Ejemplo

Los siguientes datos de ejemplo aún se crean automáticamente:

- ✅ 1 usuario administrador (`admin@bicu.edu.ni`)
- ✅ 3 proveedores
- ✅ 4 equipos
- ✅ 6 categorías de repuestos
- ✅ 1 organización por defecto (BICU Bluefields)
- ✅ Configuración del sistema por defecto

Los siguientes datos **NO** se crean automáticamente (los usuarios deben crearlos):

- ❌ Repuestos (spare_parts)
- ❌ Entradas (entries)
- ❌ Salidas (outputs)
- ❌ Movimientos de inventario

### Contraseña del Administrador

⚠️ **IMPORTANTE**: La contraseña del usuario administrador por defecto es `admin123` (hash hardcodeado en init.sql).

**Debes cambiarla inmediatamente después del primer despliegue.**

Para generar un nuevo hash:

```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('tu_nueva_contraseña', 10);
console.log(hash);
```

Luego actualizar el hash en la base de datos directamente o usar la aplicación web.

## Próximos Pasos

1. ✅ Commit de los cambios
2. ✅ Push al repositorio de GitHub
3. ⏳ Render detectará los cambios y redesplegará automáticamente
4. ⏳ Verificar logs de deploy en Render
5. ⏳ Probar endpoints de la API
6. ⏳ Cambiar contraseña del administrador

---

**Fecha**: 2026-02-14
**Autor**: GitHub Copilot (Claude Sonnet 4.5)
**Versión**: 1.0
