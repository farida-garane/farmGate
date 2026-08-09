const marketModel = {
    table: "markets",
    columns: {
        id: "uuid primary key default gen_random_uuid()",
        name: "varchar(100) not null",
        region: "varchar(100) not null",
        created_at: "timestamp default now()"
    }
};

module.exports = marketModel;