const db = require('../config/db');

class SettingsModel {
  static async get() {
    const query = `
      SELECT * FROM system_settings
      ORDER BY id DESC
      LIMIT 1
    `;
    const result = await db.query(query);
    return result.rows[0];
  }

  static async update(settingsData) {
    const {
      institution_name,
      institution_address,
      institution_phone,
      institution_email,
      logo_url,
      primary_color,
      secondary_color,
      currency_symbol,
      low_stock_threshold
    } = settingsData;

    const query = `
      UPDATE system_settings
      SET 
        institution_name = $1,
        institution_address = $2,
        institution_phone = $3,
        institution_email = $4,
        logo_url = $5,
        primary_color = $6,
        secondary_color = $7,
        currency_symbol = $8,
        low_stock_threshold = $9,
        updated_at = NOW()
      WHERE id = (SELECT id FROM system_settings ORDER BY id DESC LIMIT 1)
      RETURNING *
    `;

    const result = await db.query(query, [
      institution_name,
      institution_address,
      institution_phone,
      institution_email,
      logo_url,
      primary_color,
      secondary_color,
      currency_symbol,
      low_stock_threshold
    ]);

    return result.rows[0];
  }

  static async updateLogo(logoUrl) {
    const query = `
      UPDATE system_settings
      SET logo_url = $1, updated_at = NOW()
      WHERE id = (SELECT id FROM system_settings ORDER BY id DESC LIMIT 1)
      RETURNING *
    `;
    const result = await db.query(query, [logoUrl]);
    return result.rows[0];
  }
}

module.exports = SettingsModel;
