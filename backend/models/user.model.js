const userModel = {
    table: "users",
    columns: {
        id: "uuid primary key default gen_random_uuid()",
        full_name: "varchar(150) not null",
        phone: "varchar(20) unique not null",
        password_hash: "varchar(255) not null",
        role: "varchar(20) not null check (role in ('agriculteur', 'acheteur', 'relais'))",
        created_at: "timestamp default now()"
    }
};

module.exports = userModel;