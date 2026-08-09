const pool = require('../config/db');
const marketModel = require('../models/market.model');

async function getAllMarkets() {
  const result = await pool.query(`select * from ${marketModel.table} order by name`);
  return result.rows;
}

async function getMarketById(id) {
  const result = await pool.query(
    `select * from ${marketModel.table} where id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    const error = new Error('Marché introuvable');
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
}

module.exports = {
  getAllMarkets,
  getMarketById,
};