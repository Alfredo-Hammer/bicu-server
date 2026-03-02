const express = require('express');
const CategoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, CategoryController.getAll);
router.get('/:id', authMiddleware, CategoryController.getById);
router.post('/', authMiddleware, roleMiddleware('admin'), CategoryController.create);
router.put('/:id', authMiddleware, roleMiddleware('admin'), CategoryController.update);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), CategoryController.delete);

module.exports = router;
