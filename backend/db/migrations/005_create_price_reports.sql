CREATE TABLE IF NOT EXISTS price_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  price_fcfa_kg NUMERIC(10,2) NOT NULL,
  reported_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_reports_product_id ON price_reports(product_id);
CREATE INDEX IF NOT EXISTS idx_price_reports_market_id ON price_reports(market_id);
CREATE INDEX IF NOT EXISTS idx_price_reports_reported_at ON price_reports(reported_at);