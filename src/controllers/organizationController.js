const OrganizationService = require('../services/organizationService');
const AuthService = require('../services/authService');
const messages = require('../utils/messages');

class OrganizationController {
  static async registerOrganization(req, res) {
    try {
      const { organization, admin } = req.body;

      if (!organization || !admin) {
        return res.status(400).json({
          success: false,
          message: 'Datos de organización y administrador son requeridos',
        });
      }

      // Register organization and admin user
      const result = await OrganizationService.registerOrganization(organization, admin);

      // Auto-login the new admin user
      const loginResult = await AuthService.login(admin.adminEmail, admin.adminPassword);

      return res.status(201).json({
        success: true,
        message: 'Organización registrada exitosamente',
        data: {
          organization: result.organization,
          admin: result.admin,
          token: loginResult.token,
          user: loginResult.user,
        },
      });
    } catch (error) {
      console.error('Error in registerOrganization controller:', error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || messages.general.serverError,
      });
    }
  }

  static async getOrganization(req, res) {
    try {
      const { organizationId } = req.user;
      const organization = await OrganizationService.getOrganizationById(organizationId);

      return res.status(200).json({
        success: true,
        data: organization,
      });
    } catch (error) {
      console.error('Error in getOrganization controller:', error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || messages.general.serverError,
      });
    }
  }

  static async getRegisteredCodes(req, res) {
    try {
      const codes = await OrganizationService.getRegisteredCodes();
      return res.status(200).json({
        success: true,
        data: codes,
      });
    } catch (error) {
      console.error('Error in getRegisteredCodes controller:', error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || messages.general.serverError,
      });
    }
  }
}

module.exports = OrganizationController;
