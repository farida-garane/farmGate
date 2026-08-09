const pool = require('../config/db');
const floorPriceModel = require('../models/floorPrice.model');
const productModel = require('../models/product.model');

async function getAllFloorPrices() {
  const result = await pool.query(`
    select fp.id, p.name as product_name, fp.floor_price_fcfa_kg, fp.effective_date
    from ${floorPriceModel.table} fp
    join ${productModel.table} p on p.id = fp.product_id
    order by p.name
  `);
  return result.rows;
}

async function getFloorPriceById(id) {
  const result = await pool.query(
    `select fp.id, p.name as product_name, fp.floor_price_fcfa_kg, fp.effective_date
     from ${floorPriceModel.table} fp
     join ${productModel.table} p on p.id = fp.product_id
     where fp.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    const error = new Error('Prix plancher introuvable');
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
}

module.exports = {
  getAllFloorPrices,
  getFloorPriceById,
};