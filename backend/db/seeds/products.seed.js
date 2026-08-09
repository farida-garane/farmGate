const pool = require('../../config/db');

const products = [
  'Noix brute de cajou',
  'Mangue fraîche',
  'Oignon',
  'Sésame',
  'Tomate',
  'Miel brut',
  'Soja',
  'Maïs',
  'Niébé',
  'Arachide en coque',
  'Arachide décortiquée',
];

async function seedProducts() {
  for (const name of products) {
    await pool.query(
      `INSERT INTO products (name) VALUES ($1)
       ON CONFLICT (name) DO NOTHING`,
      [name]
    );
  }
  console.log(`Produits insérés : ${products.length}`);
}

module.exports = seedProducts;