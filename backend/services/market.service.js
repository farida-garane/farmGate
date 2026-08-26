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

module.exports = {
  getAllMarkets,
  getMarketById,
};