const db = require('../config/db');

class OrganizationModel {
  static async findById(id) {
    const query = `
      SELECT id, name, code, email, phone, address, city, active, created_at
      FROM organizations
      WHERE id = $1 AND active = true
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findByCode(code) {
    const query = `
      SELECT id, name, code, email, phone, address, city, active, created_at
      FROM organizations
      WHERE code = $1
    `;
    const result = await db.query(query, [code]);
    return result.rows[0];
  }

  static async create(organizationData) {
    const { name, code, email, phone, address, city } = organizationData;
    const query = `
      INSERT INTO organizations (name, code, email, phone, address, city, active)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING id, name, code, email, phone, address, city, active, created_at
    `;
    const result = await db.query(query, [name, code, email, phone, address, city]);
    return result.rows[0];
  }

  static async getAll() {
    const query = `
      SELECT id, name, code, email, phone, address, city, active, created_at
      FROM organizations
      WHERE active = true
      ORDER BY created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  static async update(id, organizationData) {
    const { name, email, phone, address, city, active } = organizationData;
    const query = `
      UPDATE organizations
      SET name = $1, email = $2, phone = $3, address = $4, city = $5, active = $6
      WHERE id = $7
      RETURNING id, name, code, email, phone, address, city, active, created_at
    `;
    const result = await db.query(query, [name, email, phone, address, city, active, id]);
    return result.rows[0];
  }
}

module.exports = OrganizationModel;
