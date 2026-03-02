const db = require('../config/db');

class EquipmentModel {
  static async findAll(organizationId) {
    const query = `
      SELECT 
        e.id, e.code, e.type, e.brand, e.model, e.serial_number, e.location, 
        e.status, e.image_url, e.created_at, e.updated_at,
        COUNT(er.id) as repair_count,
        MAX(er.repair_date) as last_repair_date
      FROM equipments e
      LEFT JOIN equipment_repairs er ON e.id = er.equipment_id
      WHERE e.organization_id = $1
      GROUP BY e.id
      ORDER BY e.code ASC
    `;
    const result = await db.query(query, [organizationId]);
    return result.rows;
  }

  static async findById(id, organizationId) {
    const query = `
      SELECT 
        e.id, e.code, e.type, e.brand, e.model, e.serial_number, e.location, 
        e.status, e.image_url, e.created_at, e.updated_at,
        COUNT(er.id) as repair_count,
        MAX(er.repair_date) as last_repair_date
      FROM equipments e
      LEFT JOIN equipment_repairs er ON e.id = er.equipment_id
      WHERE e.id = $1 AND e.organization_id = $2
      GROUP BY e.id
    `;
    const result = await db.query(query, [id, organizationId]);
    return result.rows[0];
  }

  static async findByCode(code, organizationId) {
    const query = `
      SELECT id, code, type, brand, model, serial_number, location, status, image_url, created_at, updated_at
      FROM equipments
      WHERE LOWER(code) = LOWER($1) AND organization_id = $2
    `;
    const result = await db.query(query, [code, organizationId]);
    return result.rows[0];
  }

  static async findByFilters(filters, organizationId) {
    let query = `
      SELECT 
        e.id, e.code, e.type, e.brand, e.model, e.serial_number, e.location, 
        e.status, e.image_url, e.created_at, e.updated_at,
        COUNT(er.id) as repair_count,
        MAX(er.repair_date) as last_repair_date
      FROM equipments e
      LEFT JOIN equipment_repairs er ON e.id = er.equipment_id
      WHERE e.organization_id = $1
    `;
    
    const params = [organizationId];
    let paramCount = 2;

    if (filters.type) {
      query += ` AND LOWER(e.type) = LOWER($${paramCount})`;
      params.push(filters.type);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND e.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (LOWER(e.code) LIKE LOWER($${paramCount}) OR LOWER(e.brand) LIKE LOWER($${paramCount}) OR LOWER(e.model) LIKE LOWER($${paramCount}))`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    query += ` GROUP BY e.id ORDER BY e.code ASC`;

    const result = await db.query(query, params);
    return result.rows;
  }

  static async create(equipmentData, organizationId) {
    const { code, type, brand, model, serial_number, location, status, image_url } = equipmentData;
    const query = `
      INSERT INTO equipments (code, type, brand, model, serial_number, location, status, image_url, organization_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, code, type, brand, model, serial_number, location, status, image_url, created_at, updated_at
    `;
    const result = await db.query(query, [
      code,
      type,
      brand || null,
      model || null,
      serial_number || null,
      location || null,
      status || 'active',
      image_url || null,
      organizationId
    ]);
    return result.rows[0];
  }

  static async update(id, equipmentData, organizationId) {
    const { code, type, brand, model, serial_number, location, status, image_url } = equipmentData;
    
    let query = `UPDATE equipments SET code = $1, type = $2, brand = $3, model = $4, serial_number = $5, location = $6, status = $7`;
    const params = [code, type, brand, model, serial_number, location, status];
    
    if (image_url !== undefined) {
      query += `, image_url = $8 WHERE id = $9 AND organization_id = $10`;
      params.push(image_url, id, organizationId);
    } else {
      query += ` WHERE id = $8 AND organization_id = $9`;
      params.push(id, organizationId);
    }
    
    query += ` RETURNING id, code, type, brand, model, serial_number, location, status, image_url, created_at, updated_at`;
    const result = await db.query(query, params);
    return result.rows[0];
  }

  static async updateStatus(id, status, organizationId) {
    const query = `
      UPDATE equipments
      SET status = $1
      WHERE id = $2 AND organization_id = $3
      RETURNING id, code, status
    `;
    const result = await db.query(query, [status, id, organizationId]);
    return result.rows[0];
  }

  static async softDelete(id, organizationId) {
    const query = `
      UPDATE equipments
      SET status = 'retired'
      WHERE id = $1 AND organization_id = $2
      RETURNING id, code, status
    `;
    const result = await db.query(query, [id, organizationId]);
    return result.rows[0];
  }
}

module.exports = EquipmentModel;
