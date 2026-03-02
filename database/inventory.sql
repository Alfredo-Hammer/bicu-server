-- BICU Inventory System - Inventory Module
-- Categories and Spare Parts Tables

-- Drop existing tables if they exist (for development purposes)
DROP TABLE IF EXISTS spare_parts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Create categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spare_parts table
CREATE TABLE spare_parts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  min_stock INTEGER DEFAULT 1 CHECK (min_stock >= 0),
  location VARCHAR(150),
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_active ON categories(active);

CREATE INDEX idx_spare_parts_name ON spare_parts(name);
CREATE INDEX idx_spare_parts_category_id ON spare_parts(category_id);
CREATE INDEX idx_spare_parts_active ON spare_parts(active);
CREATE INDEX idx_spare_parts_stock ON spare_parts(stock);

-- Create trigger for categories updated_at
CREATE TRIGGER update_categories_updated_at 
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for spare_parts updated_at
CREATE TRIGGER update_spare_parts_updated_at 
BEFORE UPDATE ON spare_parts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample categories (idempotent)
INSERT INTO categories (name, description) VALUES
('Procesadores', 'CPUs y procesadores de computadora'),
('Memoria RAM', 'Módulos de memoria RAM'),
('Discos Duros', 'HDD y SSD'),
('Tarjetas Madre', 'Motherboards y placas base'),
('Fuentes de Poder', 'Power supplies'),
('Periféricos', 'Teclados, mouse, etc.')
ON CONFLICT (name) DO NOTHING;

-- Verify installation
SELECT 'Inventory tables created successfully!' AS status;
SELECT COUNT(*) AS category_count FROM categories;
