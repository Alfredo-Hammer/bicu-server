const SparePartService = require('../services/sparePartService');
const AuditService = require('../services/auditService');
const messages = require('../utils/messages');

class SparePartController {
  static async getAll(req, res) {
    try {
      const { search, category, lowStock } = req.query;
      const { organizationId } = req.user;

      const filters = {
        search,
        category_id: category,
        lowStock
      };

      const spareParts = await SparePartService.getAllSpareParts(filters, organizationId);

      return res.status(200).json({
        success: true,
        message: messages.spareParts.retrieved,
        data: spareParts
      });
    } catch (error) {
      console.error('Get spare parts error:', error);
      return res.status(500).json({
        success: false,
        message: messages.general.serverError,
        data: null
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const { organizationId } = req.user;
      const sparePart = await SparePartService.getSparePartById(id, organizationId);

      return res.status(200).json({
        success: true,
        message: messages.general.retrieved,
        data: sparePart
      });
    } catch (error) {
      if (error.message === 'Spare part not found') {
        return res.status(404).json({
          success: false,
          message: messages.spareParts.notFound,
          data: null
        });
      }

      console.error('Get spare part error:', error);
      return res.status(500).json({
        success: false,
        message: messages.general.serverError,
        data: null
      });
    }
  }

  static async create(req, res) {
    try {
      const { name, description, category_id, stock, min_stock, location, price, code } = req.body;
      const { organizationId } = req.user;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: messages.spareParts.nameRequired,
          data: null
        });
      }

      // Handle image upload
      let image_url = null;
      if (req.file) {
        image_url = '/uploads/spare-parts/' + req.file.filename;
      }

      const sparePart = await SparePartService.createSparePart({
        name,
        description,
        category_id,
        stock,
        min_stock,
        location,
        price,
        code,
        image_url
      }, organizationId);

      AuditService.log({
        user_id: req.user.id,
        organization_id: organizationId,
        action: 'CREATE',
        entity_type: 'spare_part',
        entity_id: sparePart.id,
        description: `Repuesto creado: ${sparePart.name}`,
        ip_address: req.ip,
      });

      return res.status(201).json({
        success: true,
        message: messages.spareParts.created,
        data: sparePart
      });
    } catch (error) {
      if (error.message === 'Category not found') {
        return res.status(404).json({
          success: false,
          message: messages.spareParts.categoryNotFound,
          data: null
        });
      }

      if (error.message.includes('cannot be negative')) {
        const msg = error.message.includes('Stock') ? messages.spareParts.negativeStock : messages.spareParts.negativeMinStock;
        return res.status(400).json({
          success: false,
          message: msg,
          data: null
        });
      }

      console.error('Create spare part error:', error);
      return res.status(500).json({
        success: false,
        message: messages.general.serverError,
        data: null
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, category_id, stock, min_stock, location, price, code } = req.body;
      const { organizationId } = req.user;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: messages.spareParts.nameRequired,
          data: null
        });
      }

      // Handle image upload
      const updateData = {
        name,
        description,
        category_id,
        stock,
        min_stock,
        location,
        price,
        code
      };

      if (req.file) {
        updateData.image_url = '/uploads/spare-parts/' + req.file.filename;
      }

      const sparePart = await SparePartService.updateSparePart(id, updateData, organizationId);

      AuditService.log({
        user_id: req.user.id,
        organization_id: organizationId,
        action: 'UPDATE',
        entity_type: 'spare_part',
        entity_id: sparePart.id,
        description: `Repuesto actualizado: ${sparePart.name}`,
        ip_address: req.ip,
      });

      return res.status(200).json({
        success: true,
        message: messages.spareParts.updated,
        data: sparePart
      });
    } catch (error) {
      if (error.message === 'Spare part not found') {
        return res.status(404).json({
          success: false,
          message: messages.spareParts.notFound,
          data: null
        });
      }

      if (error.message === 'Category not found') {
        return res.status(404).json({
          success: false,
          message: messages.spareParts.categoryNotFound,
          data: null
        });
      }

      if (error.message.includes('cannot be negative')) {
        const msg = error.message.includes('Stock') ? messages.spareParts.negativeStock : messages.spareParts.negativeMinStock;
        return res.status(400).json({
          success: false,
          message: msg,
          data: null
        });
      }

      console.error('Update spare part error:', error);
      return res.status(500).json({
        success: false,
        message: messages.general.serverError,
        data: null
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const { organizationId } = req.user;
      const sparePart = await SparePartService.deleteSparePart(id, organizationId);

      AuditService.log({
        user_id: req.user.id,
        organization_id: organizationId,
        action: 'DELETE',
        entity_type: 'spare_part',
        entity_id: id,
        description: `Repuesto eliminado: ${sparePart?.name || id}`,
        ip_address: req.ip,
      });

      return res.status(200).json({
        success: true,
        message: messages.spareParts.deleted,
        data: sparePart
      });
    } catch (error) {
      if (error.message === 'Spare part not found') {
        return res.status(404).json({
          success: false,
          message: messages.spareParts.notFound,
          data: null
        });
      }

      console.error('Delete spare part error:', error);
      return res.status(500).json({
        success: false,
        message: messages.general.serverError,
        data: null
      });
    }
  }

  static async getLowStock(req, res) {
    try {
      const { organizationId } = req.user;
      const lowStockItems = await SparePartService.getLowStockItems(organizationId);

      return res.status(200).json({
        success: true,
        message: messages.spareParts.lowStockRetrieved,
        data: lowStockItems
      });
    } catch (error) {
      console.error('Get low stock items error:', error);
      return res.status(500).json({
        success: false,
        message: messages.general.serverError,
        data: null
      });
    }
  }
}

module.exports = SparePartController;
