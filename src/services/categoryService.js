const CategoryModel = require('../models/categoryModel');

class CategoryService {
  static async getAllCategories(organizationId) {
    return await CategoryModel.findAll(organizationId);
  }

  static async getCategoryById(id, organizationId) {
    const category = await CategoryModel.findById(id, organizationId);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  static async createCategory(categoryData, organizationId) {
    const { name, description } = categoryData;

    if (!name || name.trim() === '') {
      throw new Error('Category name is required');
    }

    const existingCategory = await CategoryModel.findByName(name, organizationId);
    if (existingCategory) {
      throw new Error('Category name already exists');
    }

    return await CategoryModel.create({
      name: name.trim(),
      description: description?.trim() || null
    }, organizationId);
  }

  static async updateCategory(id, categoryData, organizationId) {
    const { name, description } = categoryData;

    if (!name || name.trim() === '') {
      throw new Error('Category name is required');
    }

    const category = await CategoryModel.findById(id, organizationId);
    if (!category) {
      throw new Error('Category not found');
    }

    const existingCategory = await CategoryModel.findByName(name, organizationId);
    if (existingCategory && existingCategory.id !== parseInt(id)) {
      throw new Error('Category name already exists');
    }

    return await CategoryModel.update(id, {
      name: name.trim(),
      description: description?.trim() || null
    }, organizationId);
  }

  static async deleteCategory(id, organizationId) {
    const category = await CategoryModel.findById(id, organizationId);
    if (!category) {
      throw new Error('Category not found');
    }

    const sparePartsCount = await CategoryModel.countSparePartsByCategory(id, organizationId);
    if (sparePartsCount > 0) {
      throw new Error(`Cannot delete category. It has ${sparePartsCount} spare parts associated.`);
    }

    return await CategoryModel.softDelete(id, organizationId);
  }
}

module.exports = CategoryService;
