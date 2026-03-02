const express = require('express');
const router = express.Router();
const AuditController = require('../controllers/auditController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

// GET /api/audit - Get audit logs with filters
router.get('/', AuditController.getAuditLogs);

// GET /api/audit/stats - Get audit statistics
router.get('/stats', AuditController.getStats);

module.exports = router;
