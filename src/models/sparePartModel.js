const db = require('../config/db');

class SparePartModel {
  static async findAll(organizationId) {
    const query = `
      SELECT 
        sp.id, sp.name, sp.code, sp.description, sp.category_id,
        sp.stock, sp.min_stock, sp.price, sp.location, sp.image_url,
        sp.active, sp.created_at, sp.updated_at,
        c.name as category_name
      FROM spare_parts sp
      LEFT JOIN categories c ON sp.category_id = c.id
      WHERE sp.active = true AND sp.organization_id = $1
      ORDER BY sp.name ASC
    `;
    const result = await db.query(query, [organizationId]);
    return result.rows;
  }

  static async findById(id, organizationId) {
    const query = `
      SELECT 
        sp.id, sp.name, sp.code, sp.description, sp.category_id,
        sp.stock, sp.min_stock, sp.price, sp.location, sp.image_url,
        sp.active, sp.created_at, sp.updated_at,
        c.name as category_name
      FROM spare_parts sp
      LEFT JOIN categories c ON sp.category_id = c.id
      WHERE sp.id = $1 AND sp.organization_id = $2 AND sp.active = true
    `;
    const result = await db.query(query, [id, organizationId]);
    return result.rows[0];
  }

  static async findByFilters(filters, organizationId) {
    let query = `
      SELECT 
        sp.id, sp.name, sp.code, sp.description, sp.category_id,
        sp.stock, sp.min_stock, sp.price, sp.location, sp.image_url,
        sp.active, sp.created_at, sp.updated_at,
        c.name as category_name
      FROM spare_parts sp
      LEFT JOIN categories c ON sp.category_id = c.id
      WHERE sp.active = true AND sp.organization_id = $1
    `;
    
    const params = [organizationId];
    let paramCount = 2;

    if (filters.search) {
      query += ` AND (LOWER(sp.name) LIKE LOWER($${paramCount}) OR LOWER(sp.description) LIKE LOWER($${paramCount}))`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    if (filters.category_id) {
      query += ` AND sp.category_id = $${paramCount}`;
      params.push(filters.category_id);
      paramCount++;
    }

    if (filters.lowStock === true) {
      query += ` AND sp.stock <= sp.min_stock`;
    }

    query += ` ORDER BY sp.name ASC`;

    const result = await db.query(query, params);
    return result.rows;
  }

  static async create(sparePartData, organizationId) {
    const { name, code, description, category_id, stock, min_stock, price, location, image_url } = sparePartData;
    const query = `
      INSERT INTO spare_parts (name, code, description, category_id, stock, min_stock, price, location, image_url, organization_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, name, code, description, category_id, stock, min_stock, price, location, image_url, active, created_at, updated_at
    `;
    const result = await db.query(query, [
      name,
      code || null,
      description || null,
      category_id || null,
      stock || 0,
      min_stock || 1,
      price || null,
      location || null,
      image_url || null,
      organizationId
    ]);
    return result.rows[0];
  }

  static async update(id, sparePartData, organizationId) {
    const { name, code, description, category_id, stock, min_stock, price, location, image_url } = sparePartData;
    
    // Build dynamic update query to only update provided fields
    let updateFields = [];
    let params = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount}`);
      params.push(name);
      paramCount++;
    }
    if (code !== undefined) {
      updateFields.push(`code = $${paramCount}`);
      params.push(code || null);
      paramCount++;
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount}`);
      params.push(description);
      paramCount++;
    }
    if (category_id !== undefined) {
      updateFields.push(`category_id = $${paramCount}`);
      params.push(category_id);
      paramCount++;
    }
    if (stock !== undefined) {
      updateFields.push(`stock = $${paramCount}`);
      params.push(stock);
      paramCount++;
    }
    if (min_stock !== undefined) {
      updateFields.push(`min_stock = $${paramCount}`);
      params.push(min_stock);
      paramCount++;
    }
    if (price !== undefined) {
      updateFields.push(`price = $${paramCount}`);
      params.push(price || null);
      paramCount++;
    }
    if (location !== undefined) {
      updateFields.push(`location = $${paramCount}`);
      params.push(location);
      paramCount++;
    }
    if (image_url !== undefined) {
      updateFields.push(`image_url = $${paramCount}`);
      params.push(image_url);
      paramCount++;
    }

    params.push(id);
    params.push(organizationId);

    const query = `
      UPDATE spare_parts
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount} AND organization_id = $${paramCount + 1} AND active = true
      RETURNING id, name, code, description, category_id, stock, min_stock, price, location, image_url, active, created_at, updated_at
    `;
    const result = await db.query(query, params);
    return result.rows[0];
  }

  static async updateStock(id, newStock, organizationId) {
    const query = `
      UPDATE spare_parts
      SET stock = $1
      WHERE id = $2 AND organization_id = $3 AND active = true
      RETURNING id, stock
    `;
    const result = await db.query(query, [newStock, id, organizationId]);
    return result.rows[0];
  }

  static async softDelete(id, organizationId) {
    const query = `
      UPDATE spare_parts
      SET active = false
      WHERE id = $1 AND organization_id = $2
      RETURNING id, name, active
    `;
    const result = await db.query(query, [id, organizationId]);
    return result.rows[0];
  }

  static async getLowStockItems(organizationId) {
    const query = `
      SELECT 
        sp.id, sp.name, sp.stock, sp.min_stock,
        c.name as category_name
      FROM spare_parts sp
      LEFT JOIN categories c ON sp.category_id = c.id
      WHERE sp.active = true AND sp.organization_id = $1 AND sp.stock <= sp.min_stock
      ORDER BY sp.stock ASC
    `;
    const result = await db.query(query, [organizationId]);
    return result.rows;
  }
}

module.exports = SparePartModel;
