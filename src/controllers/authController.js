const AuthService = require('../services/authService');
const AuditService = require('../services/auditService');
const messages = require('../utils/messages');

class AuthController {
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: messages.auth.emailPasswordRequired,
        });
      }

      const result = await AuthService.login(email, password);

      AuditService.log({
        user_id: result.user.id,
        organization_id: result.user.organizationId,
        action: 'LOGIN',
        entity_type: 'user',
        entity_id: result.user.id,
        description: `Inicio de sesión: ${email}`,
        ip_address: req.ip || req.headers['x-forwarded-for'],
      });

      return res.status(200).json({
        success: true,
        message: messages.auth.loginSuccess,
        data: result,
      });
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({
          success: false,
          message: messages.auth.invalidCredentials,
        });
      }

      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: messages.general.serverError,
      });
    }
  }

  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const UserModel = require('../models/userModel');
      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: messages.auth.profileNotFound,
        });
      }

      return res.status(200).json({
        success: true,
        message: messages.auth.profileRetrieved,
        data: {
          id: user.id,
          name: user.name,
          apellido: user.apellido,
          email: user.email,
          movil: user.movil,
          cedula: user.cedula,
          profesion: user.profesion,
          direccion: user.direccion,
          estado: user.estado,
          role: user.role,
          profile_image: user.profile_image,
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({
        success: false,
        message: messages.general.serverError,
      });
    }
  }

  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { name, apellido, email, movil, cedula, profesion, direccion, estado, current_password, new_password } = req.body;
      const UserModel = require('../models/userModel');
      const bcrypt = require('bcrypt');

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }

      // If changing password, verify current password
      if (new_password) {
        if (!current_password) {
          return res.status(400).json({
            success: false,
            message: 'Debe proporcionar la contraseña actual',
          });
        }

        const isValid = await bcrypt.compare(current_password, user.password_hash);
        if (!isValid) {
          return res.status(400).json({
            success: false,
            message: 'Contraseña actual incorrecta',
          });
        }
      }

      // Update user
      const updateData = {
        name: name || user.name,
        apellido: apellido !== undefined ? apellido : user.apellido,
        email: email || user.email,
        movil: movil !== undefined ? movil : user.movil,
        cedula: cedula !== undefined ? cedula : user.cedula,
        profesion: profesion !== undefined ? profesion : user.profesion,
        direccion: direccion !== undefined ? direccion : user.direccion,
        estado: estado !== undefined ? estado : user.estado,
        role: user.role,
        is_active: user.active,
      };

      if (new_password) {
        updateData.password_hash = await bcrypt.hash(new_password, 10);
      }

      const updatedUser = await UserModel.update(userId, updateData, req.user.organizationId);

      return res.status(200).json({
        success: true,
        message: 'Perfil actualizado correctamente',
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          apellido: updatedUser.apellido,
          email: updatedUser.email,
          movil: updatedUser.movil,
          cedula: updatedUser.cedula,
          profesion: updatedUser.profesion,
          direccion: updatedUser.direccion,
          estado: updatedUser.estado,
          role: updatedUser.role,
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({
        success: false,
        message: messages.general.serverError,
      });
    }
  }

  static async uploadProfileImage(req, res) {
    try {
      const userId = req.user.id;
      const UserModel = require('../models/userModel');

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ninguna imagen',
        });
      }

      const imageUrl = `/uploads/profiles/${req.file.filename}`;

      // Update user profile image
      await UserModel.updateProfileImage(userId, imageUrl);

      return res.status(200).json({
        success: true,
        message: 'Imagen de perfil actualizada correctamente',
        data: {
          profile_image: imageUrl,
        },
      });
    } catch (error) {
      console.error('Upload profile image error:', error);
      return res.status(500).json({
        success: false,
        message: messages.general.serverError,
      });
    }
  }
}

module.exports = AuthController;
