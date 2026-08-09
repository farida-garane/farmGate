const express = require('express');
const router = express.Router();
const marketController = require('../controllers/market.controller');

router.get('/', marketController.list);
router.get('/:id', marketController.getOne);

module.exports = router;