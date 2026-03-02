-- Migration: Add equipment repair history tracking
-- Date: 2026-02-15

-- Create equipment_repairs table to track repair history
CREATE TABLE IF NOT EXISTS equipment_repairs (
  id SERIAL PRIMARY KEY,
  equipment_id INTEGER NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
  repair_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  technician_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  cost DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('completed', 'in_progress', 'pending')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_equipment_repairs_equipment_id ON equipment_repairs(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_repairs_repair_date ON equipment_repairs(repair_date);
CREATE INDEX IF NOT EXISTS idx_equipment_repairs_technician_id ON equipment_repairs(technician_id);
CREATE INDEX IF NOT EXISTS idx_equipment_repairs_organization_id ON equipment_repairs(organization_id);
CREATE INDEX IF NOT EXISTS idx_equipment_repairs_status ON equipment_repairs(status);

-- Create trigger for updated_at
CREATE TRIGGER update_equipment_repairs_updated_at 
BEFORE UPDATE ON equipment_repairs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE equipment_repairs IS 'Tracks repair history and maintenance records for equipment';
COMMENT ON COLUMN equipment_repairs.repair_date IS 'Date when the repair was performed';
COMMENT ON COLUMN equipment_repairs.description IS 'Description of the repair or maintenance performed';
COMMENT ON COLUMN equipment_repairs.cost IS 'Cost of the repair in local currency';
COMMENT ON COLUMN equipment_repairs.status IS 'Status of the repair: completed, in_progress, pending';
