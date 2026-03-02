const EquipmentService = require('../services/equipmentService');
const messages = require('../utils/messages');

class EquipmentController {
  static async getAll(req, res) {
    try {
      const { type, status, search } = req.query;
      const { organizationId } = req.user;
      
      const filters = {
        type,
        status,
        search
      };

      const equipments = await EquipmentService.getAllEquipments(filters, organizationId);
      
      return res.status(200).json({
        success: true,
        message: messages.equipments.retrieved,
        data: equipments
      });
    } catch (error) {
      console.error('Get equipments error:', error);
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
      const equipment = await EquipmentService.getEquipmentById(id, organizationId);
      
      return res.status(200).json({
        success: true,
        message: messages.general.retrieved,
        data: equipment
      });
    } catch (error) {
      if (error.message === 'Equipment not found') {
        return res.status(404).json({
          success: false,
          message: messages.equipments.notFound,
          data: null
        });
      }

      console.error('Get equipment error:', error);
      return res.status(500).json({
        success: false,
        message: messages.general.serverError,
        data: null
      });
    }
  }

  static async create(req, res) {
    try {
      const { code, type, brand, model, serial_number, location, status } = req.body;
      const { organizationId } = req.user;
      const image = req.file;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: messages.equipments.codeRequired,
          data: null
        });
      }

      if (!type) {
        return res.status(400).json({
          success: false,
          message: messages.equipments.typeRequired,
          data: null
        });
      }

      const equipment = await EquipmentService.createEquipment({
        code,
        type,
        brand,
        model,
        serial_number,
        location,
        status,
        image
      }, organizationId);
      
      return res.status(201).json({
        success: true,
        message: messages.equipments.created,
        data: equipment
      });
    } catch (error) {
      if (error.message === 'Equipment code already exists') {
        return res.status(409).json({
          success: false,
          message: messages.equipments.duplicateCode,
          data: null
        });
      }

      if (error.message.includes('Invalid equipment type')) {
        return res.status(400).json({
          success: false,
          message: messages.equipments.invalidType.replace('{types}', 'PC, Laptop, Printer, Server, Monitor, Scanner, Router, Switch'),
          data: null
        });
      }

      if (error.message.includes('Invalid status')) {
        return res.status(400).json({
          success: false,
          message: messages.equipments.invalidStatus.replace('{statuses}', 'active, in_repair, retired'),
          data: null
        });
      }

      console.error('Create equipment error:', error);
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
      const { code, type, brand, model, serial_number, location, status } = req.body;
      const { organizationId } = req.user;
      const image = req.file;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: messages.equipments.codeRequired,
          data: null
        });
      }

      if (!type) {
        return res.status(400).json({
          success: false,
          message: messages.equipments.typeRequired,
          data: null
        });
      }

      const equipment = await EquipmentService.updateEquipment(id, {
        code,
        type,
        brand,
        model,
        serial_number,
        location,
        status,
        image
      }, organizationId);
      
      return res.status(200).json({
        success: true,
        message: messages.equipments.updated,
        data: equipment
      });
    } catch (error) {
      if (error.message === 'Equipment not found') {
        return res.status(404).json({
          success: false,
          message: messages.equipments.notFound,
          data: null
        });
      }

      if (error.message === 'Equipment code already exists') {
        return res.status(409).json({
          success: false,
          message: messages.equipments.duplicateCode,
          data: null
        });
      }

      if (error.message.includes('Invalid equipment type')) {
        return res.status(400).json({
          success: false,
          message: messages.equipments.invalidType.replace('{types}', 'PC, Laptop, Printer, Server, Monitor, Scanner, Router, Switch'),
          data: null
        });
      }

      if (error.message.includes('Invalid status')) {
        return res.status(400).json({
          success: false,
          message: messages.equipments.invalidStatus.replace('{statuses}', 'active, in_repair, retired'),
          data: null
        });
      }

      console.error('Update equipment error:', error);
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
      const equipment = await EquipmentService.deleteEquipment(id, organizationId);
      
      return res.status(200).json({
        success: true,
        message: messages.equipments.deleted,
        data: equipment
      });
    } catch (error) {
      if (error.message === 'Equipment not found') {
        return res.status(404).json({
          success: false,
          message: messages.equipments.notFound,
          data: null
        });
      }

      console.error('Delete equipment error:', error);
      return res.status(500).json({
        success: false,
        message: messages.general.serverError,
        data: null
      });
    }
  }
}

module.exports = EquipmentController;
