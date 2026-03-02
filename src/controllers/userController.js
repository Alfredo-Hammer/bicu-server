const UserService = require('../services/userService');
const AuditService = require('../services/auditService');
const messages = require('../utils/messages');

class UserController {
  static async getAllUsers(req, res) {
    try {
      const { organizationId } = req.user;
      const users = await UserService.getAllUsers(organizationId);
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error('Error in getAllUsers controller:', error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || messages.errors.internalError,
      });
    }
  }

  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const { organizationId } = req.user;
      const user = await UserService.getUserById(id, organizationId);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Error in getUserById controller:', error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || messages.errors.internalError,
      });
    }
  }

  static async createUser(req, res) {
    try {
      const userData = req.body;
      const { organizationId } = req.user;
      const newUser = await UserService.createUser(userData, organizationId);

      AuditService.log({
        user_id: req.user.id,
        organization_id: organizationId,
        action: 'CREATE',
        entity_type: 'user',
        entity_id: newUser.id,
        description: `Usuario creado: ${newUser.email}`,
        ip_address: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Usuario creado correctamente',
        data: newUser,
      });
    } catch (error) {
      console.error('Error in createUser controller:', error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || messages.errors.internalError,
      });
    }
  }

  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const userData = req.body;
      const { organizationId } = req.user;
      const updatedUser = await UserService.updateUser(id, userData, organizationId);

      AuditService.log({
        user_id: req.user.id,
        organization_id: organizationId,
        action: 'UPDATE',
        entity_type: 'user',
        entity_id: id,
        description: `Usuario actualizado: ${updatedUser?.email || id}`,
        ip_address: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Usuario actualizado correctamente',
        data: updatedUser,
      });
    } catch (error) {
      console.error('Error in updateUser controller:', error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || messages.errors.internalError,
      });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const { organizationId } = req.user;
      await UserService.deleteUser(id, organizationId);

      AuditService.log({
        user_id: req.user.id,
        organization_id: organizationId,
        action: 'DELETE',
        entity_type: 'user',
        entity_id: id,
        description: `Usuario eliminado ID: ${id}`,
        ip_address: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Usuario eliminado correctamente',
      });
    } catch (error) {
      console.error('Error in deleteUser controller:', error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || messages.errors.internalError,
      });
    }
  }

  static async uploadUserProfileImage(req, res) {
    try {
      const { id } = req.params;
      const { organizationId } = req.user;
      const UserModel = require('../models/userModel');

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ninguna imagen',
        });
      }

      const imageUrl = `/uploads/profiles/${req.file.filename}`;
      await UserModel.updateProfileImage(id, imageUrl, organizationId);

      return res.status(200).json({
        success: true,
        message: 'Imagen de perfil actualizada correctamente',
        data: {
          profile_image: imageUrl,
        },
      });
    } catch (error) {
      console.error('Upload user profile image error:', error);
      return res.status(500).json({
        success: false,
        message: messages.errors.internalError,
      });
    }
  }
}

module.exports = UserController;
