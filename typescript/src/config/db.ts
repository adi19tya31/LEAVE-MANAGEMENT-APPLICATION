import mysql, { Pool } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

// A pool, not a single connection — Express is multi-request, so every
// query borrows a connection and returns it instead of fighting over one.
const pool: Pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true, // return DATE columns as 'YYYY-MM-DD' strings, not JS Date objects
});

export default pool;
