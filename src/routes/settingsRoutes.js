const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/settingsController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const uploadLogo = require('../middlewares/uploadLogoMiddleware');

// Public route - get settings
router.get('/', SettingsController.getSettings);

// Protected routes - admin only
router.put('/', authMiddleware, roleMiddleware('admin'), SettingsController.updateSettings);
router.post('/logo', authMiddleware, roleMiddleware('admin'), uploadLogo.single('logo'), SettingsController.uploadLogo);

module.exports = router;
