const OutputService = require('../services/outputService');
const AuditService = require('../services/auditService');
const messages = require('../utils/messages');

class OutputController {
  static async create(req, res) {
    try {
      const { technician_id, equipment_id, details, notes } = req.body;
      const userId = req.user.id;
      const { organizationId } = req.user;

      if (!technician_id) {
        return res.status(400).json({
          success: false,
          message: messages.outputs.technicianRequired,
          data: null
        });
      }

      if (!equipment_id) {
        return res.status(400).json({
          success: false,
          message: messages.outputs.equipmentRequired,
          data: null
        });
      }

      if (!details || !Array.isArray(details) || details.length === 0) {
        return res.status(400).json({
          success: false,
          message: messages.outputs.detailsRequired,
          data: null
        });
      }

      const result = await OutputService.createOutput({ technician_id, equipment_id, details, notes }, userId, organizationId);

      AuditService.log({
        user_id: userId,
        organization_id: organizationId,
        action: 'CREATE',
        entity_type: 'output',
        entity_id: result?.id || null,
        description: `Salida de inventario registrada, equipo ID: ${equipment_id}`,
        ip_address: req.ip,
      });

      return res.status(201).json({
        success: true,
        message: messages.outputs.created,
        data: result
      });
    } catch (error) {
      if (error.message === 'Technician is required') {
        return res.status(400).json({
          success: false,
          message: messages.outputs.technicianRequired,
          data: null
        });
      }

      if (error.message === 'Equipment is required') {
        return res.status(400).json({
          success: false,
          message: messages.outputs.equipmentRequired,
          data: null
        });
      }

      if (error.message === 'At least one spare part is required') {
        return res.status(400).json({
          success: false,
          message: messages.outputs.detailsRequired,
          data: null
        });
      }

      if (error.message === 'Quantity must be greater than zero') {
        return res.status(400).json({
          success: false,
          message: messages.outputs.invalidQuantity,
          data: null
        });
      }

      if (error.message.includes('Insufficient stock')) {
        const parts = error.message.match(/for (.+)\. Available: (\d+), Requested: (\d+)/);
        if (parts) {
          const [, name, available, requested] = parts;
          return res.status(400).json({
            success: false,
            message: messages.outputs.insufficientStock
              .replace('{name}', name)
              .replace('{available}', available)
              .replace('{requested}', requested),
            data: null
          });
        }
      }

      if (error.message.includes('Spare part not found')) {
        const sparePartId = error.message.split(': ')[1];
        return res.status(404).json({
          success: false,
          message: messages.outputs.sparePartNotFound.replace('{name}', sparePartId),
          data: null
        });
      }

      console.error('Create output error:', error);
      return res.status(500).json({
        success: false,
        message: messages.outputs.transactionFailed,
        data: null
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const { organizationId } = req.user;
      const output = await OutputService.getOutputById(id, organizationId);

      return res.status(200).json({
        success: true,
        message: messages.outputs.retrieved,
        data: output
      });
    } catch (error) {
      if (error.message === 'Output not found') {
        return res.status(404).json({
          success: false,
          message: messages.outputs.notFound,
          data: null
        });
      }

      console.error('Get output error:', error);
      return res.status(500).json({
        success: false,
        message: messages.general.serverError,
        data: null
      });
    }
  }

  static async getAll(req, res) {
    try {
      const { organizationId } = req.user;
      const { dateFrom, dateTo } = req.query;

      const filters = {};
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;

      const outputs = await OutputService.getAllOutputs(organizationId, filters);

      return res.status(200).json({
        success: true,
        message: messages.outputs.retrieved,
        data: outputs
      });
    } catch (error) {
      console.error('Get all outputs error:', error);
      return res.status(500).json({
        success: false,
        message: messages.general.serverError,
        data: null
      });
    }
  }
}

module.exports = OutputController;
