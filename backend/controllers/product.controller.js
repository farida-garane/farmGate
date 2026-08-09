const productService = require('../services/product.service');

async function list(req, res, next) {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json({ status: 'success', data: products });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  getOne,
};