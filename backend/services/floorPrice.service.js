const prisma = require('../config/db');

async function getAllFloorPrices() {
  const prices = await prisma.floorPrice.findMany({
    include: { product: true },
    orderBy: { product: { name: 'asc' } }
  });
  return prices.map(fp => ({
    id: fp.id,
    product_name: fp.product.name,
    floor_price_fcfa_kg: fp.floorPriceFcfaKg
  }));
}

async function getFloorPriceById(id) {
  const fp = await prisma.floorPrice.findUnique({
    where: { id },
    include: { product: true }
  });

  if (!fp) {
    const error = new Error('Prix plancher introuvable');
    error.statusCode = 404;
    throw error;
  }

  return {
    id: fp.id,
    product_name: fp.product.name,
    floor_price_fcfa_kg: fp.floorPriceFcfaKg
  };
}

module.exports = {
  getAllFloorPrices,
  getFloorPriceById,
};