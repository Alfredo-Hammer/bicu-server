const db = require('../config/db');

class EntryModel {
  static async create(entryData, organizationId, client = null) {
    const dbClient = client || db;
    const { supplier_id, user_id, notes } = entryData;

    const query = `
      INSERT INTO entries (supplier_id, user_id, notes, organization_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, supplier_id, user_id, date, notes, active, created_at, updated_at
    `;

    const result = await dbClient.query(query, [supplier_id, user_id, notes, organizationId]);
    return result.rows[0];
  }

  static async createDetail(detailData, organizationId, client = null) {
    const dbClient = client || db;
    const { entry_id, spare_part_id, quantity, unit_price } = detailData;

    const query = `
      INSERT INTO entry_details (entry_id, spare_part_id, quantity, unit_price, organization_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, entry_id, spare_part_id, quantity, unit_price, created_at
    `;

    const result = await dbClient.query(query, [entry_id, spare_part_id, quantity, unit_price, organizationId]);
    return result.rows[0];
  }

  static async updateStock(spare_part_id, quantity, organizationId, client = null) {
    const dbClient = client || db;

    const query = `
      UPDATE spare_parts
      SET stock = stock + $1
      WHERE id = $2 AND organization_id = $3
      RETURNING id, name, stock
    `;

    const result = await dbClient.query(query, [quantity, spare_part_id, organizationId]);
    return result.rows[0];
  }

  static async findById(id, organizationId) {
    const query = `
      SELECT 
        e.id,
        e.supplier_id,
        s.name as supplier_name,
        e.user_id,
        u.name as user_name,
        e.date,
        e.notes,
        e.active,
        e.created_at,
        e.updated_at
      FROM entries e
      LEFT JOIN suppliers s ON e.supplier_id = s.id
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.id = $1 AND e.organization_id = $2 AND e.active = true
    `;

    const result = await db.query(query, [id, organizationId]);
    return result.rows[0];
  }

  static async findDetailsByEntryId(entry_id, organizationId) {
    const query = `
      SELECT 
        ed.id,
        ed.entry_id,
        ed.spare_part_id,
        sp.name as spare_part_name,
        ed.quantity,
        ed.unit_price,
        (ed.quantity * ed.unit_price) as subtotal,
        ed.created_at
      FROM entry_details ed
      LEFT JOIN spare_parts sp ON ed.spare_part_id = sp.id
      WHERE ed.entry_id = $1 AND ed.organization_id = $2
      ORDER BY ed.id ASC
    `;

    const result = await db.query(query, [entry_id, organizationId]);
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
        e.id,
        e.supplier_id,
        s.name as supplier_name,
        e.user_id,
        u.name as user_name,
        e.date,
        e.notes,
        e.created_at
      FROM entries e
      LEFT JOIN suppliers s ON e.supplier_id = s.id AND s.organization_id = $1
      LEFT JOIN users u ON e.user_id = u.id AND u.organization_id = $1
      WHERE e.organization_id = $1 AND e.active = true
    `;

    const params = [organizationId];

    if (dateFrom) {
      params.push(dateFrom);
      query += ` AND e.date >= $${params.length}`;
    }

    if (dateTo) {
      params.push(dateTo);
      query += ` AND e.date <= $${params.length}`;
    }

    query += ` ORDER BY e.date DESC, e.id DESC`;

    const result = await db.query(query, params);
    return result.rows;
  }
}

module.exports = EntryModel;
