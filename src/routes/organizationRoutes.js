const express = require('express');
const router = express.Router();
const OrganizationController = require('../controllers/organizationController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.post('/register', OrganizationController.registerOrganization);
router.get('/registered-codes', OrganizationController.getRegisteredCodes);

// Protected routes - require authentication
router.get('/current', authMiddleware, OrganizationController.getOrganization);

module.exports = router;
