const OrganizationModel = require('../models/organizationModel');
const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');

class OrganizationService {
  static async registerOrganization(organizationData, adminData) {
    try {
      const { name, code, email, phone, address, city } = organizationData;
      const { adminName, adminEmail, adminPassword } = adminData;

      // Validate required fields
      if (!name || !code || !adminName || !adminEmail || !adminPassword) {
        const error = new Error('Todos los campos son requeridos');
        error.status = 400;
        throw error;
      }

      // Check if organization code already exists
      const existingOrg = await OrganizationModel.findByCode(code);
      if (existingOrg) {
        const error = new Error('El código de organización ya está registrado');
        error.status = 400;
        throw error;
      }

      // Check if admin email already exists
      const existingUser = await UserModel.findByEmail(adminEmail);
      if (existingUser) {
        const error = new Error('El email del administrador ya está registrado');
        error.status = 400;
        throw error;
      }

      // Create organization
      const newOrganization = await OrganizationModel.create({
        name,
        code,
        email,
        phone,
        address,
        city,
      });

      // Hash admin password
      const password_hash = await bcrypt.hash(adminPassword, 10);

      // Create admin user for this organization
      const adminUser = await UserModel.create({
        name: adminName,
        email: adminEmail,
        password_hash,
        role: 'admin',
        organization_id: newOrganization.id,
      });

      return {
        organization: newOrganization,
        admin: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
        },
      };
    } catch (error) {
      console.error('Error in registerOrganization:', error);
      throw error;
    }
  }

  static async getOrganizationById(id) {
    try {
      const organization = await OrganizationModel.findById(id);
      if (!organization) {
        const error = new Error('Organización no encontrada');
        error.status = 404;
        throw error;
      }
      return organization;
    } catch (error) {
      console.error('Error in getOrganizationById:', error);
      throw error;
    }
  }

  static async getRegisteredCodes() {
    try {
      const organizations = await OrganizationModel.getAll();
      return organizations.map(org => org.code);
    } catch (error) {
      console.error('Error in getRegisteredCodes:', error);
      throw error;
    }
  }
}

module.exports = OrganizationService;
