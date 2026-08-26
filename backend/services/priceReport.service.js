const prisma = require('../config/db');

async function getAllPriceReports() {
  const reports = await prisma.priceReport.findMany({
    orderBy: { reportedAt: 'desc' }
  });
  return reports.map(r => ({
    id: r.id,
    product_id: r.productId,
    market_id: r.marketId,
    reported_by: r.reportedBy,
    price_fcfa_kg: r.priceFcfaKg,
    reported_at: r.reportedAt
  }));
}

async function getPriceReportById(id) {
  const report = await prisma.priceReport.findUnique({ where: { id } });

  if (!report) {
    const error = new Error('Signalement introuvable');
    error.statusCode = 404;
    throw error;
  }

  return {
    id: report.id,
    product_id: report.productId,
    market_id: report.marketId,
    reported_by: report.reportedBy,
    price_fcfa_kg: report.priceFcfaKg,
    reported_at: report.reportedAt
  };
}

async function createPriceReport({ product_id, market_id, reported_by, price_fcfa_kg }) {
  const report = await prisma.priceReport.create({
    data: {
      productId: product_id,
      marketId: market_id,
      reportedBy: reported_by, // Attention: il faut s'assurer que le controller l'envoie !
      priceFcfaKg: price_fcfa_kg
    }
  });
  
  return {
    id: report.id,
    product_id: report.productId,
    market_id: report.marketId,
    reported_by: report.reportedBy,
    price_fcfa_kg: report.priceFcfaKg,
    reported_at: report.reportedAt
  };
}

async function deletePriceReport(id) {
  const report = await prisma.priceReport.delete({ where: { id } }).catch(() => null);

  if (!report) {
    const error = new Error('Signalement introuvable');
    error.statusCode = 404;
    throw error;
  }

  return {
    id: report.id,
    product_id: report.productId,
    market_id: report.marketId,
    reported_by: report.reportedBy,
    price_fcfa_kg: report.priceFcfaKg,
    reported_at: report.reportedAt
  };
}

module.exports = {
  getAllPriceReports,
  getPriceReportById,
  createPriceReport,
  deletePriceReport,
};