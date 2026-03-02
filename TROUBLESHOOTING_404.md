# 🔍 Diagnóstico y Solución de Error 404 en Render

## ✅ ANÁLISIS DEL CÓDIGO

He revisado tu código y **está configurado correctamente:**

### 1. **app.js** ✅
```javascript
// ✅ Middlewares en el orden correcto
app.use(helmet(...));
app.use(cors(...));
app.use(morgan('dev'));
app.use(express.json());              // ← ANTES de las rutas ✅
app.use(express.urlencoded(...));     // ← ANTES de las rutas ✅

// ✅ Rutas con prefijo /api
app.use('/api/organizations', organizationRoutes);
```

### 2. **organizationRoutes.js** ✅
```javascript
// ✅ Ruta register definida correctamente
router.post('/register', OrganizationController.registerOrganization);

// ✅ Export correcto
module.exports = router;
```

### 3. **organizationController.js** ✅
```javascript
// ✅ Método static definido correctamente
static async registerOrganization(req, res) { ... }
```

### 4. **Ruta Completa Esperada** ✅
```
POST /api/organizations/register
```

---

## 🚨 POSIBLES CAUSAS DEL ERROR 404

Dado que el código está correcto, el problema puede ser:

### 1. **El servidor no está iniciando correctamente en Render**

**Síntomas:**
- Render muestra "Live" pero las rutas no funcionan
- Solo funciona `/api/health` (si la defines directo en app.js)

**Solución:**
Revisar los **logs de deploy** en Render.

### 2. **Las migraciones están fallando y el servidor no arranca**

**Síntomas:**
- El build termina pero el servidor crashea
- Render reintenta iniciar el servicio constantemente

**Solución:**
Revisar si las migraciones se ejecutaron correctamente.

### 3. **El frontend está llamando a la URL incorrecta**

**Síntomas:**
- El backend funciona pero el frontend recibe 404

**Solución:**
Verificar la URL exacta que usa el frontend.

### 4. **Problema con case sensitivity en Linux**

**Síntomas:**
- Funciona en local (macOS/Windows) pero no en Render (Linux)

**Solución:**
Verificar nombres de archivos y rutas.

---

## 🔧 PASOS PARA DEBUGGING

### Paso 1: Verificar que el servidor está corriendo

**En Render Dashboard:**

1. Ve a tu servicio `bicu-server`
2. Click en **Logs** (arriba a la derecha)
3. Busca este mensaje:

```
✓ Server running on port 10000
✓ Environment: production
✓ API Health: http://localhost:10000/api/health
```

**Si NO ves este mensaje:**
- El servidor NO está iniciando correctamente
- Busca errores rojos en los logs

**Si SÍ ves el mensaje:**
- El servidor SÍ está corriendo
- El problema está en otro lado

---

### Paso 2: Probar el endpoint de Health

**Desde tu navegador o Postman:**

```
GET https://bicu-server.onrender.com/api/health
```

**Respuesta esperada:**
```json
{
  "status": "OK",
  "message": "BICU Inventory API is running",
  "timestamp": "2026-03-01T..."
}
```

**Si funciona:**
- ✅ El servidor está corriendo
- ✅ Las rutas básicas funcionan
- ⚠️ El problema es con `/api/organizations/register` específicamente

**Si NO funciona:**
- ❌ El servidor no está accesible
- Revisar logs de Render

---

### Paso 3: Probar el endpoint de organizaciones

**Desde Postman:**

```http
POST https://bicu-server.onrender.com/api/organizations/register
Content-Type: application/json

{
  "organization": {
    "name": "Test Org",
    "code": "TEST001",
    "address": "Test Address",
    "phone": "1234567890"
  },
  "admin": {
    "name": "Admin",
    "lastname": "User",
    "adminEmail": "admin@test.com",
    "adminPassword": "Test123456"
  }
}
```

**Posibles respuestas:**

#### ✅ Respuesta exitosa (201):
```json
{
  "success": true,
  "message": "Organización registrada exitosamente",
  "data": { ... }
}
```
**Significado:** El endpoint funciona correctamente.

#### ❌ Error 404:
```json
{
  "success": false,
  "message": "Ruta no encontrada"
}
```
**Significado:** El servidor no encuentra la ruta.

#### ❌ Error 500:
```json
{
  "success": false,
  "message": "Error del servidor"
}
```
**Significado:** La ruta existe pero hay un error en el código o la BD.

---

### Paso 4: Revisar logs detallados en Render

**En Render Dashboard → Logs:**

Busca estos mensajes:

#### Logs de migraciones:
```
🚀 INICIANDO MIGRACIÓN DE BASE DE DATOS
✅ MIGRACIÓN COMPLETADA EXITOSAMENTE
```

#### Logs de inicio del servidor:
```
✓ Database connection verified
✓ Connected to database: bicu_inventory
✓ Server running on port 10000
```

#### Logs de peticiones (morgan):
```
POST /api/organizations/register 201 150.123 ms - 245
```

