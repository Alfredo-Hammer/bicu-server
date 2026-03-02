-- ============================================
-- INVENTORY MOVEMENTS (KARDEX) MODULE
-- Entries and Outputs with Automatic Stock Control
-- ============================================
-- ============================================
-- ENTRIES TABLE (Purchases/Stock Additions)
-- ============================================
CREATE TABLE IF NOT EXISTS entries (
  id SERIAL PRIMARY KEY,
  supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ============================================
-- ENTRY DETAILS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS entry_details (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  spare_part_id INTEGER NOT NULL REFERENCES spare_parts(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ============================================
-- OUTPUTS TABLE (Usage in Repairs)
-- ============================================
CREATE TABLE IF NOT EXISTS outputs (
  id SERIAL PRIMARY KEY,
  technician_id INTEGER NOT NULL REFERENCES users(id),
  equipment_id INTEGER NOT NULL REFERENCES equipments(id),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ============================================
-- OUTPUT DETAILS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS output_details (
  id SERIAL PRIMARY KEY,
  output_id INTEGER NOT NULL REFERENCES outputs(id) ON DELETE CASCADE,
  spare_part_id INTEGER NOT NULL REFERENCES spare_parts(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
-- Entries indexes (idempotente)
CREATE INDEX IF NOT EXISTS idx_entries_supplier ON entries(supplier_id);
CREATE INDEX IF NOT EXISTS idx_entries_user ON entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);
CREATE INDEX IF NOT EXISTS idx_entries_active ON entries(active);
-- Entry details indexes
CREATE INDEX IF NOT EXISTS idx_entry_details_entry ON entry_details(entry_id);
CREATE INDEX IF NOT EXISTS idx_entry_details_spare_part ON entry_details(spare_part_id);
-- Outputs indexes
CREATE INDEX IF NOT EXISTS idx_outputs_technician ON outputs(technician_id);
CREATE INDEX IF NOT EXISTS idx_outputs_equipment ON outputs(equipment_id);
CREATE INDEX IF NOT EXISTS idx_outputs_date ON outputs(date);
CREATE INDEX IF NOT EXISTS idx_outputs_active ON outputs(active);
-- Output details indexes
CREATE INDEX IF NOT EXISTS idx_output_details_output ON output_details(output_id);
CREATE INDEX IF NOT EXISTS idx_output_details_spare_part ON output_details(spare_part_id);
-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
DROP TRIGGER IF EXISTS update_entries_updated_at ON entries;
CREATE TRIGGER update_entries_updated_at BEFORE
UPDATE ON entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_outputs_updated_at ON outputs;
CREATE TRIGGER update_outputs_updated_at BEFORE
UPDATE ON outputs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Inventory movements tables created successfully!' AS status;
SELECT COUNT(*) AS entry_count
FROM entries;
SELECT COUNT(*) AS entry_detail_count
FROM entry_details;
SELECT COUNT(*) AS output_count
FROM outputs;
SELECT COUNT(*) AS output_detail_count
FROM output_details;
-- ============================================
-- NOTA SOBRE DATOS DE EJEMPLO
-- ============================================
-- Los datos de ejemplo han sido removidos para evitar
-- errores de foreign key constraints en deploy automático.
-- Los datos se deben crear a través de la aplicación web
-- una vez que el sistema esté en funcionamiento.
-- ============================================