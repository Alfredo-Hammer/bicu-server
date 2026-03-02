const SettingsModel = require('../models/settingsModel');

class SettingsService {
  static async getSettings() {
    try {
      const settings = await SettingsModel.get();
      return settings;
    } catch (error) {
      console.error('Error in getSettings:', error);
      throw error;
    }
  }

  static async updateSettings(settingsData) {
    try {
      const updatedSettings = await SettingsModel.update(settingsData);
      return updatedSettings;
    } catch (error) {
      console.error('Error in updateSettings:', error);
      throw error;
    }
  }

  static async updateLogo(logoUrl) {
    try {
      const updatedSettings = await SettingsModel.updateLogo(logoUrl);
      return updatedSettings;
    } catch (error) {
      console.error('Error in updateLogo:', error);
      throw error;
    }
  }
}

module.exports = SettingsService;
