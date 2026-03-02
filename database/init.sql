-- BICU Inventory System - Database Initialization Script
-- Sistema de Inventario de Repuestos Informáticos - Universidad BICU
-- Create users table (idempotente)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
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
-- Insert default admin user (idempotent)
-- Password: admin123 (CHANGE THIS IN PRODUCTION!)
-- Password hash generated with bcrypt, salt rounds: 10
INSERT INTO users (name, email, password_hash, role)
VALUES (
    'Administrador',
    'admin@bicu.edu.ni',
    '$2b$10$rZ5YhkqJxKxJxKxJxKxJxeO5YhkqJxKxJxKxJxKxJxKxJxKxJxKxJ',
    'admin'
  ) ON CONFLICT (email) DO NOTHING;
-- Note: The password hash above is a placeholder. 
-- To generate a real hash, use the following Node.js code:
-- const bcrypt = require('bcrypt');
-- const hash = await bcrypt.hash('admin123', 10);
-- console.log(hash);
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