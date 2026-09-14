const express = require('express');
const router = express.Router();
const marketController = require('../controllers/market.controller');

const authMiddleware = require('../middleware/auth.middleware');

router.get('/', marketController.list);
router.get('/:id', marketController.getOne);

router.post(
  '/',
  authMiddleware,
  authMiddleware.authorizeRoles('ADMIN'),
  marketController.create
);
router.put(
  '/:id',
  authMiddleware,
  authMiddleware.authorizeRoles('ADMIN'),
  marketController.update
);
router.delete(
  '/:id',
  authMiddleware,
  authMiddleware.authorizeRoles('ADMIN'),
  marketController.remove
);

module.exports = router;