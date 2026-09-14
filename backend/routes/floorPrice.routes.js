const express = require('express');
const router = express.Router();
const floorPriceController = require('../controllers/floorPrice.controller');

const authMiddleware = require('../middleware/auth.middleware');

router.get('/', floorPriceController.list);
router.get('/:id', floorPriceController.getOne);
router.post(
  '/',
  authMiddleware,
  authMiddleware.authorizeRoles('ADMIN', 'AGENT'),
  floorPriceController.upsert
);
router.put(
  '/:id',
  authMiddleware,
  authMiddleware.authorizeRoles('ADMIN', 'AGENT'),
  floorPriceController.update
);
router.delete(
  '/:id',
  authMiddleware,
  authMiddleware.authorizeRoles('ADMIN', 'AGENT'),
  floorPriceController.remove
);

module.exports = router;