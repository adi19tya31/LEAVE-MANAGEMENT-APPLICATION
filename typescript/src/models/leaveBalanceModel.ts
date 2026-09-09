import pool from "../config/db";
import { Pool, RowDataPacket, ResultSetHeader, PoolConnection } from "mysql2/promise";
import { LeaveBalance, LeaveBalanceWithType } from "../types";

async function getBalance(
  employeeId: number,
  leaveTypeId: number,
  year: number
): Promise<LeaveBalance | null> {
  const [rows] = await pool.query<(LeaveBalance & RowDataPacket)[]>(
    "SELECT * FROM leave_balances WHERE employee_id = ? AND leave_type_id = ? AND year = ?",
    [employeeId, leaveTypeId, year]
  );
  return rows[0] ?? null;
}

async function listForEmployee(
  employeeId: number,
  year: number
): Promise<LeaveBalanceWithType[]> {
  const [rows] = await pool.query<(LeaveBalanceWithType & RowDataPacket)[]>(
    `SELECT lb.*, lt.name AS leave_type_name, lt.max_days_per_year,
            (lb.allocated_days - lb.used_days) AS remaining_days
     FROM leave_balances lb
     JOIN leave_types lt ON lt.id = lb.leave_type_id
     WHERE lb.employee_id = ? AND lb.year = ?`,
    [employeeId, year]
  );
  return rows;
}

// Creates a starting balance row — e.g. when a new employee joins,
// or a new leave type is rolled out and needs a row per existing employee.
async function create(input: {
  employeeId: number;
  leaveTypeId: number;
  year: number;
  allocatedDays: number;
}): Promise<LeaveBalance> {
  const { employeeId, leaveTypeId, year, allocatedDays } = input;
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO leave_balances (employee_id, leave_type_id, year, allocated_days, used_days)
     VALUES (?, ?, ?, ?, 0)`,
    [employeeId, leaveTypeId, year, allocatedDays]
  );
  const [rows] = await pool.query<(LeaveBalance & RowDataPacket)[]>(
    "SELECT * FROM leave_balances WHERE id = ?",
    [result.insertId]
  );
  return rows[0];
}

// Called only when an application is APPROVED, never at submission time —
// balances should reflect confirmed leave, not pending requests.
// Accepts an optional transaction connection so it can participate in
// leaveService's approve/reject transaction.
async function incrementUsedDays(
  employeeId: number,
  leaveTypeId: number,
  year: number,
  days: number,
  connection: Pool | PoolConnection = pool
): Promise<void> {
  await connection.query(
    "UPDATE leave_balances SET used_days = used_days + ? WHERE employee_id = ? AND leave_type_id = ? AND year = ?",
    [days, employeeId, leaveTypeId, year]
  );
}

export default { getBalance, listForEmployee, create, incrementUsedDays };
