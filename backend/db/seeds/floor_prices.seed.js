const pool = require('../../config/db');

const floorPrices = [
  { product: 'Noix brute de cajou', price: 385 },
  { product: 'Mangue fraîche', price: 95 },
  { product: 'Oignon', price: 165 },
  { product: 'Sésame', price: 450 },
  { product: 'Tomate', price: 195 },
  { product: 'Miel brut', price: 1000 },
  { product: 'Soja', price: 325 },
  { product: 'Maïs', price: 135 },
  { product: 'Niébé', price: 400 },
  { product: 'Arachide en coque', price: 360 },
  { product: 'Arachide décortiquée', price: 575 },
];

async function seedFloorPrices() {
  for (const { product, price } of floorPrices) {
    const { rows } = await pool.query(
      `SELECT id FROM products WHERE name = $1`,
      [product]
    );

    if (rows.length === 0) {
      console.warn(`Produit introuvable, ignoré : ${product}`);
      continue;
    }

    const productId = rows[0].id;

    await pool.query(
      `INSERT INTO floor_prices (product_id, floor_price_fcfa_kg)
       VALUES ($1, $2)`,
      [productId, price]
    );
  }
  console.log(`Prix planchers insérés : ${floorPrices.length}`);
}

module.exports = seedFloorPrices;