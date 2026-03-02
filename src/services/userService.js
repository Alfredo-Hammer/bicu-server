const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const messages = require('../utils/messages');

class UserService {
  static async getAllUsers(organizationId) {
    try {
      const users = await UserModel.getAll(organizationId);
      return users;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }

  static async getUserById(id, organizationId) {
    try {
      const user = await UserModel.findById(id, organizationId);
      if (!user) {
        const error = new Error(messages.errors.userNotFound);
        error.status = 404;
        throw error;
      }
      return user;
    } catch (error) {
      console.error('Error in getUserById:', error);
      throw error;
    }
  }

  static async createUser(userData, organizationId) {
    try {
      const { name, email, password, role } = userData;

      // Validate required fields
      if (!name || !email || !password || !role) {
        const error = new Error('Todos los campos son requeridos');
        error.status = 400;
        throw error;
      }

      // Check if email already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        const error = new Error('El email ya está registrado');
        error.status = 400;
        throw error;
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Create user with organization_id from authenticated user
      const newUser = await UserModel.create({
        name,
        email,
        password_hash,
        role,
        organization_id: organizationId,
      });

      return newUser;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  static async updateUser(id, userData, organizationId) {
    try {
      const { name, apellido, email, movil, cedula, profesion, direccion, estado, password, role, is_active } = userData;

      // Check if user exists and belongs to organization
      const existingUser = await UserModel.findById(id, organizationId);
      if (!existingUser) {
        const error = new Error(messages.errors.userNotFound);
        error.status = 404;
        throw error;
      }

      // Check if email is being changed and if it's already taken
      if (email && email !== existingUser.email) {
        const emailExists = await UserModel.findByEmail(email);
        if (emailExists) {
          const error = new Error('El email ya está registrado');
          error.status = 400;
          throw error;
        }
      }

      // Prepare update data
      const updateData = {
        name: name || existingUser.name,
        apellido: apellido || existingUser.apellido,
        email: email || existingUser.email,
        movil: movil || existingUser.movil,
        cedula: cedula || existingUser.cedula,
        profesion: profesion || existingUser.profesion,
        direccion: direccion || existingUser.direccion,
        estado: estado || existingUser.estado,
        role: role || existingUser.role,
        is_active: is_active !== undefined ? is_active : existingUser.active,
      };

      // Hash password if provided
      if (password) {
        updateData.password_hash = await bcrypt.hash(password, 10);
      }

      // Update user with organization filter
      const updatedUser = await UserModel.update(id, updateData, organizationId);
      return updatedUser;
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  }

  static async deleteUser(id, organizationId) {
    try {
      // Check if user exists and belongs to organization
      const existingUser = await UserModel.findById(id, organizationId);
      if (!existingUser) {
        const error = new Error(messages.errors.userNotFound);
        error.status = 404;
        throw error;
      }

      // Delete user with organization filter
      await UserModel.delete(id, organizationId);
      return { message: 'Usuario eliminado correctamente' };
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw error;
    }
  }
}

module.exports = UserService;
