const AuditService = require('../services/auditService');
const messages = require('../utils/messages');

class AuditController {
  static async getAuditLogs(req, res) {
    try {
      const { organizationId } = req.user;
      const filters = {
        organizationId,
        user_id: req.query.user_id,
        action: req.query.action,
        entity_type: req.query.entity_type,
        date_from: req.query.date_from,
        date_to: req.query.date_to,
        limit: parseInt(req.query.limit) || 100,
        offset: parseInt(req.query.offset) || 0
      };

      const logs = await AuditService.getAuditLogs(filters);

      res.status(200).json({
        success: true,
        data: logs
      });
    } catch (error) {
      console.error('Error in getAuditLogs controller:', error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || messages.errors.internalError
      });
    }
  }

  static async getStats(req, res) {
    try {
      const { organizationId } = req.user;
      const stats = await AuditService.getStats(organizationId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error in getStats controller:', error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || messages.errors.internalError
      });
    }
  }
}

module.exports = AuditController;
