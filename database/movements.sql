-- ============================================
-- INVENTORY MOVEMENTS (KARDEX) MODULE
-- Entries and Outputs with Automatic Stock Control
-- ============================================

-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS output_details CASCADE;
DROP TABLE IF EXISTS outputs CASCADE;
DROP TABLE IF EXISTS entry_details CASCADE;
DROP TABLE IF EXISTS entries CASCADE;

-- ============================================
-- ENTRIES TABLE (Purchases/Stock Additions)
-- ============================================
CREATE TABLE entries (
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
CREATE TABLE entry_details (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  spare_part_id INTEGER NOT NULL REFERENCES spare_parts(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- OUTPUTS TABLE (Usage in Repairs)
-- ============================================
CREATE TABLE outputs (
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
CREATE TABLE output_details (
  id SERIAL PRIMARY KEY,
  output_id INTEGER NOT NULL REFERENCES outputs(id) ON DELETE CASCADE,
  spare_part_id INTEGER NOT NULL REFERENCES spare_parts(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Entries indexes
CREATE INDEX idx_entries_supplier ON entries(supplier_id);
CREATE INDEX idx_entries_user ON entries(user_id);
CREATE INDEX idx_entries_date ON entries(date);
CREATE INDEX idx_entries_active ON entries(active);

-- Entry details indexes
CREATE INDEX idx_entry_details_entry ON entry_details(entry_id);
CREATE INDEX idx_entry_details_spare_part ON entry_details(spare_part_id);

-- Outputs indexes
CREATE INDEX idx_outputs_technician ON outputs(technician_id);
CREATE INDEX idx_outputs_equipment ON outputs(equipment_id);
CREATE INDEX idx_outputs_date ON outputs(date);
CREATE INDEX idx_outputs_active ON outputs(active);

-- Output details indexes
CREATE INDEX idx_output_details_output ON output_details(output_id);
CREATE INDEX idx_output_details_spare_part ON output_details(spare_part_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_entries_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outputs_updated_at
  BEFORE UPDATE ON outputs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Sample entry (purchase from supplier)
INSERT INTO entries (supplier_id, user_id, notes) VALUES
(1, 1, 'Compra inicial de repuestos para laboratorio');

-- Sample entry details
INSERT INTO entry_details (entry_id, spare_part_id, quantity, unit_price) VALUES
(1, 1, 50, 15.50),
(1, 2, 30, 45.00);

-- Update stock for these entries (manual for initial data)
UPDATE spare_parts SET stock = stock + 50 WHERE id = 1;
UPDATE spare_parts SET stock = stock + 30 WHERE id = 2;

-- Sample output (repair usage)
INSERT INTO outputs (technician_id, equipment_id, notes) VALUES
(1, 1, 'Reparación de PC en Laboratorio 1');

-- Sample output details
INSERT INTO output_details (output_id, spare_part_id, quantity) VALUES
(1, 1, 2),
(1, 2, 1);

-- Update stock for these outputs (manual for initial data)
UPDATE spare_parts SET stock = stock - 2 WHERE id = 1;
UPDATE spare_parts SET stock = stock - 1 WHERE id = 2;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Inventory movements tables created successfully!' AS status;

SELECT COUNT(*) AS entry_count FROM entries;
SELECT COUNT(*) AS entry_detail_count FROM entry_details;
SELECT COUNT(*) AS output_count FROM outputs;
SELECT COUNT(*) AS output_detail_count FROM output_details;

-- Show current stock after movements
SELECT id, name, stock FROM spare_parts WHERE id IN (1, 2);
