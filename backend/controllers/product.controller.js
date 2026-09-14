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

async function create(req, res, next) {
  try {
    const { name, category, unit } = req.body;
    if (!name) {
      const error = new Error('Le nom du produit est requis');
      error.statusCode = 400;
      throw error;
    }
    const product = await productService.createProduct({ name, category, unit });
    res.status(201).json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { name, category, unit } = req.body;
    const product = await productService.updateProduct(req.params.id, { name, category, unit });
    res.status(200).json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const product = await productService.deleteProduct(req.params.id);
    res.status(200).json({ status: 'success', data: product });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
};