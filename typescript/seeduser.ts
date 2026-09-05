// Run with: npx ts-node seeduser.ts
// Creates one manager (approver) and one employee reporting to them,
// using the current Emp_id / role_id / Dept_id / reporting_to schema.
import dotenv from "dotenv";
dotenv.config();
import mysql, { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import bcrypt from "bcryptjs";

interface LeaveTypeIdRow extends RowDataPacket {
  id: number;
}

async function run(): Promise<void> {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const passwordHash = bcrypt.hashSync("test1234", 10);

  // role_id 2 = manager, role_id 1 = employee (per schema_updated.sql seed data)
  // Dept_id 1 = Development (already seeded)

  const [managerResult] = await connection.query<ResultSetHeader>(
    `INSERT INTO employees (name, email, password_hash, role_id, Dept_id, reporting_to, status)
     VALUES ('Rohit Manager', 'manager@test.com', ?, 2, 1, NULL, 'active')`,
    [passwordHash]
  );
  const managerId = managerResult.insertId;
  console.log(`✅ Manager created with Emp_id = ${managerId}`);

  const [empResult] = await connection.query<ResultSetHeader>(
    `INSERT INTO employees (name, email, password_hash, role_id, Dept_id, reporting_to, status)
     VALUES ('Aditya Test', 'aditya@test.com', ?, 1, 1, ?, 'active')`,
    [passwordHash, managerId]
  );
  const employeeId = empResult.insertId;
  console.log(`✅ Employee created with Emp_id = ${employeeId}, reporting_to = ${managerId}`);

  // Give the test employee a balance for every leave type, current year
  const [leaveTypes] = await connection.query<LeaveTypeIdRow[]>("SELECT id FROM leave_types");
  const year = new Date().getFullYear();
  for (const lt of leaveTypes) {
    await connection.query(
      `INSERT INTO leave_balances (employee_id, leave_type_id, year, allocated_days, used_days)
       VALUES (?, ?, ?, 12, 0)`,
      [employeeId, lt.id, year]
    );
  }
  console.log(`✅ Leave balances created for employee ${employeeId}, year ${year}`);

  console.log("\nLogin with:");
  console.log("  email: aditya@test.com");
  console.log("  password: test1234");

  await connection.end();
}

run().catch((err: Error) => console.error("❌ Failed:", err.message));