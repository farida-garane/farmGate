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

module.exports = {
  list,
  getOne,
};