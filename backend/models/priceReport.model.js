const priceReportModel = {
    table: "price_reports",
    columns: {
        id: "uuid primary key default gen_random_uuid()",
        product_id: "uuid not null references products(id) on delete cascade",
        market_id: "uuid not null references markets(id) on delete cascade",
        reported_by: "uuid not null references users(id) on delete cascade",
        price_fcfa_kg: "numeric(10,2) not null",
        reported_at: "timestamp default now()"
    }
};

module.exports = priceReportModel;