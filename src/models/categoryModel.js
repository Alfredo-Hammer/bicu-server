const db = require('../config/db');

class CategoryModel {
  static async findAll(organizationId) {
    const query = `
      SELECT id, name, description, active, created_at, updated_at
      FROM categories
      WHERE active = true AND organization_id = $1
      ORDER BY name ASC
    `;
    const result = await db.query(query, [organizationId]);
    return result.rows;
  }

  static async findById(id, organizationId) {
    const query = `
      SELECT id, name, description, active, created_at, updated_at
      FROM categories
      WHERE id = $1 AND organization_id = $2 AND active = true
    `;
    const result = await db.query(query, [id, organizationId]);
    return result.rows[0];
  }

  static async findByName(name, organizationId) {
    const query = `
      SELECT id, name, description, active, created_at, updated_at
      FROM categories
      WHERE LOWER(name) = LOWER($1) AND organization_id = $2 AND active = true
    `;
    const result = await db.query(query, [name, organizationId]);
    return result.rows[0];
  }

  static async create(categoryData, organizationId) {
    const { name, description } = categoryData;
    const query = `
      INSERT INTO categories (name, description, organization_id)
      VALUES ($1, $2, $3)
      RETURNING id, name, description, active, created_at, updated_at
    `;
    const result = await db.query(query, [name, description, organizationId]);
    return result.rows[0];
  }

  static async update(id, categoryData, organizationId) {
    const { name, description } = categoryData;
    const query = `
      UPDATE categories
      SET name = $1, description = $2
      WHERE id = $3 AND organization_id = $4 AND active = true
      RETURNING id, name, description, active, created_at, updated_at
    `;
    const result = await db.query(query, [name, description, id, organizationId]);
    return result.rows[0];
  }

  static async softDelete(id, organizationId) {
    const query = `
      UPDATE categories
      SET active = false
      WHERE id = $1 AND organization_id = $2
      RETURNING id, name, active
    `;
    const result = await db.query(query, [id, organizationId]);
    return result.rows[0];
  }

  static async countSparePartsByCategory(categoryId, organizationId) {
    const query = `
      SELECT COUNT(*) as count
      FROM spare_parts
      WHERE category_id = $1 AND organization_id = $2 AND active = true
    `;
    const result = await db.query(query, [categoryId, organizationId]);
    return parseInt(result.rows[0].count);
  }
}

module.exports = CategoryModel;
