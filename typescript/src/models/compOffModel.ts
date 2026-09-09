import pool from "../config/db";
import { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export type CompOffStatus = "pending" | "approved" | "rejected";

export interface CompOffRequest {
  id: number;
  employee_id: number;
  work_date: string;
  reason: string;
  status: CompOffStatus;
  approver_id: number;
  applied_on: string;
  decided_on: string | null;
  remarks: string | null;
}

export interface CompOffWithNames extends CompOffRequest {
  employee_name: string;
  approver_name?: string;
}

async function create(input: {
  employeeId: number;
  workDate: string;
  reason: string;
  approverId: number;
}): Promise<CompOffWithNames | null> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO comp_off_requests
      (employee_id, work_date, reason, approver_id, status, applied_on)
     VALUES (?, ?, ?, ?, 'pending', NOW())`,
    [input.employeeId, input.workDate, input.reason, input.approverId],
  );
  return findById(result.insertId);
}

async function findById(id: number): Promise<CompOffWithNames | null> {
  const [rows] = await pool.query<(CompOffWithNames & RowDataPacket)[]>(
    `SELECT c.*, e.name AS employee_name, a.name AS approver_name
     FROM comp_off_requests c
     JOIN employees e ON e.Emp_id = c.employee_id
     LEFT JOIN employees a ON a.Emp_id = c.approver_id
     WHERE c.id = ?`,
    [id],
  );
  return rows[0] ?? null;
}

async function findByEmployee(employeeId: number): Promise<CompOffWithNames[]> {
  const [rows] = await pool.query<(CompOffWithNames & RowDataPacket)[]>(
    `SELECT c.*, e.name AS employee_name
     FROM comp_off_requests c
     JOIN employees e ON e.Emp_id = c.employee_id
     WHERE c.employee_id = ?
     ORDER BY c.applied_on DESC`,
    [employeeId],
  );
  return rows;
}

async function findPendingForApprover(approverId: number): Promise<CompOffWithNames[]> {
  const [rows] = await pool.query<(CompOffWithNames & RowDataPacket)[]>(
    `SELECT c.*, e.name AS employee_name
     FROM comp_off_requests c
     JOIN employees e ON e.Emp_id = c.employee_id
     WHERE c.approver_id = ? AND c.status = 'pending'
     ORDER BY c.applied_on ASC`,
    [approverId],
  );
  return rows;
}

async function findTeamHistory(approverId: number): Promise<CompOffWithNames[]> {
  const [rows] = await pool.query<(CompOffWithNames & RowDataPacket)[]>(
    `SELECT c.*, e.name AS employee_name
     FROM comp_off_requests c
     JOIN employees e ON e.Emp_id = c.employee_id
     WHERE e.reporting_to = ?
     ORDER BY c.applied_on DESC`,
    [approverId],
  );
  return rows;
}

async function findAllHistory(): Promise<CompOffWithNames[]> {
  const [rows] = await pool.query<(CompOffWithNames & RowDataPacket)[]>(
    `SELECT c.*, e.name AS employee_name
     FROM comp_off_requests c
     JOIN employees e ON e.Emp_id = c.employee_id
     ORDER BY c.applied_on DESC`,
  );
  return rows;
}

async function updateDecision(
  id: number,
  approverId: number,
  status: Exclude<CompOffStatus, "pending">,
  remarks: string | null,
  connection: Pool | PoolConnection = pool,
): Promise<void> {
  await connection.query(
    `UPDATE comp_off_requests
     SET status = ?, decided_on = NOW(), remarks = ?
     WHERE id = ? AND approver_id = ? AND status = 'pending'`,
    [status, remarks, id, approverId],
  );
}


export default {
  create,
  findById,
  findByEmployee,
  findPendingForApprover,
  findTeamHistory,
  findAllHistory,
  updateDecision,
};
