# 🧹 Scripts de Limpieza de Base de Datos

Este directorio contiene scripts para limpiar completamente la base de datos del sistema de inventario BICU.

---

## ⚠️ ADVERTENCIA

**Estos scripts eliminan TODOS los datos de la base de datos.**

Esta acción **NO se puede deshacer**.

---

## 📋 ¿Qué mantienen los scripts?

✅ **Mantiene:**
- Estructura de todas las tablas
- Organización BICU-BLF
- Usuario administrador con credenciales por defecto

❌ **Elimina:**
- Todos los repuestos
- Todos los equipos
- Todos los proveedores
- Todas las categorías
- Todas las entradas de inventario
- Todas las salidas de inventario
- Todos los usuarios (excepto admin)
- Todo el historial de auditoría

---

## 🚀 Cómo ejecutar

### **Opción 1: Script Node.js (Recomendado)**

#### **En Render (Producción):**

1. Ve a https://dashboard.render.com
2. Selecciona tu servicio **bicu-server**
3. Haz clic en la pestaña **"Shell"**
4. Ejecuta:

```bash
node clean-database.js
```

5. Espera 3 segundos (puedes cancelar con Ctrl+C)
6. El script limpiará toda la base de datos

#### **En local:**

```bash
cd server
node clean-database.js
```

---

### **Opción 2: Script SQL directo**

Si tienes acceso directo a PostgreSQL (con `psql`):

```bash
psql $DATABASE_URL -f database/clean-database.sql
```

---

## 📊 Resultado Esperado

Después de ejecutar el script verás:

```
✅ Auditoría limpiada
✅ Detalles de salidas eliminados
✅ Salidas eliminadas
✅ Detalles de entradas eliminados
✅ Entradas eliminadas
✅ Repuestos eliminados
✅ Equipos eliminados
✅ Proveedores eliminados
✅ Categorías eliminadas
✅ Usuarios eliminados: X (excepto admin)
✅ Usuario admin reseteado
✅ Configuración de organización limpiada
✅ Secuencias de IDs reseteadas

📊 ESTADO FINAL:
┌──────────────┬────────────┐
│ tabla        │ registros  │
├──────────────┼────────────┤
│ AUDITORÍA    │ 0          │
│ CATEGORÍAS   │ 0          │
│ ENTRADAS     │ 0          │
│ EQUIPOS      │ 0          │
│ PROVEEDORES  │ 0          │
│ REPUESTOS    │ 0          │
│ SALIDAS      │ 0          │
│ USUARIOS     │ 1          │
└──────────────┴────────────┘

========================================
✅ BASE DE DATOS LIMPIADA EXITOSAMENTE
========================================

🔐 CREDENCIALES DE ACCESO:
   📧 Email:    admin@bicu.edu.ni
   🔑 Password: admin123
```

---

## 🔐 Credenciales después de la limpieza

```
Email:    admin@bicu.edu.ni
Password: admin123
```

**IMPORTANTE:** Cambia esta contraseña después de la limpieza.

---

## 📝 Pasos después de limpiar

1. **Iniciar sesión** con las credenciales de admin
2. **Configurar institución** en `/configuracion`
   - Nombre, dirección, teléfono
   - Logo institucional
3. **Crear datos básicos:**
   - Categorías de repuestos
   - Proveedores
   - Repuestos iniciales
   - Equipos
4. **Crear usuarios** para técnicos y supervisores
5. **Comenzar a usar el sistema**

---

## 🛡️ Seguridad

- Los scripts tienen un delay de 3 segundos para cancelar
- Usan transacciones (ROLLBACK en caso de error)
- No afectan la estructura de la base de datos
- Solo afectan los datos

---

## 📂 Archivos

```
database/
  └── clean-database.sql      # Script SQL directo
server/
  └── clean-database.js       # Script Node.js con verificación
```

---

## ❓ Preguntas Frecuentes

### **¿Cuándo usar estos scripts?**
- Antes de entregar el sistema para pruebas
- Para resetear un ambiente de desarrollo
- Para comenzar desde cero después de datos de prueba

### **¿Se puede recuperar los datos después?**
- ❌ NO. Los datos se eliminan permanentemente
- Haz un backup si necesitas conservar algo

### **¿Afecta la estructura de la base de datos?**
- ❌ NO. Solo elimina datos, no altera tablas ni columnas

### **¿Funciona en multi-tenant?**
- ✅ SÍ. Solo limpia la organización BICU-BLF
- No afecta otras organizaciones si las hubiera

---

## 💾 Backup Recomendado

Antes de limpiar en producción, haz un backup:

```bash
# En Render Shell
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## 🔧 Personalización

Si necesitas mantener algunos datos (ej: categorías), edita los archivos y comenta las líneas correspondientes.

---

**Creado para:** Sistema de Inventario BICU  
**Versión:** 1.0  
**Fecha:** Marzo 2026
