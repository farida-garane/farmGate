const prisma = require('../config/db');

async function getAllMarkets() {
  return await prisma.market.findMany({
    orderBy: { name: 'asc' }
  });
}

async function getMarketById(id) {
  const market = await prisma.market.findUnique({ where: { id } });
  if (!market) {
    const error = new Error('Marché introuvable');
    error.statusCode = 404;
    throw error;
  }
  return market;
}

async function createMarket({ name, region }) {
  const existing = await prisma.market.findFirst({ where: { name } });
  if (existing) {
    const error = new Error('Un marché avec ce nom existe déjà');
    error.statusCode = 409;
    throw error;
  }
  return prisma.market.create({
    data: { name, region },
  });
}

async function updateMarket(id, { name, region }) {
  await getMarketById(id);
  return prisma.market.update({
    where: { id },
    data: { name, region },
  });
}

async function deleteMarket(id) {
  await getMarketById(id);
  return prisma.market.delete({ where: { id } });
}

module.exports = {
  getAllMarkets,
  getMarketById,
  createMarket,
  updateMarket,
  deleteMarket,
};