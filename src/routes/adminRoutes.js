const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

/**
 * POST /api/admin/clean-database
 * Limpia toda la base de datos (solo admin)
 * ⚠️ ADVERTENCIA: Esta acción NO se puede deshacer
 */
router.post(
  '/clean-database',
  authMiddleware,
  roleMiddleware(['admin']),
  AdminController.cleanDatabase
);

module.exports = router;
