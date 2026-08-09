const pool = require('../config/db');
const seedProducts = require('./seeds/products.seed');
const seedFloorPrices = require('./seeds/floor_prices.seed');
const seedMarkets = require('./seeds/markets.seed');

async function runSeeds() {
  try {
    await seedProducts();
    await seedFloorPrices();
    await seedMarkets();
    console.log('Tous les seeds ont été exécutés.');
  } catch (err) {
    console.error('Erreur pendant le seed :', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeeds();