const db = require('../config/db');

class OutputModel {
  static async create(outputData, organizationId, client = null) {
    const dbClient = client || db;
    const { technician_id, equipment_id, notes } = outputData;

    const query = `
      INSERT INTO outputs (technician_id, equipment_id, notes, organization_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, technician_id, equipment_id, date, notes, active, created_at, updated_at
    `;

    const result = await dbClient.query(query, [technician_id, equipment_id, notes, organizationId]);
    return result.rows[0];
  }

  static async createDetail(detailData, organizationId, client = null) {
    const dbClient = client || db;
    const { output_id, spare_part_id, quantity } = detailData;

    const query = `
      INSERT INTO output_details (output_id, spare_part_id, quantity, organization_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, output_id, spare_part_id, quantity, created_at
    `;

    const result = await dbClient.query(query, [output_id, spare_part_id, quantity, organizationId]);
    return result.rows[0];
  }

  static async updateStock(spare_part_id, quantity, organizationId, client = null) {
    const dbClient = client || db;

    const query = `
      UPDATE spare_parts
      SET stock = stock - $1
      WHERE id = $2 AND organization_id = $3
      RETURNING id, name, stock
    `;

    const result = await dbClient.query(query, [quantity, spare_part_id, organizationId]);
    return result.rows[0];
  }

  static async findById(id, organizationId) {
    const query = `
      SELECT 
        o.id,
        o.technician_id,
        u.name as technician_name,
        o.equipment_id,
        e.code as equipment_code,
        e.type as equipment_type,
        o.date,
        o.notes,
        o.active,
        o.created_at,
        o.updated_at
      FROM outputs o
      LEFT JOIN users u ON o.technician_id = u.id
      LEFT JOIN equipments e ON o.equipment_id = e.id
      WHERE o.id = $1 AND o.organization_id = $2 AND o.active = true
    `;

    const result = await db.query(query, [id, organizationId]);
    return result.rows[0];
  }

  static async findDetailsByOutputId(output_id, organizationId) {
    const query = `
      SELECT 
        od.id,
        od.output_id,
        od.spare_part_id,
        sp.name as spare_part_name,
        od.quantity,
        od.created_at
      FROM output_details od
      LEFT JOIN spare_parts sp ON od.spare_part_id = sp.id
      WHERE od.output_id = $1 AND od.organization_id = $2
      ORDER BY od.id ASC
    `;

    const result = await db.query(query, [output_id, organizationId]);
    return result.rows;
  }

  static async getSparePartById(id, organizationId, client = null) {
    const dbClient = client || db;

    const query = `
      SELECT id, name, stock
      FROM spare_parts
      WHERE id = $1 AND organization_id = $2 AND active = true
    `;

    const result = await dbClient.query(query, [id, organizationId]);
    return result.rows[0];
  }

  static async findAll(organizationId, filters = {}) {
    const { dateFrom, dateTo } = filters;
    let query = `
      SELECT 
        o.id,
        o.technician_id,
        u.name as technician_name,
        o.equipment_id,
        e.code as equipment_code,
        e.type as equipment_type,
        o.date,
        o.notes,
        o.created_at
      FROM outputs o
      LEFT JOIN users u ON o.technician_id = u.id AND u.organization_id = $1
      LEFT JOIN equipments e ON o.equipment_id = e.id AND e.organization_id = $1
      WHERE o.organization_id = $1 AND o.active = true
    `;

    const params = [organizationId];

    if (dateFrom) {
      params.push(dateFrom);
      query += ` AND o.date >= $${params.length}`;
    }

    if (dateTo) {
      params.push(dateTo);
      query += ` AND o.date <= $${params.length}`;
    }

    query += ` ORDER BY o.date DESC, o.id DESC`;

    const result = await db.query(query, params);
    return result.rows;
  }
}

module.exports = OutputModel;
