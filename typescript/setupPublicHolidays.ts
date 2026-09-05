
import dotenv from "dotenv";
dotenv.config();
import mysql from "mysql2/promise";

async function run(): Promise<void> {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await connection.query(`
    CREATE TABLE IF NOT EXISTS public_holidays (
      id INT AUTO_INCREMENT PRIMARY KEY,
      holiday_date DATE NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL
    )
  `);

  await connection.end();
  console.log("Public holidays table is ready.");
}

run().catch((err: Error) => console.error("Failed:", err.message));
