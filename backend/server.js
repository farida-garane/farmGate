const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FarmGate backend opérationnel' });
});

app.use('/api/products', require('./routes/product.routes'));
app.use('/api/markets', require('./routes/market.routes'));
app.use('/api/price-reports', require('./routes/priceReport.routes'));
app.use('/api/floor-prices', require('./routes/floorPrice.routes'));
app.use('/api/auth', require('./routes/auth.routes'));

const errorHandler = require('./middleware/errorHandler.middleware');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur FarmGate lancé sur le port ${PORT}`);
});