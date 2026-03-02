-- Tabla de Configuración del Sistema
-- Almacena configuraciones globales de la institución

CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  institution_name VARCHAR(255) DEFAULT 'Universidad BICU',
  institution_address TEXT,
  institution_phone VARCHAR(50),
  institution_email VARCHAR(100),
  logo_url VARCHAR(255),
  primary_color VARCHAR(7) DEFAULT '#004B87',
  secondary_color VARCHAR(7) DEFAULT '#F5F5F5',
  currency_symbol VARCHAR(10) DEFAULT 'C$',
  low_stock_threshold INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar configuración por defecto solo si no existe ninguna
INSERT INTO system_settings (
  institution_name,
  institution_address,
  institution_phone,
  institution_email
)
SELECT
  'Universidad BICU',
  'Bilwi, Puerto Cabezas, RAAN, Nicaragua',
  '+505 2792-1234',
  'info@bicu.edu.ni'
WHERE NOT EXISTS (SELECT 1 FROM system_settings LIMIT 1);

-- Comentarios
COMMENT ON TABLE system_settings IS 'Configuración global del sistema';
COMMENT ON COLUMN system_settings.institution_name IS 'Nombre de la institución';
COMMENT ON COLUMN system_settings.logo_url IS 'URL del logo de la institución';
COMMENT ON COLUMN system_settings.primary_color IS 'Color primario en formato hexadecimal';
COMMENT ON COLUMN system_settings.low_stock_threshold IS 'Umbral para alertas de stock bajo';
