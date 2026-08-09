const express = require('express');
const router = express.Router();
const priceReportController = require('../controllers/priceReport.controller');

router.get('/', priceReportController.list);
router.post('/', priceReportController.create);
router.get('/:id', priceReportController.getOne);
router.delete('/:id', priceReportController.remove);

module.exports = router;