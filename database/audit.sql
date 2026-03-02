-- Tabla de Auditoría
-- Registra todas las acciones importantes del sistema

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  description TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento de consultas
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at DESC);

-- Comentarios
COMMENT ON TABLE audit_logs IS 'Registro de auditoría de todas las acciones del sistema';
COMMENT ON COLUMN audit_logs.action IS 'Tipo de acción: CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.';
COMMENT ON COLUMN audit_logs.entity_type IS 'Tipo de entidad afectada: spare_part, entry, output, user, etc.';
COMMENT ON COLUMN audit_logs.entity_id IS 'ID de la entidad afectada';
COMMENT ON COLUMN audit_logs.description IS 'Descripción detallada de la acción';
