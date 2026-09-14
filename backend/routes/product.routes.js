const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

const authMiddleware = require('../middleware/auth.middleware');

router.get('/', productController.list);
router.get('/:id', productController.getOne);

router.post(
  '/',
  authMiddleware,
  authMiddleware.authorizeRoles('ADMIN', 'AGENT'),
  productController.create
);
router.put(
  '/:id',
  authMiddleware,
  authMiddleware.authorizeRoles('ADMIN', 'AGENT'),
  productController.update
);
router.delete(
  '/:id',
  authMiddleware,
  authMiddleware.authorizeRoles('ADMIN', 'AGENT'),
  productController.remove
);

module.exports = router;