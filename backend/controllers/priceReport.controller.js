const priceReportService = require('../services/priceReport.service');

async function list(req, res, next) {
  try {
    const reports = await priceReportService.getAllPriceReports();
    res.status(200).json({ status: 'success', data: reports });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { product_id, market_id, price_fcfa_kg } = req.body;

    if (!product_id || !market_id || !price_fcfa_kg) {
      const error = new Error('product_id, market_id et price_fcfa_kg sont requis');
      error.statusCode = 400;
      throw error;
    }

    const newReport = await priceReportService.createPriceReport({
      product_id,
      market_id,
      price_fcfa_kg,
    });

    res.status(201).json({ status: 'success', data: newReport });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const report = await priceReportService.getPriceReportById(req.params.id);
    res.status(200).json({ status: 'success', data: report });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await priceReportService.deletePriceReport(req.params.id);
    res.status(200).json({ status: 'success', data: deleted });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  create,
  getOne,
  remove,
};