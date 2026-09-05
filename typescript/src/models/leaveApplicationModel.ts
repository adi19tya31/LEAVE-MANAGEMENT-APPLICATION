import pool from "../config/db";
import { Pool, RowDataPacket, ResultSetHeader, PoolConnection } from "mysql2/promise";
import { LeaveApplication, LeaveApplicationWithNames, LeaveApplicationStatus } from "../types";

interface CreateApplicationInput {
  employeeId: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  durationType: "FULL_DAY" | "HALF_DAY_FIRST" | "HALF_DAY_SECOND";
  totalDays: number;
  reason: string;
  approverId: number;
}

async function create(
  input: CreateApplicationInput
): Promise<LeaveApplicationWithNames | null> {
  const {
    employeeId,
    leaveTypeId,
    startDate,
    endDate,
    totalDays,
    durationType,
    reason,
    approverId,
  } = input;

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO leave_applications
      (
        employee_id,
        leave_type_id,
        start_date,
        end_date,
        total_days,
        duration_type,
        reason,
        approver_id,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      employeeId,
      leaveTypeId,
      startDate,
      endDate,
      totalDays,
      durationType,
      reason,
      approverId,
    ]
  );

  return findById(result.insertId);
}

async function findById(id: number): Promise<LeaveApplicationWithNames | null> {
  const [rows] = await pool.query<(LeaveApplicationWithNames & RowDataPacket)[]>(
    `SELECT la.*, lt.name AS leave_type_name, e.name AS applicant_name
     FROM leave_applications la
     JOIN leave_types lt ON lt.id = la.leave_type_id
     JOIN employees e ON e.Emp_id = la.employee_id
     WHERE la.id = ?`,
    [id]
  );
  return rows[0] ?? null;
}

async function findByEmployee(employeeId: number): Promise<LeaveApplicationWithNames[]> {
  const [rows] = await pool.query<(LeaveApplicationWithNames & RowDataPacket)[]>(
    `SELECT la.*, lt.name AS leave_type_name
     FROM leave_applications la
     JOIN leave_types lt ON lt.id = la.leave_type_id
     WHERE la.employee_id = ?
     ORDER BY la.applied_on DESC`,
    [employeeId]
  );
  return rows;
}

// An approver's queue — this is the query that makes the whole hierarchy work:
// it needs no per-team or per-level branching, just a filter on approver_id.
async function findPendingForApprover(approverId: number): Promise<LeaveApplicationWithNames[]> {
  const [rows] = await pool.query<(LeaveApplicationWithNames & RowDataPacket)[]>(
    `SELECT la.*, lt.name AS leave_type_name, e.name AS applicant_name
     FROM leave_applications la
     JOIN leave_types lt ON lt.id = la.leave_type_id
     JOIN employees e ON e.Emp_id = la.employee_id
     WHERE la.approver_id = ? AND la.status = 'pending'
     ORDER BY la.applied_on ASC`,
    [approverId]
  );
  return rows;
}

async function updateStatus(
  id: number,
  status: LeaveApplicationStatus,
  connection: Pool | PoolConnection = pool
): Promise<LeaveApplicationWithNames | null> {
  await connection.query(
    "UPDATE leave_applications SET status = ?, decided_on = NOW() WHERE id = ?",
    [status, id]
  );
  return findById(id);
}

export default { create, findById, findByEmployee, findPendingForApprover, updateStatus };
