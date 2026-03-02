# Guía de Configuración Rápida - Backend BICU

## ⚡ Pasos para iniciar el servidor

### 1. Configurar variables de entorno

```bash
cd server
cp .env.example .env
```

Editar `.env` con tus credenciales de PostgreSQL:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=TU_CONTRASEÑA_AQUI
DB_NAME=bicu_inventory

JWT_SECRET=cambia_esto_por_una_clave_secreta_muy_larga_y_segura
JWT_EXPIRES_IN=24h
```

### 2. Crear la base de datos

```bash
# Opción 1: Desde la terminal
createdb -U postgres bicu_inventory

# Opción 2: Desde psql
psql -U postgres
CREATE DATABASE bicu_inventory;
\q
```

### 3. Ejecutar el script de inicialización

```bash
psql -U postgres -d bicu_inventory -f ../database/init.sql
```

### 4. Crear usuario administrador

```bash
node ../database/seed-admin.js
```

**Credenciales del admin:**
- Email: `admin@bicu.edu.ni`
- Password: `admin123`

### 5. Iniciar el servidor

```bash
npm run dev
```

## ✅ Verificar que funciona

### 1. Health Check

```bash
curl http://localhost:5000/api/health
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bicu.edu.ni",
    "password": "admin123"
  }'
```

Deberías recibir un token JWT.

### 3. Obtener perfil (usa el token del paso anterior)

```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 🎯 Resultado Esperado

Si todo está bien configurado, verás en la consola:

```
✓ Database connected successfully
✓ Database connection verified
✓ Server running on port 5000
✓ Environment: development
✓ API Health: http://localhost:5000/api/health
```

## 🐛 Solución de Problemas

### Error: "database does not exist"
- Asegúrate de haber creado la base de datos `bicu_inventory`

### Error: "password authentication failed"
- Verifica las credenciales en el archivo `.env`

### Error: "ECONNREFUSED"
- Verifica que PostgreSQL esté corriendo: `pg_isready`

### Error: "JWT_SECRET is not defined"
- Asegúrate de tener el archivo `.env` configurado
- Verifica que estés en la carpeta `server` al ejecutar comandos

## 📝 Notas Importantes

- El archivo `.env` NO debe subirse a git (ya está en `.gitignore`)
- Cambia la contraseña del admin en producción
- El JWT_SECRET debe ser una cadena larga y aleatoria en producción
