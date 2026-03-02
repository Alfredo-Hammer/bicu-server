const db = require('../config/db');

class AuditModel {
  static async create(auditData) {
    const { user_id, organization_id, action, entity_type, entity_id, description, ip_address, user_agent } = auditData;

    const query = `
      INSERT INTO audit_logs (user_id, organization_id, action, entity_type, entity_id, description, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await db.query(query, [
      user_id,
      organization_id,
      action,
      entity_type,
      entity_id || null,
      description || null,
      ip_address || null,
      user_agent || null
    ]);

    return result.rows[0];
  }

  static async getAll(filters = {}) {
    const { organizationId, user_id, action, entity_type, date_from, date_to, limit = 100, offset = 0 } = filters;

    let query = `
      SELECT 
        a.id,
        a.user_id,
        u.name as user_name,
        a.action,
        a.entity_type,
        a.entity_id,
        a.description,
        a.ip_address,
        a.created_at
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (organizationId) {
      query += ` AND a.organization_id = $${paramCount}`;
      params.push(organizationId);
      paramCount++;
    }

    if (user_id) {
      query += ` AND a.user_id = $${paramCount}`;
      params.push(user_id);
      paramCount++;
    }

    if (action) {
      query += ` AND a.action = $${paramCount}`;
      params.push(action);
      paramCount++;
    }

    if (entity_type) {
      query += ` AND a.entity_type = $${paramCount}`;
      params.push(entity_type);
      paramCount++;
    }

    if (date_from) {
      query += ` AND a.created_at >= $${paramCount}`;
      params.push(date_from);
      paramCount++;
    }

    if (date_to) {
      query += ` AND a.created_at <= $${paramCount}`;
      params.push(date_to);
      paramCount++;
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  static async getStats(organizationId = null) {
    let query;
    let params = [];

    if (organizationId) {
      query = `
        SELECT 
          COUNT(*) as total_actions,
          COUNT(DISTINCT a.user_id) as total_users,
          COUNT(CASE WHEN a.action = 'CREATE' THEN 1 END) as creates,
          COUNT(CASE WHEN a.action = 'UPDATE' THEN 1 END) as updates,
          COUNT(CASE WHEN a.action = 'DELETE' THEN 1 END) as deletes,
          COUNT(CASE WHEN a.action = 'LOGIN' THEN 1 END) as logins
        FROM audit_logs a
        WHERE a.organization_id = $1
      `;
      params = [organizationId];
    } else {
      query = `
        SELECT 
          COUNT(*) as total_actions,
          COUNT(DISTINCT user_id) as total_users,
          COUNT(CASE WHEN action = 'CREATE' THEN 1 END) as creates,
          COUNT(CASE WHEN action = 'UPDATE' THEN 1 END) as updates,
          COUNT(CASE WHEN action = 'DELETE' THEN 1 END) as deletes,
          COUNT(CASE WHEN action = 'LOGIN' THEN 1 END) as logins
        FROM audit_logs
      `;
    }

    const result = await db.query(query, params);
    return result.rows[0];
  }
}

module.exports = AuditModel;
