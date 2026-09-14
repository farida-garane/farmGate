const express = require('express');
const router = express.Router();
const priceReportController = require('../controllers/priceReport.controller');

const authMiddleware = require('../middleware/auth.middleware');

router.get('/', priceReportController.list);
router.post(
  '/',
  authMiddleware,
  authMiddleware.authorizeRoles('ADMIN', 'AGENT'),
  priceReportController.create
);
router.get('/:id', priceReportController.getOne);
router.delete(
  '/:id',
  authMiddleware,
  authMiddleware.authorizeRoles('ADMIN'),
  priceReportController.remove
);

module.exports = router;