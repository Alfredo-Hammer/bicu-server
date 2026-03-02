const express = require('express');
const OutputController = require('../controllers/outputController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, OutputController.getAll);
router.post('/', authMiddleware, roleMiddleware('admin', 'tecnico'), OutputController.create);
router.get('/:id', authMiddleware, OutputController.getById);

module.exports = router;
