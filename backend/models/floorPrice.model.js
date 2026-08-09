const floorPriceModel = {
    table: "floor_prices",
    columns: {
        id: "uuid primary key default gen_random_uuid()",
        product_id: "uuid not null references products(id) on delete cascade",
        floor_price_fcfa_kg: "numeric(10,2) not null",
        effective_date: "date default current_date",
        created_at: "timestamp default now()"
    }
};

module.exports = floorPriceModel;