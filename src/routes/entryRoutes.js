const express = require('express');
const EntryController = require('../controllers/entryController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, EntryController.getAll);
router.post('/', authMiddleware, roleMiddleware('admin'), EntryController.create);
router.get('/:id', authMiddleware, EntryController.getById);

module.exports = router;
