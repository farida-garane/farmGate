const pool = require('../../config/db');

const markets = [
  { name: 'Tougan', region: 'Boucle du Mouhoun' },
  { name: 'Solenzo', region: 'Boucle du Mouhoun' },
  { name: 'Djibo', region: 'Sahel' },
  { name: 'Dori', region: 'Sahel' },
  { name: 'Gorom-Gorom', region: 'Sahel' },
  { name: 'Markoye', region: 'Sahel' },
  { name: 'Arbinda', region: 'Sahel' },
  { name: 'Oursi', region: 'Sahel' },
  { name: 'Gorgadji', region: 'Sahel' },
  { name: 'Titao', region: 'Nord' },
  { name: 'Barsalgho', region: 'Centre-Nord' },
  { name: 'Dablo', region: 'Centre-Nord' },
  { name: 'Bouroum', region: 'Centre-Nord' },
  { name: 'Yalgo', region: 'Centre-Nord' },
  { name: 'Fada N\'Gourma', region: 'Est' },
  { name: 'Gayéri', region: 'Est' },
  { name: 'Founza', region: 'Sud-Ouest' },
];

async function seedMarkets() {
  for (const { name, region } of markets) {
    await pool.query(
      `INSERT INTO markets (name, region) VALUES ($1, $2)`,
      [name, region]
    );
  }
  console.log(`Marchés insérés : ${markets.length}`);
}

module.exports = seedMarkets;