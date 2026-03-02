const express = require('express');
const SparePartController = require('../controllers/sparePartController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/sparePartUploadMiddleware');

const router = express.Router();

router.get('/', authMiddleware, SparePartController.getAll);
router.get('/low-stock', authMiddleware, SparePartController.getLowStock);
router.get('/:id', authMiddleware, SparePartController.getById);
router.post('/', authMiddleware, roleMiddleware('admin'), upload.single('image'), SparePartController.create);
router.put('/:id', authMiddleware, roleMiddleware('admin'), upload.single('image'), SparePartController.update);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), SparePartController.delete);

module.exports = router;
