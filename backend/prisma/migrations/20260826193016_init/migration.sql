-- CreateTable
CREATE TABLE "markets" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "region" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "markets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_reports" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "market_id" UUID NOT NULL,
    "reported_by" UUID NOT NULL,
    "price_fcfa_kg" DECIMAL(10,2) NOT NULL,
    "reported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "floor_prices" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "floor_price_fcfa_kg" DECIMAL(10,2) NOT NULL,
    "effective_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "floor_prices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "products_name_key" ON "products"("name");

-- CreateIndex
CREATE INDEX "idx_price_reports_product_id" ON "price_reports"("product_id");

-- CreateIndex
CREATE INDEX "idx_price_reports_market_id" ON "price_reports"("market_id");

-- CreateIndex
CREATE INDEX "idx_price_reports_reported_at" ON "price_reports"("reported_at");

-- CreateIndex
CREATE INDEX "idx_floor_prices_product_id" ON "floor_prices"("product_id");

-- AddForeignKey
ALTER TABLE "price_reports" ADD CONSTRAINT "price_reports_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_reports" ADD CONSTRAINT "price_reports_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_reports" ADD CONSTRAINT "price_reports_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "floor_prices" ADD CONSTRAINT "floor_prices_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
