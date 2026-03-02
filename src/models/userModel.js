const db = require('../config/db');

class UserModel {
  static async findByEmail(email) {
    const query = `
      SELECT id, name, email, password_hash, role, active, profile_image, organization_id, created_at
      FROM users
      WHERE email = $1 AND active = true
    `;
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id, organizationId = null) {
    let query, params;

    if (organizationId) {
      query = `
        SELECT id, name, apellido, email, movil, cedula, profesion, direccion, estado, role, active, profile_image, organization_id, created_at
        FROM users
        WHERE id = $1 AND organization_id = $2
      `;
      params = [id, organizationId];
    } else {
      query = `
        SELECT id, name, apellido, email, movil, cedula, profesion, direccion, estado, role, active, profile_image, organization_id, created_at
        FROM users
        WHERE id = $1 AND active = true
      `;
      params = [id];
    }

    const result = await db.query(query, params);
    return result.rows[0];
  }

  static async create(userData) {
    const { name, email, password_hash, role, organization_id } = userData;
    const query = `
      INSERT INTO users (name, email, password_hash, role, organization_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, role, active, organization_id, created_at
    `;
    const result = await db.query(query, [name, email, password_hash, role, organization_id]);
    return result.rows[0];
  }

  static async updateLastLogin(userId) {
    const query = `
      UPDATE users
      SET last_login = NOW()
      WHERE id = $1
    `;
    await db.query(query, [userId]);
  }

  static async getAll(organizationId) {
    const query = `
      SELECT id, name, apellido, email, movil, cedula, profesion, direccion, estado, role, active as is_active, profile_image, created_at, last_login
      FROM users
      WHERE organization_id = $1
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [organizationId]);
    return result.rows;
  }

  static async update(id, userData, organizationId) {
    const { name, apellido, email, movil, cedula, profesion, direccion, estado, role, is_active, password_hash } = userData;

    let query, params;

    if (password_hash) {
      query = `
        UPDATE users
        SET name = $1, apellido = $2, email = $3, movil = $4, cedula = $5, profesion = $6, direccion = $7, estado = $8, role = $9, active = $10, password_hash = $11, updated_at = NOW()
        WHERE id = $12 AND organization_id = $13
        RETURNING id, name, apellido, email, movil, cedula, profesion, direccion, estado, role, active as is_active, created_at
      `;
      params = [name, apellido, email, movil, cedula, profesion, direccion, estado, role, is_active, password_hash, id, organizationId];
    } else {
      query = `
        UPDATE users
        SET name = $1, apellido = $2, email = $3, movil = $4, cedula = $5, profesion = $6, direccion = $7, estado = $8, role = $9, active = $10, updated_at = NOW()
        WHERE id = $11 AND organization_id = $12
        RETURNING id, name, apellido, email, movil, cedula, profesion, direccion, estado, role, active as is_active, created_at
      `;
      params = [name, apellido, email, movil, cedula, profesion, direccion, estado, role, is_active, id, organizationId];
    }

    const result = await db.query(query, params);
    return result.rows[0];
  }

  static async delete(id, organizationId) {
    const query = `
      DELETE FROM users
      WHERE id = $1 AND organization_id = $2
      RETURNING id
    `;
    const result = await db.query(query, [id, organizationId]);
    return result.rows[0];
  }

  static async updateProfileImage(id, imageUrl, organizationId = null) {
    let query, params;

    if (organizationId) {
      query = `
        UPDATE users
        SET profile_image = $1, updated_at = NOW()
        WHERE id = $2 AND organization_id = $3
        RETURNING id, name, email, role, profile_image
      `;
      params = [imageUrl, id, organizationId];
    } else {
      query = `
        UPDATE users
        SET profile_image = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, name, email, role, profile_image
      `;
      params = [imageUrl, id];
    }

    const result = await db.query(query, params);
    return result.rows[0];
  }
}

module.exports = UserModel;
