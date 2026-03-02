const SparePartModel = require('../models/sparePartModel');
const CategoryModel = require('../models/categoryModel');

class SparePartService {
  static async getAllSpareParts(filters = {}, organizationId) {
    if (filters.search || filters.category_id || filters.lowStock !== undefined) {
      const processedFilters = {
        search: filters.search,
        category_id: filters.category_id ? parseInt(filters.category_id) : null,
        lowStock: filters.lowStock === 'true' || filters.lowStock === true
      };
      return await SparePartModel.findByFilters(processedFilters, organizationId);
    }
    return await SparePartModel.findAll(organizationId);
  }

  static async getSparePartById(id, organizationId) {
    const sparePart = await SparePartModel.findById(id, organizationId);
    if (!sparePart) {
      throw new Error('Spare part not found');
    }

    const isLowStock = sparePart.stock <= sparePart.min_stock;
    return {
      ...sparePart,
      is_low_stock: isLowStock
    };
  }

  static async createSparePart(sparePartData, organizationId) {
    const { name, code, description, category_id, stock, min_stock, price, location, image_url } = sparePartData;

    if (!name || name.trim() === '') {
      throw new Error('Spare part name is required');
    }

    if (category_id) {
      const category = await CategoryModel.findById(category_id, organizationId);
      if (!category) {
        throw new Error('Category not found');
      }
    }

    const stockValue = stock !== undefined ? parseInt(stock) : 0;
    const minStockValue = min_stock !== undefined ? parseInt(min_stock) : 1;
    const priceValue = price !== undefined ? parseFloat(price) : null;

    if (stockValue < 0) {
      throw new Error('Stock cannot be negative');
    }

    if (minStockValue < 0) {
      throw new Error('Minimum stock cannot be negative');
    }

    if (priceValue !== null && priceValue < 0) {
      throw new Error('Price cannot be negative');
    }

    const sparePart = await SparePartModel.create({
      name: name.trim(),
      code: code?.trim() || null,
      description: description?.trim() || null,
      category_id: category_id || null,
      stock: stockValue,
      min_stock: minStockValue,
      price: priceValue,
      location: location?.trim() || null,
      image_url: image_url?.trim() || null
    }, organizationId);

    const isLowStock = sparePart.stock <= sparePart.min_stock;
    return {
      ...sparePart,
      is_low_stock: isLowStock
    };
  }

  static async updateSparePart(id, sparePartData, organizationId) {
    const { name, code, description, category_id, stock, min_stock, price, location, image_url } = sparePartData;

    const existingSparePart = await SparePartModel.findById(id, organizationId);
    if (!existingSparePart) {
      throw new Error('Spare part not found');
    }

    if (!name || name.trim() === '') {
      throw new Error('Spare part name is required');
    }

    if (category_id) {
      const category = await CategoryModel.findById(category_id, organizationId);
      if (!category) {
        throw new Error('Category not found');
      }
    }

    const stockValue = stock !== undefined ? parseInt(stock) : existingSparePart.stock;
    const minStockValue = min_stock !== undefined ? parseInt(min_stock) : existingSparePart.min_stock;
    const priceValue = price !== undefined ? parseFloat(price) : existingSparePart.price;

    if (stockValue < 0) {
      throw new Error('Stock cannot be negative');
    }

    if (minStockValue < 0) {
      throw new Error('Minimum stock cannot be negative');
    }

    if (priceValue !== null && priceValue < 0) {
      throw new Error('Price cannot be negative');
    }

    // Build update object only with provided fields
    const updateData = {
      name: name.trim(),
      code: code?.trim() || null,
      description: description?.trim() || null,
      category_id: category_id || null,
      stock: stockValue,
      min_stock: minStockValue,
      price: priceValue,
      location: location?.trim() || null
    };

    // Only include image_url if it's explicitly provided
    if (image_url !== undefined) {
      updateData.image_url = image_url?.trim() || null;
    }

    const sparePart = await SparePartModel.update(id, updateData, organizationId);

    const isLowStock = sparePart.stock <= sparePart.min_stock;
    return {
      ...sparePart,
      is_low_stock: isLowStock
    };
  }

  static async deleteSparePart(id, organizationId) {
    const sparePart = await SparePartModel.findById(id, organizationId);
    if (!sparePart) {
      throw new Error('Spare part not found');
    }

    return await SparePartModel.softDelete(id, organizationId);
  }

  static async getLowStockItems(organizationId) {
    const items = await SparePartModel.getLowStockItems(organizationId);
    return items.map(item => ({
      ...item,
      is_low_stock: true
    }));
  }
}

module.exports = SparePartService;
