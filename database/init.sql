-- BICU Inventory System - Database Initialization Script
-- Sistema de Inventario de Repuestos Informáticos - Universidad BICU
-- Create users table (idempotente)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  apellido VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  movil VARCHAR(20),
  cedula VARCHAR(20),
  profesion VARCHAR(100),
  direccion TEXT,
  estado VARCHAR(50),
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'tecnico', 'supervisor')),
  profile_image TEXT,
  active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Create indexes on email for faster lookups (idempotente)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);

-- NOTA: El índice idx_users_cedula se crea en 006_add_user_extended_fields.sql
-- junto con las columnas extendidas (apellido, movil, cedula, profesion, etc.)

-- NOTA: El usuario administrador por defecto se crea en la migración
-- 005_insert_default_admin.sql DESPUÉS de crear la organización por defecto
-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';
-- Create trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Verify installation
SELECT 'Database initialized successfully!' AS status;
SELECT COUNT(*) AS user_count
FROM users;