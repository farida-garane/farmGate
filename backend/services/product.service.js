const prisma = require('../config/db');

async function getAllProducts() {
  return await prisma.product.findMany({ orderBy: { name: 'asc' } });
}

async function getProductById(id) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    const error = new Error('Produit introuvable');
    error.statusCode = 404;
    throw error;
  }
  return product;
}

module.exports = {
  getAllProducts,
  getProductById,
};