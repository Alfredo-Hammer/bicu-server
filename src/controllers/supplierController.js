const SupplierService = require('../services/supplierService');
const AuditService = require('../services/auditService');
const messages = require('../utils/messages');

class SupplierController {
  static async getAll(req, res) {
    try {
      const { organizationId } = req.user;
      const suppliers = await SupplierService.getAllSuppliers(organizationId);

      return res.status(200).json({
        success: true,
        message: messages.suppliers.retrieved,
        data: suppliers
      });
    } catch (error) {
      console.error('Get suppliers error:', error);
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
      const supplier = await SupplierService.getSupplierById(id, organizationId);

      return res.status(200).json({
        success: true,
        message: messages.general.retrieved,
        data: supplier
      });
    } catch (error) {
      if (error.message === 'Supplier not found') {
        return res.status(404).json({
          success: false,
          message: messages.suppliers.notFound,
          data: null
        });
      }

      console.error('Get supplier error:', error);
      return res.status(500).json({
        success: false,
        message: messages.general.serverError,
        data: null
      });
    }
  }

  static async create(req, res) {
    try {
      const { name, phone, email, address } = req.body;
      const { organizationId } = req.user;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: messages.suppliers.nameRequired,
          data: null
        });
      }

      const supplier = await SupplierService.createSupplier({ name, phone, email, address }, organizationId);

      AuditService.log({
        user_id: req.user.id,
        organization_id: organizationId,
        action: 'CREATE',
        entity_type: 'supplier',
        entity_id: supplier.id,
        description: `Proveedor creado: ${supplier.name}`,
        ip_address: req.ip,
      });

      return res.status(201).json({
        success: true,
        message: messages.suppliers.created,
        data: supplier
      });
    } catch (error) {
      if (error.message === 'Supplier with same name and phone already exists') {
        return res.status(409).json({
          success: false,
          message: messages.suppliers.duplicateNamePhone,
          data: null
        });
      }

      console.error('Create supplier error:', error);
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
      const { name, phone, email, address } = req.body;
      const { organizationId } = req.user;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: messages.suppliers.nameRequired,
          data: null
        });
      }

      const supplier = await SupplierService.updateSupplier(id, { name, phone, email, address }, organizationId);

      AuditService.log({
        user_id: req.user.id,
        organization_id: organizationId,
        action: 'UPDATE',
        entity_type: 'supplier',
        entity_id: supplier.id,
        description: `Proveedor actualizado: ${supplier.name}`,
        ip_address: req.ip,
      });

      return res.status(200).json({
        success: true,
        message: messages.suppliers.updated,
        data: supplier
      });
    } catch (error) {
      if (error.message === 'Supplier not found') {
        return res.status(404).json({
          success: false,
          message: messages.suppliers.notFound,
          data: null
        });
      }

      if (error.message === 'Supplier with same name and phone already exists') {
        return res.status(409).json({
          success: false,
          message: messages.suppliers.duplicateNamePhone,
          data: null
        });
      }

      console.error('Update supplier error:', error);
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
      const supplier = await SupplierService.deleteSupplier(id, organizationId);

      AuditService.log({
        user_id: req.user.id,
        organization_id: organizationId,
        action: 'DELETE',
        entity_type: 'supplier',
        entity_id: id,
        description: `Proveedor eliminado: ${supplier?.name || id}`,
        ip_address: req.ip,
      });

      return res.status(200).json({
        success: true,
        message: messages.suppliers.deleted,
        data: supplier
      });
    } catch (error) {
      if (error.message === 'Supplier not found') {
        return res.status(404).json({
          success: false,
          message: messages.suppliers.notFound,
          data: null
        });
      }

      console.error('Delete supplier error:', error);
      return res.status(500).json({
        success: false,
        message: messages.general.serverError,
        data: null
      });
    }
  }
}

module.exports = SupplierController;
