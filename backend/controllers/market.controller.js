const marketService = require('../services/market.service');

async function list(req, res, next) {
  try {
    const markets = await marketService.getAllMarkets();
    res.status(200).json({ status: 'success', data: markets });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const market = await marketService.getMarketById(req.params.id);
    res.status(200).json({ status: 'success', data: market });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  getOne,
};