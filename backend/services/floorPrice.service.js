const prisma = require('../config/db');

async function getAllFloorPrices() {
  const prices = await prisma.floorPrice.findMany({
    include: { product: true },
    orderBy: { product: { name: 'asc' } }
  });
  return prices.map((fp) => ({
    id: fp.id,
    product_id: fp.productId,
    product_name: fp.product.name,
    category: fp.product.category,
    unit: fp.product.unit,
    floor_price_fcfa_kg: fp.floorPriceFcfaKg,
    effective_date: fp.effectiveDate
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
    product_id: fp.productId,
    product_name: fp.product.name,
    category: fp.product.category,
    unit: fp.product.unit,
    floor_price_fcfa_kg: fp.floorPriceFcfaKg,
    effective_date: fp.effectiveDate
  };
}

async function upsertFloorPrice({ product_id, floor_price_fcfa_kg, effective_date }) {
  const existing = await prisma.floorPrice.findFirst({
    where: { productId: product_id }
  });

  if (existing) {
    return prisma.floorPrice.update({
      where: { id: existing.id },
      data: {
        floorPriceFcfaKg: floor_price_fcfa_kg,
        effectiveDate: effective_date ? new Date(effective_date) : new Date()
      },
      include: { product: true }
    });
  }

  return prisma.floorPrice.create({
    data: {
      productId: product_id,
      floorPriceFcfaKg: floor_price_fcfa_kg,
      effectiveDate: effective_date ? new Date(effective_date) : new Date()
    },
    include: { product: true }
  });
}

async function updateFloorPrice(id, { floor_price_fcfa_kg, effective_date }) {
  await getFloorPriceById(id);
  return prisma.floorPrice.update({
    where: { id },
    data: {
      ...(floor_price_fcfa_kg !== undefined && { floorPriceFcfaKg: floor_price_fcfa_kg }),
      ...(effective_date && { effectiveDate: new Date(effective_date) }),
    },
    include: { product: true },
  });
}

async function deleteFloorPrice(id) {
  await getFloorPriceById(id);
  return prisma.floorPrice.delete({ where: { id } });
}

module.exports = {
  getAllFloorPrices,
  getFloorPriceById,
  upsertFloorPrice,
  updateFloorPrice,
  deleteFloorPrice,
};