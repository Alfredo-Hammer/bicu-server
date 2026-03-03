# 🧹 API Endpoint para Limpiar Base de Datos COMPLETAMENTE

Como el plan gratuito de Render no tiene acceso al Shell, he creado un **endpoint de API** que permite limpiar **COMPLETAMENTE** la base de datos desde cualquier cliente HTTP (Postman, Thunder Client, curl, o el navegador).

⚠️ **ADVERTENCIA CRÍTICA:** Este endpoint elimina **TODO ABSOLUTAMENTE** y **NO recrea NADA**. La base de datos queda en **CERO ABSOLUTO**.

---

## 📍 Endpoint

```
POST /api/admin/clean-database
```

**Autenticación:** Requiere token JWT de un usuario con rol `admin`

---

## 🔐 Seguridad

- ✅ Solo usuarios con rol **admin** pueden ejecutarlo
- ✅ Requiere autenticación mediante JWT token
- ⚠️ **ADVERTENCIA CRÍTICA:** Esta acción elimina **TODO** y **NO recrea NADA**
- 🔴 **CERO ABSOLUTO**: Base de datos completamente vacía

---

## 🚀 Cómo Usar

### **Opción 1: Desde Postman o Thunder Client**

1. **Login como admin:**
   ```
   POST https://bicu-server.onrender.com/api/auth/login
   Body (JSON):
   {
     "email": "admin@bicu.edu.ni",
     "password": "admin123"
   }
   ```

2. **Copiar el token** de la respuesta

3. **Limpiar base de datos:**
   ```
   POST https://bicu-server.onrender.com/api/admin/clean-database
   Headers:
   Authorization: Bearer TU_TOKEN_AQUI
   ```

---

### **Opción 2: Desde la Terminal (curl)**

```bash
# 1. Login y obtener token
curl -X POST https://bicu-server.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bicu.edu.ni","password":"admin123"}'

# 2. Usar el token para limpiar (reemplaza TOKEN con el valor obtenido)
curl -X POST https://bicu-server.onrender.com/api/admin/clean-database \
  -H "Authorization: Bearer TOKEN"
```

---

### **Opción 3: Desde VS Code REST Client**

Crea un archivo `clean-db.http`:

```http
### Login
POST https://bicu-server.onrender.com/api/auth/login
Content-Type: application/json

{
  "email": "admin@bicu.edu.ni",
  "password": "admin123"
}

### Clean Database (reemplaza TOKEN)
POST https://bicu-server.onrender.com/api/admin/clean-database
Authorization: Bearer TOKEN
```

---

## 📦 Respuesta Exitosa

```json
{
  "success": true,
  "message": "🔴 Base de datos limpiada COMPLETAMENTE - CERO ABSOLUTO. Debes recrear organización y admin manualmente.",
  "data": {
    "organizaciones": "0",
    "usuarios": "0",
    "categorias": "0",
    "proveedores": "0",
    "repuestos": "0",
    "equipos": "0",
    "entradas": "0",
    "salidas": "0",
    "auditorias": "0"
  }
}
```

⚠️ **IMPORTANTE:** La base de datos está ahora **completamente vacía**:
- ❌ NO hay organizaciones
- ❌ NO hay usuarios (ni siquiera admin)
- ❌ NO hay repuestos, equipos, movimientos, ni ningún dato
- 🔄 Todos los secuencias (IDs) están reiniciadas a 1

---

## ❌ Respuestas de Error

### **No autenticado (401):**
```json
{
  "success": false,
  "message": "Token de autenticación requerido"
}
```

### **Sin permisos (403):**
```json
{
  "success": false,
  "message": "Acceso denegado. Se requiere rol de administrador"
}
```

### **Error del servidor (500):**
```json
{
  "success": false,
  "message": "Error al limpiar la base de datos",
  "error": "Detalles del error..."
}
```

---

## 🔍 ¿Qué Datos se Eliminan?

### **❌ ELIMINADO (TODO - CERO ABSOLUTO):**
- **TODAS las organizaciones** (incluyendo BICU-BLF)
- **TODOS los usuarios** (incluyendo admin actual)
- Todas las categorías
- Todos los proveedores
- Todos los repuestos
- Todos los equipos
- Todas las entradas de inventario
- Todas las salidas de inventario
- Todo el historial de auditoría
- Todas las imágenes subidas
- Toda configuración

### **🔴 NO SE RECREA NADA:**
- ❌ NO se recrea organización
- ❌ NO se recrea usuario admin
- ⚠️ Debes recrear manualmente usando migraciones o SQL

### **✅ MANTENIDO:**
- Estructura de todas las tablas
- Relaciones y constraints
- Índices
- Secuencias reiniciadas a 1

---

## 📝 Después de Limpiar

### Para volver a usar el sistema:

**Opción 1: Ejecutar migraciones**
```bash
# Si tienes scripts de seed/migrations
npm run seed
```

**Opción 2: SQL manual**
```sql
-- Crear organización
INSERT INTO organizations (name, code, email, is_active)
VALUES ('BICU', 'BLF', 'admin@bicu.edu.ni', true);

-- Crear admin (debes generar un hash bcrypt)
INSERT INTO users (organization_id, name, email, password, role, is_active)
VALUES (1, 'Admin', 'admin@bicu.edu.ni', '$2b$10$hash...', 'admin', true);
```

**Opción 3: Usar endpoint de registro**
Si tienes habilitado `/api/organizations/register`, puedes crear una nueva organización desde el frontend.

**IMPORTANTE:** La base de datos se recreó con credenciales por defecto:

---

## 🛡️ Seguridad y Recomendaciones

- ⚠️ **ADVERTENCIA CRÍTICA:** Este endpoint elimina absolutamente TODO y NO recrea NADA
- 💾 Realiza un backup antes de ejecutar si hay datos importantes
- 🔒 Solo ejecuta esto cuando estés 100% seguro de eliminar TODO
- 📋 Comunica al equipo antes de limpiar (perderán acceso COMPLETAMENTE)
- 🔴 **CERO ABSOLUTO:** Después de limpiar, NO habrá forma de acceder hasta recrear org + admin
- 🗑️ Las imágenes en `/uploads` se mantienen en el servidor pero quedan huérfanas
- ♻️ Considera limpiar manualmente la carpeta `/uploads` si es necesario
- 🔄 Deberás ejecutar migraciones o SQL manual para volver a usar el sistema

---

## 🔗 URLs de Producción

- **API Backend:** https://bicu-server.onrender.com/api
- **Frontend:** https://bicu-client.onrender.com
- **Health Check:** https://bicu-server.onrender.com/api/health

---

## 📚 Otros Endpoints de Admin

Por ahora solo existe este endpoint. En el futuro se podrían agregar:
- `GET /api/admin/stats` - Estadísticas del sistema
- `POST /api/admin/backup` - Crear backup
- `POST /api/admin/restore` - Restaurar backup
- `GET /api/admin/logs` - Ver logs del sistema

---

**Creado:** Marzo 2026  
**Actualizado:** Marzo 2, 2026  
**Versión:** 2.0 - ZERO ABSOLUTE (no recreation)