**Si ves el log de la petición:**
- ✅ La ruta está siendo procesada
- El código de respuesta indica el resultado (201 = éxito, 404 = no encontrado)

**Si NO ves logs de peticiones:**
- ❌ Las peticiones no están llegando al servidor
- Problema de red o URL incorrecta

---

## 📋 CHECKLIST DE VERIFICACIÓN

Marca cada punto que hayas verificado:

### Backend (Render)

- [ ] El servicio muestra estado "Live" en Render
- [ ] Los logs muestran "Server running on port 10000"
- [ ] Los logs muestran "Database connection verified"
- [ ] Los logs muestran "MIGRACIÓN COMPLETADA EXITOSAMENTE"
- [ ] No hay errores rojos en los logs
- [ ] `GET /api/health` responde correctamente
- [ ] El dominio es: `https://bicu-server.onrender.com`

### Frontend

- [ ] La variable `VITE_API_URL` está configurada correctamente
- [ ] La URL es: `https://bicu-server.onrender.com/api`
- [ ] El frontend hace `POST` a: `${VITE_API_URL}/organizations/register`
- [ ] No hay errores de CORS en la consola del navegador

### Base de Datos

- [ ] La base de datos existe en Render
- [ ] La variable `DATABASE_URL` está configurada
- [ ] Las migraciones se ejecutaron sin errores
- [ ] Las tablas `organizations` y `users` existen

---

## 🛠️ SOLUCIONES COMUNES

### Solución 1: Reiniciar el servicio manualmente

**En Render Dashboard:**

1. Ve a tu servicio `bicu-server`
2. Click en **Manual Deploy** → **Clear build cache & deploy**
3. Espera a que termine el deploy (~3-5 minutos)
4. Verifica los logs nuevamente

---

### Solución 2: Verificar variables de entorno

**En Render Dashboard → Environment:**

Verifica que existan estas variables:

```env
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://bicu-client.onrender.com
DATABASE_URL=(generado automáticamente)
JWT_SECRET=(generado automáticamente)
JWT_EXPIRES_IN=24h
```

**Si falta alguna:**
Agrégala manualmente y re-deploya.

---

### Solución 3: Agregar logs temporales para debugging

**Edita organizationRoutes.js:**

```javascript
const express = require('express');
const router = express.Router();
const OrganizationController = require('../controllers/organizationController');
const authMiddleware = require('../middlewares/authMiddleware');

// DEBUG: Log cuando se carga el router
console.log('✓ Organization routes loaded');

// Public routes
router.post('/register', (req, res, next) => {
  console.log('✓ POST /register called');
  console.log('✓ Body:', JSON.stringify(req.body, null, 2));
  next();
}, OrganizationController.registerOrganization);

router.get('/registered-codes', OrganizationController.getRegisteredCodes);

// Protected routes
router.get('/current', authMiddleware, OrganizationController.getOrganization);

module.exports = router;
```

**Commit y push:**
```bash
git add .
git commit -m "Add debug logs to organization routes"
git push origin main
```

**Espera el re-deploy y revisa los logs de Render.**

Si ves:
```
✓ Organization routes loaded
✓ POST /register called
✓ Body: { ... }
```
**Significa que la ruta SÍ está funcionando.**

---

### Solución 4: Verificar la URL exacta del frontend

**En el frontend (client/src/services/organizationService.js):**

Asegúrate de que la URL sea:

```javascript
export const organizationService = {
  register: async (data) => {
    // ✅ CORRECTO
    const response = await api.post('/organizations/register', data);
    
    // ❌ INCORRECTO (sin /api porque api.js ya lo tiene)
    // const response = await api.post('/api/organizations/register', data);
    
    return response.data;
  }
};
```

**Recuerda:** `api.js` ya tiene el `baseURL` con `/api`, entonces solo necesitas `/organizations/register`.

---

## 📞 SIGUIENTE PASO

Por favor, realiza estos pasos en orden y comparte:

1. **Screenshot de los logs de Render** (últimas 50 líneas)
2. **Respuesta de:** `GET https://bicu-server.onrender.com/api/health`
3. **Respuesta de:** `POST https://bicu-server.onrender.com/api/organizations/register` (desde Postman)
4. **Configuración de variables de entorno** en Render

Con esta información podré identificar exactamente dónde está el problema.

---

## 🎯 VERIFICACIÓN RÁPIDA (en 30 segundos)

Abre tu terminal y ejecuta:

```bash
# Verificar que el servidor responde
curl https://bicu-server.onrender.com/api/health

# Debería devolver:
# {"status":"OK","message":"BICU Inventory API is running","timestamp":"..."}
```

Si esto funciona pero `/organizations/register` no, entonces el problema está en:
- Las migraciones de la base de datos
- El controlador de organizaciones
- Las validaciones del servicio

**¿Qué resultado obtuviste?** Compártelo para continuar el debugging.
