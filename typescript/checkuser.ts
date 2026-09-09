// Run with: npx ts-node checkuser.ts
import dotenv from "dotenv";
dotenv.config();
import mysql, { RowDataPacket } from "mysql2/promise";

interface EmployeeRow extends RowDataPacket {
  Emp_id: number;
  name: string;
  email: string;
  password_hash: string;
  role_id: number;
  Dept_id: number | null;
  reporting_to: number | null;
  status: string;
}

async function run(): Promise<void> {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [rows] = await connection.query<EmployeeRow[]>(
    "SELECT Emp_id, name, email, password_hash, role_id, Dept_id, reporting_to, status FROM employees"
  );

  console.log(`Found ${rows.length} employee(s) in '${process.env.DB_NAME}':`);
  console.table(rows);

  await connection.end();
}

run().catch((err: Error) => console.error("❌ Failed:", err.message));

//omkar must be prepre 