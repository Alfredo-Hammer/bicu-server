const CategoryService = require('../services/categoryService');
const AuditService = require('../services/auditService');
const messages = require('../utils/messages');

class CategoryController {
  static async getAll(req, res) {
    try {
      const { organizationId } = req.user;
      const categories = await CategoryService.getAllCategories(organizationId);

      return res.status(200).json({
        success: true,
        message: messages.categories.retrieved,
        data: categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
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
      const category = await CategoryService.getCategoryById(id, organizationId);

      return res.status(200).json({
        success: true,
        message: messages.general.retrieved,
        data: category
      });
    } catch (error) {
      if (error.message === 'Category not found') {
        return res.status(404).json({
          success: false,
          message: messages.categories.notFound,
          data: null
        });
      }

      console.error('Get category error:', error);
      return res.status(500).json({
        success: false,
        message: messages.general.serverError,
        data: null
      });
    }
  }

  static async create(req, res) {
    try {
      const { name, description } = req.body;
      const { organizationId } = req.user;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: messages.categories.nameRequired,
          data: null
        });
      }

      const category = await CategoryService.createCategory({ name, description }, organizationId);

      AuditService.log({
        user_id: req.user.id,
        organization_id: organizationId,
        action: 'CREATE',
        entity_type: 'category',
        entity_id: category.id,
        description: `Categoría creada: ${category.name}`,
        ip_address: req.ip,
      });

      return res.status(201).json({
        success: true,
        message: messages.categories.created,
        data: category
      });
    } catch (error) {
      if (error.message === 'Category name already exists') {
        return res.status(409).json({
          success: false,
          message: messages.categories.duplicateName,
          data: null
        });
      }

      console.error('Create category error:', error);
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
      const { name, description } = req.body;
      const { organizationId } = req.user;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: messages.categories.nameRequired,
          data: null
        });
      }

      const category = await CategoryService.updateCategory(id, { name, description }, organizationId);

      AuditService.log({
        user_id: req.user.id,
        organization_id: organizationId,
        action: 'UPDATE',
        entity_type: 'category',
        entity_id: category.id,
        description: `Categoría actualizada: ${category.name}`,
        ip_address: req.ip,
      });

      return res.status(200).json({
        success: true,
        message: messages.categories.updated,
        data: category
      });
    } catch (error) {
      if (error.message === 'Category not found') {
        return res.status(404).json({
          success: false,
          message: messages.categories.notFound,
          data: null
        });
      }

      if (error.message === 'Category name already exists') {
        return res.status(409).json({
          success: false,
          message: messages.categories.duplicateName,
          data: null
        });
      }

      console.error('Update category error:', error);
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
      const category = await CategoryService.deleteCategory(id, organizationId);

      AuditService.log({
        user_id: req.user.id,
        organization_id: organizationId,
        action: 'DELETE',
        entity_type: 'category',
        entity_id: id,
        description: `Categoría eliminada: ${category?.name || id}`,
        ip_address: req.ip,
      });

      return res.status(200).json({
        success: true,
        message: messages.categories.deleted,
        data: category
      });
    } catch (error) {
      if (error.message === 'Category not found') {
        return res.status(404).json({
          success: false,
          message: messages.categories.notFound,
          data: null
        });
      }

      if (error.message.includes('Cannot delete category')) {
        const match = error.message.match(/\d+/);
        const count = match ? match[0] : '0';
        return res.status(409).json({
          success: false,
          message: messages.categories.hasSpareparts.replace('{count}', count),
          data: null
        });
      }

      console.error('Delete category error:', error);
      return res.status(500).json({
        success: false,
        message: messages.general.serverError,
        data: null
      });
    }
  }
}

module.exports = CategoryController;
