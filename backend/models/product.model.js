const productModel = {
    table: "products",
    columns: {
        id: "uuid primary key default gen_random_uuid()",
        name: "varchar(100) unique not null",
        created_at: "timestamp default now()"
    }
};

module.exports = productModel;