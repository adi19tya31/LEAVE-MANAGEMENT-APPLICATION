// Run: npx ts-node checktables.ts
import dotenv from "dotenv";
dotenv.config();
import mysql, { RowDataPacket } from "mysql2/promise";

async function run(): Promise<void> {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  for (const table of ["roles", "departments", "leave_types"]) {
    const [rows] = await connection.query<RowDataPacket[]>(`SELECT * FROM ${table}`);
    console.log(`\n--- ${table} (${rows.length} row(s)) ---`);
    console.table(rows);
  }

  await connection.end();
}

run().catch((err: Error) => console.error("❌ Failed:", err.message));