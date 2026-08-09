const pool = require('../config/db');
const productModel = require('../models/product.model');

async function getAllProducts() {
  const result = await pool.query(`select * from ${productModel.table} order by name`);
  return result.rows;
}

async function getProductById(id) {
  const result = await pool.query(
    `select * from ${productModel.table} where id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    const error = new Error('Produit introuvable');
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
}

module.exports = {
  getAllProducts,
  getProductById,
};