const SettingsService = require('../services/settingsService');
const messages = require('../utils/messages');

class SettingsController {
  static async getSettings(req, res) {
    try {
      const settings = await SettingsService.getSettings();
      
      res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Error in getSettings controller:', error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || messages.errors.internalError
      });
    }
  }

  static async updateSettings(req, res) {
    try {
      const settingsData = req.body;
      const updatedSettings = await SettingsService.updateSettings(settingsData);
      
      res.status(200).json({
        success: true,
        message: 'Configuración actualizada correctamente',
        data: updatedSettings
      });
    } catch (error) {
      console.error('Error in updateSettings controller:', error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || messages.errors.internalError
      });
    }
  }

  static async uploadLogo(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ninguna imagen'
        });
      }

      const logoUrl = `/uploads/logos/${req.file.filename}`;
      const updatedSettings = await SettingsService.updateLogo(logoUrl);

      res.status(200).json({
        success: true,
        message: 'Logo actualizado correctamente',
        data: updatedSettings
      });
    } catch (error) {
      console.error('Error in uploadLogo controller:', error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || messages.errors.internalError
      });
    }
  }
}

module.exports = SettingsController;
