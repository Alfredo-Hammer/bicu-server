const db = require('../config/db');

class SupplierModel {
  static async findAll(organizationId) {
    const query = `
      SELECT id, name, phone, email, address, active, created_at, updated_at
      FROM suppliers
      WHERE active = true AND organization_id = $1
      ORDER BY name ASC
    `;
    const result = await db.query(query, [organizationId]);
    return result.rows;
  }

  static async findById(id, organizationId) {
    const query = `
      SELECT id, name, phone, email, address, active, created_at, updated_at
      FROM suppliers
      WHERE id = $1 AND organization_id = $2 AND active = true
    `;
    const result = await db.query(query, [id, organizationId]);
    return result.rows[0];
  }

  static async findByNameAndPhone(name, phone, organizationId) {
    const query = `
      SELECT id, name, phone, email, address, active, created_at, updated_at
      FROM suppliers
      WHERE LOWER(name) = LOWER($1) AND phone = $2 AND organization_id = $3 AND active = true
    `;
    const result = await db.query(query, [name, phone, organizationId]);
    return result.rows[0];
  }

  static async create(supplierData, organizationId) {
    const { name, phone, email, address } = supplierData;
    const query = `
      INSERT INTO suppliers (name, phone, email, address, organization_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, phone, email, address, active, created_at, updated_at
    `;
    const result = await db.query(query, [name, phone, email, address, organizationId]);
    return result.rows[0];
  }

  static async update(id, supplierData, organizationId) {
    const { name, phone, email, address } = supplierData;
    const query = `
      UPDATE suppliers
      SET name = $1, phone = $2, email = $3, address = $4
      WHERE id = $5 AND organization_id = $6 AND active = true
      RETURNING id, name, phone, email, address, active, created_at, updated_at
    `;
    const result = await db.query(query, [name, phone, email, address, id, organizationId]);
    return result.rows[0];
  }

  static async softDelete(id, organizationId) {
    const query = `
      UPDATE suppliers
      SET active = false
      WHERE id = $1 AND organization_id = $2
      RETURNING id, name, active
    `;
    const result = await db.query(query, [id, organizationId]);
    return result.rows[0];
  }
}

module.exports = SupplierModel;
