const SupplierModel = require('../models/supplierModel');

class SupplierService {
  static async getAllSuppliers(organizationId) {
    return await SupplierModel.findAll(organizationId);
  }

  static async getSupplierById(id, organizationId) {
    const supplier = await SupplierModel.findById(id, organizationId);
    if (!supplier) {
      throw new Error('Supplier not found');
    }
    return supplier;
  }

  static async createSupplier(supplierData, organizationId) {
    const { name, phone, email, address } = supplierData;

    if (!name || name.trim() === '') {
      throw new Error('Supplier name is required');
    }

    if (phone && phone.trim() !== '') {
      const existingSupplier = await SupplierModel.findByNameAndPhone(name, phone, organizationId);
      if (existingSupplier) {
        throw new Error('Supplier with same name and phone already exists');
      }
    }

    return await SupplierModel.create({
      name: name.trim(),
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      address: address?.trim() || null
    }, organizationId);
  }

  static async updateSupplier(id, supplierData, organizationId) {
    const { name, phone, email, address } = supplierData;

    if (!name || name.trim() === '') {
      throw new Error('Supplier name is required');
    }

    const supplier = await SupplierModel.findById(id, organizationId);
    if (!supplier) {
      throw new Error('Supplier not found');
    }

    if (phone && phone.trim() !== '') {
      const existingSupplier = await SupplierModel.findByNameAndPhone(name, phone, organizationId);
      if (existingSupplier && existingSupplier.id !== parseInt(id)) {
        throw new Error('Supplier with same name and phone already exists');
      }
    }

    return await SupplierModel.update(id, {
      name: name.trim(),
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      address: address?.trim() || null
    }, organizationId);
  }

  static async deleteSupplier(id, organizationId) {
    const supplier = await SupplierModel.findById(id, organizationId);
    if (!supplier) {
      throw new Error('Supplier not found');
    }

    return await SupplierModel.softDelete(id, organizationId);
  }
}

module.exports = SupplierService;
