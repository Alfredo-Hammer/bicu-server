const db = require('../config/db');
const EntryModel = require('../models/entryModel');

class EntryService {
  static async createEntry(entryData, userId, organizationId) {
    const { supplier_id, details, notes } = entryData;

    if (!supplier_id) {
      throw new Error('Supplier is required');
    }

    if (!details || !Array.isArray(details) || details.length === 0) {
      throw new Error('At least one spare part is required');
    }

    for (const detail of details) {
      if (!detail.spare_part_id) {
        throw new Error('Spare part ID is required');
      }
      if (!detail.quantity || detail.quantity <= 0) {
        throw new Error('Quantity must be greater than zero');
      }
      if (detail.unit_price === undefined || detail.unit_price < 0) {
        throw new Error('Unit price must be greater than or equal to zero');
      }
    }

    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      const entry = await EntryModel.create(
        {
          supplier_id,
          user_id: userId,
          notes: notes || null
        },
        organizationId,
        client
      );

      const entryDetails = [];

      for (const detail of details) {
        const sparePart = await EntryModel.getSparePartById(detail.spare_part_id, organizationId, client);

        if (!sparePart) {
          throw new Error(`Spare part not found: ${detail.spare_part_id}`);
        }

        const entryDetail = await EntryModel.createDetail(
          {
            entry_id: entry.id,
            spare_part_id: detail.spare_part_id,
            quantity: detail.quantity,
            unit_price: detail.unit_price
          },
          organizationId,
          client
        );

        await EntryModel.updateStock(detail.spare_part_id, detail.quantity, organizationId, client);

        entryDetails.push({
          ...entryDetail,
          spare_part_name: sparePart.name
        });
      }

      await client.query('COMMIT');

      return {
        entry,
        details: entryDetails
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getEntryById(id, organizationId) {
    const entry = await EntryModel.findById(id, organizationId);

    if (!entry) {
      throw new Error('Entry not found');
    }

    const details = await EntryModel.findDetailsByEntryId(id, organizationId);

    return {
      ...entry,
      details
    };
  }

  static async getAllEntries(organizationId, filters = {}) {
    const entries = await EntryModel.findAll(organizationId, filters);

    // Get details for each entry
    const entriesWithDetails = await Promise.all(
      entries.map(async (entry) => {
        const details = await EntryModel.findDetailsByEntryId(entry.id, organizationId);
        return {
          ...entry,
          details
        };
      })
    );

    return entriesWithDetails;
  }
}

module.exports = EntryService;
