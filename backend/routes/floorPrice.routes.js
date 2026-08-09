const express = require('express');
const router = express.Router();
const floorPriceController = require('../controllers/floorPrice.controller');

router.get('/', floorPriceController.list);
router.get('/:id', floorPriceController.getOne);

module.exports = router;