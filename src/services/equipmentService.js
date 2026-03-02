const EquipmentModel = require('../models/equipmentModel');
const path = require('path');
const fs = require('fs').promises;

class EquipmentService {
  static VALID_TYPES = ['PC', 'Laptop', 'Printer', 'Server', 'Monitor', 'Scanner', 'Router', 'Switch'];
  static VALID_STATUSES = ['active', 'in_repair', 'retired'];

  static async getAllEquipments(filters = {}, organizationId) {
    if (filters.type || filters.status || filters.search) {
      return await EquipmentModel.findByFilters(filters, organizationId);
    }
    return await EquipmentModel.findAll(organizationId);
  }

  static async getEquipmentById(id, organizationId) {
    const equipment = await EquipmentModel.findById(id, organizationId);
    if (!equipment) {
      throw new Error('Equipment not found');
    }
    return equipment;
  }

  static async createEquipment(equipmentData, organizationId) {
    const { code, type, brand, model, serial_number, location, status, image } = equipmentData;

    if (!code || code.trim() === '') {
      throw new Error('Equipment code is required');
    }

    if (!type || type.trim() === '') {
      throw new Error('Equipment type is required');
    }

    const existingEquipment = await EquipmentModel.findByCode(code, organizationId);
    if (existingEquipment) {
      throw new Error('Equipment code already exists');
    }

    const equipmentStatus = status || 'active';
    if (!this.VALID_STATUSES.includes(equipmentStatus)) {
      throw new Error(`Invalid status. Valid statuses: ${this.VALID_STATUSES.join(', ')}`);
    }

    let image_url = null;
    if (image) {
      image_url = `/uploads/equipments/${image.filename}`;
    }

    return await EquipmentModel.create({
      code: code.trim().toUpperCase(),
      type: type.trim(),
      brand: brand?.trim() || null,
      model: model?.trim() || null,
      serial_number: serial_number?.trim() || null,
      location: location?.trim() || null,
      status: equipmentStatus,
      image_url
    }, organizationId);
  }

  static async updateEquipment(id, equipmentData, organizationId) {
    const { code, type, brand, model, serial_number, location, status, image } = equipmentData;

    const existingEquipment = await EquipmentModel.findById(id, organizationId);
    if (!existingEquipment) {
      throw new Error('Equipment not found');
    }

    if (!code || code.trim() === '') {
      throw new Error('Equipment code is required');
    }

    if (!type || type.trim() === '') {
      throw new Error('Equipment type is required');
    }

    const equipmentByCode = await EquipmentModel.findByCode(code, organizationId);
    if (equipmentByCode && equipmentByCode.id !== parseInt(id)) {
      throw new Error('Equipment code already exists');
    }

    if (status && !this.VALID_STATUSES.includes(status)) {
      throw new Error(`Invalid status. Valid statuses: ${this.VALID_STATUSES.join(', ')}`);
    }

    const updateData = {
      code: code.trim().toUpperCase(),
      type: type.trim(),
      brand: brand?.trim() || null,
      model: model?.trim() || null,
      serial_number: serial_number?.trim() || null,
      location: location?.trim() || null,
      status: status || existingEquipment.status
    };

    if (image) {
      if (existingEquipment.image_url) {
        const oldImagePath = path.join(__dirname, '../../public', existingEquipment.image_url);
        try {
          await fs.unlink(oldImagePath);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
      updateData.image_url = `/uploads/equipments/${image.filename}`;
    }

    return await EquipmentModel.update(id, updateData, organizationId);
  }

  static async updateEquipmentStatus(id, status, organizationId) {
    const equipment = await EquipmentModel.findById(id, organizationId);
    if (!equipment) {
      throw new Error('Equipment not found');
    }

    if (!this.VALID_STATUSES.includes(status)) {
      throw new Error(`Invalid status. Valid statuses: ${this.VALID_STATUSES.join(', ')}`);
    }

    return await EquipmentModel.updateStatus(id, status, organizationId);
  }

  static async deleteEquipment(id, organizationId) {
    const equipment = await EquipmentModel.findById(id, organizationId);
    if (!equipment) {
      throw new Error('Equipment not found');
    }

    return await EquipmentModel.softDelete(id, organizationId);
  }
}

module.exports = EquipmentService;
