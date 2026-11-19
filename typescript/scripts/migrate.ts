import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const migrationsDir = path.join(process.cwd(), "migrations");

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  console.log(`Connected to database: ${process.env.DB_NAME}`);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      migration_name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const [rows] = await connection.execute(
    "SELECT migration_name FROM schema_migrations ORDER BY id"
  );

  const executedMigrations = new Set(
    (rows as { migration_name: string }[]).map(
      (row) => row.migration_name
    )
  );

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of migrationFiles) {
    if (executedMigrations.has(file)) {
      console.log(`SKIP: ${file}`);
      continue;
    }

    console.log(`RUN: ${file}`);

    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf8");

    try {
      await connection.query(sql);

      await connection.execute(
        "INSERT INTO schema_migrations (migration_name) VALUES (?)",
        [file]
      );

      console.log(`SUCCESS: ${file}`);
    } catch (error) {
      console.error(`FAILED: ${file}`);
      console.error(error);
      await connection.end();
      process.exit(1);
    }
  }

  console.log("All migrations completed.");

  await connection.end();
}

runMigrations().catch((error) => {
  console.error("Migration runner failed:");
  console.error(error);
  process.exit(1);
});