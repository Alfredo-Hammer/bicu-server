# BICU Inventory System - Backend API

Backend del Sistema de Inventario de Repuestos Informáticos para la Universidad BICU (Nicaragua).

## 📋 Descripción

API REST desarrollada con Node.js, Express y PostgreSQL para gestionar el inventario de repuestos informáticos utilizados en el área de soporte técnico de la universidad.

## 🛠️ Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación basada en tokens
- **bcrypt** - Encriptación de contraseñas
- **Helmet** - Seguridad HTTP
- **Morgan** - Logger de peticiones
- **CORS** - Control de acceso entre orígenes

## 📁 Estructura del Proyecto

```
server/
│
├── src/
│   ├── config/          # Configuración (DB, etc.)
│   ├── controllers/     # Controladores (lógica de endpoints)
│   ├── routes/          # Definición de rutas
│   ├── middlewares/     # Middlewares (auth, roles, etc.)
│   ├── services/        # Lógica de negocio
│   ├── models/          # Modelos de datos
│   ├── utils/           # Utilidades
│   ├── app.js           # Configuración de Express
│   └── server.js        # Punto de entrada
│
├── .env.example         # Ejemplo de variables de entorno
├── package.json
└── README.md
```

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
cd server
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiar el archivo `.env.example` a `.env` y configurar las variables:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=bicu_inventory

JWT_SECRET=tu_clave_secreta_muy_segura
JWT_EXPIRES_IN=24h
```

### 4. Crear la base de datos

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE bicu_inventory;

# Salir de psql
\q
```

### 5. Ejecutar el script de inicialización

```bash
# Ejecutar el script SQL
psql -U postgres -d bicu_inventory -f ../database/init.sql
```

### 6. Crear usuario administrador

```bash
# Asegúrate de tener el archivo .env configurado
node ../database/seed-admin.js
```

Esto creará un usuario administrador con las siguientes credenciales:

- **Email:** admin@bicu.edu.ni
- **Password:** admin123
- **Role:** admin

⚠️ **IMPORTANTE:** Cambia esta contraseña en producción.

## 🏃 Ejecutar el servidor

### Modo desarrollo (con nodemon)

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

El servidor estará disponible en: `http://localhost:5000`

## 📡 Endpoints Disponibles

### Health Check

```http
GET /api/health
```

Verifica que el servidor esté funcionando.

**Respuesta:**
```json
{
  "status": "OK",
  "message": "BICU Inventory API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Autenticación

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@bicu.edu.ni",
  "password": "admin123"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Administrador BICU",
      "email": "admin@bicu.edu.ni",
      "role": "admin"
    }
  }
}
```

#### Obtener Perfil

```http
GET /api/auth/profile
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Administrador BICU",
    "email": "admin@bicu.edu.ni",
    "role": "admin"
  }
}
```

## 🔐 Autenticación y Autorización

### Autenticación con JWT

Todas las rutas protegidas requieren un token JWT en el header:

```
Authorization: Bearer <tu_token_jwt>
```

### Roles de Usuario

El sistema maneja tres roles:

- **admin** - Acceso completo al sistema
- **tecnico** - Registrar reparaciones y salidas de repuestos
- **supervisor** - Solo lectura y reportes

### Uso de Middlewares

```javascript
const authMiddleware = require('./middlewares/authMiddleware');
const roleMiddleware = require('./middlewares/roleMiddleware');

// Ruta protegida (requiere autenticación)
router.get('/protected', authMiddleware, controller.method);

// Ruta solo para admin
router.post('/admin-only', authMiddleware, roleMiddleware('admin'), controller.method);

// Ruta para admin y técnico
router.post('/multi-role', authMiddleware, roleMiddleware('admin', 'tecnico'), controller.method);
```

## 🧪 Pruebas con Postman

### 1. Health Check

```
GET http://localhost:5000/api/health
```

### 2. Login

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@bicu.edu.ni",
  "password": "admin123"
}
```

### 3. Obtener Perfil (con token)

```
GET http://localhost:5000/api/auth/profile
Authorization: Bearer <token_obtenido_en_login>
```

## 📝 Próximos Pasos

Esta es la base del backend. Los siguientes módulos a implementar son:

- [ ] Gestión de repuestos (spare parts)
- [ ] Gestión de categorías
- [ ] Gestión de proveedores
- [ ] Registro de entradas (compras)
- [ ] Registro de salidas (uso en reparaciones)
- [ ] Gestión de equipos
- [ ] Sistema de auditoría
- [ ] Generación de reportes

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt (10 salt rounds)
- Autenticación JWT con expiración configurable
- Helmet para headers de seguridad HTTP
- CORS configurado
- Validación de datos en todos los endpoints
- Middleware de autorización por roles

## 📚 Documentación Adicional

Para más información sobre la arquitectura y reglas del sistema, consultar:

- `AGENTS.md` - Documento de arquitectura y reglas del proyecto

## 👥 Autor

Equipo de Desarrollo BICU - Proyecto de Tesis Monográfica

## 📄 Licencia

ISC
