const pool = require('../config/db');
const priceReportModel = require('../models/priceReport.model');

async function getAllPriceReports() {
  const result = await pool.query(
    `select * from ${priceReportModel.table} order by reported_at desc`
  );
  return result.rows;
}

async function getPriceReportById(id) {
  const result = await pool.query(
    `select * from ${priceReportModel.table} where id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    const error = new Error('Signalement introuvable');
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
}

async function createPriceReport({ product_id, market_id, reported_by, price_fcfa_kg }) {
  const result = await pool.query(
    `insert into ${priceReportModel.table} (product_id, market_id, reported_by, price_fcfa_kg)
     values ($1, $2, $3, $4)
     returning *`,
    [product_id, market_id, reported_by, price_fcfa_kg]
  );
  return result.rows[0];
}

async function deletePriceReport(id) {
  const result = await pool.query(
    `delete from ${priceReportModel.table} where id = $1 returning *`,
    [id]
  );

  if (result.rows.length === 0) {
    const error = new Error('Signalement introuvable');
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
}

module.exports = {
  getAllPriceReports,
  getPriceReportById,
  createPriceReport,
  deletePriceReport,
};