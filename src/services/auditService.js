const AuditModel = require('../models/auditModel');

class AuditService {
  static async log(auditData) {
    try {
      return await AuditModel.create(auditData);
    } catch (error) {
      console.error('Error logging audit:', error);
      // Don't throw - audit logging should not break the main flow
    }
  }

  static async getAuditLogs(filters) {
    try {
      return await AuditModel.getAll(filters);
    } catch (error) {
      console.error('Error getting audit logs:', error);
      throw error;
    }
  }

  static async getStats(organizationId = null) {
    try {
      return await AuditModel.getStats(organizationId);
    } catch (error) {
      console.error('Error getting audit stats:', error);
      throw error;
    }
  }
}

module.exports = AuditService;
