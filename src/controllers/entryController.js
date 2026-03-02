const EntryService = require('../services/entryService');
const AuditService = require('../services/auditService');
const messages = require('../utils/messages');

class EntryController {
  static async create(req, res) {
    try {
      const { supplier_id, details, notes } = req.body;
      const userId = req.user.id;
      const { organizationId } = req.user;

      if (!supplier_id) {
        return res.status(400).json({
          success: false,
          message: messages.entries.supplierRequired,
          data: null
        });
      }

      if (!details || !Array.isArray(details) || details.length === 0) {
        return res.status(400).json({
          success: false,
          message: messages.entries.detailsRequired,
          data: null
        });
      }

      const result = await EntryService.createEntry({ supplier_id, details, notes }, userId, organizationId);

      AuditService.log({
        user_id: userId,
        organization_id: organizationId,
        action: 'CREATE',
        entity_type: 'entry',
        entity_id: result?.id || null,
        description: `Entrada de inventario registrada, proveedor ID: ${supplier_id}`,
        ip_address: req.ip,
      });

      return res.status(201).json({
        success: true,
        message: messages.entries.created,
        data: result
      });
    } catch (error) {
      if (error.message === 'Supplier is required') {
        return res.status(400).json({
          success: false,
          message: messages.entries.supplierRequired,
          data: null
        });
      }

      if (error.message === 'At least one spare part is required') {
        return res.status(400).json({
          success: false,
          message: messages.entries.detailsRequired,
          data: null
        });
      }

      if (error.message === 'Quantity must be greater than zero') {
        return res.status(400).json({
          success: false,
          message: messages.entries.invalidQuantity,
          data: null
        });
      }

      if (error.message === 'Unit price must be greater than or equal to zero') {
        return res.status(400).json({
          success: false,
          message: messages.entries.invalidPrice,
          data: null
        });
      }

      if (error.message.includes('Spare part not found')) {
        const sparePartId = error.message.split(': ')[1];
        return res.status(404).json({
          success: false,
          message: messages.entries.sparePartNotFound.replace('{name}', sparePartId),
          data: null
        });
      }

      console.error('Create entry error:', error);
      return res.status(500).json({
        success: false,
        message: messages.entries.transactionFailed,
        data: null
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const { organizationId } = req.user;
      const entry = await EntryService.getEntryById(id, organizationId);

      return res.status(200).json({
        success: true,
        message: messages.entries.retrieved,
        data: entry
      });
    } catch (error) {
      if (error.message === 'Entry not found') {
        return res.status(404).json({
          success: false,
          message: messages.entries.notFound,
          data: null
        });
      }

      console.error('Get entry error:', error);
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

      const entries = await EntryService.getAllEntries(organizationId, filters);

      return res.status(200).json({
        success: true,
        message: messages.entries.retrieved,
        data: entries
      });
    } catch (error) {
      console.error('Get all entries error:', error);
      return res.status(500).json({
        success: false,
        message: messages.general.serverError,
        data: null
      });
    }
  }
}

module.exports = EntryController;
