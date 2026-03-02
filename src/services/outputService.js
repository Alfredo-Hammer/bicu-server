const db = require('../config/db');
const OutputModel = require('../models/outputModel');

class OutputService {
  static async createOutput(outputData, userId, organizationId) {
    const { technician_id, equipment_id, details, notes } = outputData;

    if (!technician_id) {
      throw new Error('Technician is required');
    }

    if (!equipment_id) {
      throw new Error('Equipment is required');
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
    }

    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      for (const detail of details) {
        const sparePart = await OutputModel.getSparePartById(detail.spare_part_id, organizationId, client);

        if (!sparePart) {
          throw new Error(`Spare part not found: ${detail.spare_part_id}`);
        }

        if (sparePart.stock < detail.quantity) {
          throw new Error(`Insufficient stock for ${sparePart.name}. Available: ${sparePart.stock}, Requested: ${detail.quantity}`);
        }
      }

      const output = await OutputModel.create(
        {
          technician_id,
          equipment_id,
          notes: notes || null
        },
        organizationId,
        client
      );

      const outputDetails = [];

      for (const detail of details) {
        const sparePart = await OutputModel.getSparePartById(detail.spare_part_id, organizationId, client);

        const outputDetail = await OutputModel.createDetail(
          {
            output_id: output.id,
            spare_part_id: detail.spare_part_id,
            quantity: detail.quantity
          },
          organizationId,
          client
        );

        await OutputModel.updateStock(detail.spare_part_id, detail.quantity, organizationId, client);

        outputDetails.push({
          ...outputDetail,
          spare_part_name: sparePart.name
        });
      }

      await client.query('COMMIT');

      return {
        output,
        details: outputDetails
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getOutputById(id, organizationId) {
    const output = await OutputModel.findById(id, organizationId);

    if (!output) {
      throw new Error('Output not found');
    }

    const details = await OutputModel.findDetailsByOutputId(id, organizationId);

    return {
      ...output,
      details
    };
  }

  static async getAllOutputs(organizationId, filters = {}) {
    const outputs = await OutputModel.findAll(organizationId, filters);

    // Get details for each output
    const outputsWithDetails = await Promise.all(
      outputs.map(async (output) => {
        const details = await OutputModel.findDetailsByOutputId(output.id, organizationId);
        return {
          ...output,
          details
        };
      })
    );

    return outputsWithDetails;
  }
}

module.exports = OutputService;
