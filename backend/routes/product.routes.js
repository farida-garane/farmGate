const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

router.get('/', productController.list);
router.get('/:id', productController.getOne);

module.exports = router;