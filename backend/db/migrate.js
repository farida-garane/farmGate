const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (!file.endsWith('.sql')) continue;
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`Exécution de la migration : ${file}`);
    try {
      await pool.query(sql);
      console.log(`OK : ${file}`);
    } catch (err) {
      console.error(`Erreur dans ${file} :`, err.message);
      process.exit(1);
    }
  }

  console.log('Toutes les migrations ont été exécutées.');
  await pool.end();
}

runMigrations();