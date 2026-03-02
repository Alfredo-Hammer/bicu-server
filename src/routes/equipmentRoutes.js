const express = require('express');
const EquipmentController = require('../controllers/equipmentController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/equipmentUploadMiddleware');

const router = express.Router();

router.get('/', authMiddleware, EquipmentController.getAll);
router.get('/:id', authMiddleware, EquipmentController.getById);
router.post('/', authMiddleware, roleMiddleware('admin', 'tecnico'), upload.single('image'), EquipmentController.create);
router.put('/:id', authMiddleware, roleMiddleware('admin'), upload.single('image'), EquipmentController.update);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), EquipmentController.delete);

module.exports = router;
