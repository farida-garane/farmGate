const floorPriceService = require('../services/floorPrice.service');

async function list(req, res, next) {
  try {
    const floorPrices = await floorPriceService.getAllFloorPrices();
    res.status(200).json({ status: 'success', data: floorPrices });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const floorPrice = await floorPriceService.getFloorPriceById(req.params.id);
    res.status(200).json({ status: 'success', data: floorPrice });
  } catch (err) {
    next(err);
  }
}

async function upsert(req, res, next) {
  try {
    const { product_id, floor_price_fcfa_kg, effective_date } = req.body;

    if (!product_id || floor_price_fcfa_kg === undefined) {
      const error = new Error('product_id et floor_price_fcfa_kg sont requis');
      error.statusCode = 400;
      throw error;
    }

    const result = await floorPriceService.upsertFloorPrice({
      product_id,
      floor_price_fcfa_kg,
      effective_date
    });

    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { floor_price_fcfa_kg, effective_date } = req.body;
    const result = await floorPriceService.updateFloorPrice(req.params.id, {
      floor_price_fcfa_kg,
      effective_date,
    });
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await floorPriceService.deleteFloorPrice(req.params.id);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  getOne,
  upsert,
  update,
  remove,
};