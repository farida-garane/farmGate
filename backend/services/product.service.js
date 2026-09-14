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

async function createProduct({ name, category, unit }) {
  const existing = await prisma.product.findUnique({ where: { name } });
  if (existing) {
    const error = new Error('Un produit avec ce nom existe déjà');
    error.statusCode = 409;
    throw error;
  }
  return prisma.product.create({
    data: { name, category, unit: unit || 'kg' },
  });
}

async function updateProduct(id, { name, category, unit }) {
  await getProductById(id);
  return prisma.product.update({
    where: { id },
    data: { name, category, unit },
  });
}

async function deleteProduct(id) {
  await getProductById(id);
  return prisma.product.delete({ where: { id } });
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};