const express = require('express');
const SupplierController = require('../controllers/supplierController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, SupplierController.getAll);
router.get('/:id', authMiddleware, SupplierController.getById);
router.post('/', authMiddleware, roleMiddleware('admin'), SupplierController.create);
router.put('/:id', authMiddleware, roleMiddleware('admin'), SupplierController.update);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), SupplierController.delete);

module.exports = router;
