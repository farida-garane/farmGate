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

async function create(req, res, next) {
  try {
    const { name, region } = req.body;
    if (!name || !region) {
      const error = new Error('name et region sont requis');
      error.statusCode = 400;
      throw error;
    }
    const market = await marketService.createMarket({ name, region });
    res.status(201).json({ status: 'success', data: market });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { name, region } = req.body;
    const market = await marketService.updateMarket(req.params.id, { name, region });
    res.status(200).json({ status: 'success', data: market });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const market = await marketService.deleteMarket(req.params.id);
    res.status(200).json({ status: 'success', data: market });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
};