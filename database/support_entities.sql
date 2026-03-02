-- BICU Inventory System - Support Entities
-- Suppliers and Equipments Tables
-- Drop existing tables if they exist (for development purposes)
DROP TABLE IF EXISTS equipments CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
-- Create suppliers table
CREATE TABLE suppliers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(150),
  address TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Create equipments table
CREATE TABLE equipments (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  brand VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  location VARCHAR(150),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'in_repair', 'retired')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Create indexes for better query performance
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_active ON suppliers(active);
CREATE INDEX idx_equipments_code ON equipments(code);
CREATE INDEX idx_equipments_serial_number ON equipments(serial_number);
CREATE INDEX idx_equipments_type ON equipments(type);
CREATE INDEX idx_equipments_status ON equipments(status);
-- Create trigger for suppliers updated_at
CREATE TRIGGER update_suppliers_updated_at BEFORE
UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Create trigger for equipments updated_at
CREATE TRIGGER update_equipments_updated_at BEFORE
UPDATE ON equipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Insert sample suppliers (idempotent)
INSERT INTO suppliers (id, name, phone, email, address)
VALUES (
    1,
    'TechSupply Nicaragua',
    '2222-3333',
    'ventas@techsupply.ni',
    'Managua, Nicaragua'
  ),
  (
    2,
    'CompuParts Central',
    '2555-4444',
    'info@compuparts.com',
    'Bluefields, Nicaragua'
  ),
  (
    3,
    'Global Hardware',
    '2777-8888',
    'contact@globalhw.com',
    'Managua, Nicaragua'
  ) ON CONFLICT (id) DO NOTHING;
-- Reset sequence for suppliers to avoid ID conflicts
SELECT setval(
    'suppliers_id_seq',
    (
      SELECT COALESCE(MAX(id), 0)
      FROM suppliers
    )
  );
-- Insert sample equipments (idempotent)
INSERT INTO equipments (
    code,
    type,
    brand,
    model,
    serial_number,
    location,
    status
  )
VALUES (
    'PC-LAB-001',
    'PC',
    'Dell',
    'OptiPlex 3080',
    'SN123456',
    'Laboratorio 1',
    'active'
  ),
  (
    'LAP-ADM-001',
    'Laptop',
    'HP',
    'ProBook 450',
    'SN789012',
    'Administración',
    'active'
  ),
  (
    'PC-LAB-002',
    'PC',
    'Lenovo',
    'ThinkCentre M720',
    'SN345678',
    'Laboratorio 1',
    'in_repair'
  ),
  (
    'PRINT-ADM-001',
    'Printer',
    'HP',
    'LaserJet Pro',
    'SN901234',
    'Administración',
    'active'
  ) ON CONFLICT (code) DO NOTHING;
-- Verify installation
SELECT 'Support entities tables created successfully!' AS status;
SELECT COUNT(*) AS supplier_count
FROM suppliers;
SELECT COUNT(*) AS equipment_count
FROM equipments;