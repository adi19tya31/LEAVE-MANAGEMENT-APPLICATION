import pool from "../config/db";
import {
  Pool,
  RowDataPacket,
  ResultSetHeader,
  PoolConnection,
} from "mysql2/promise";
import {
  LeaveApplication,
  LeaveApplicationWithNames,
  LeaveApplicationStatus,
} from "../types";

interface CreateApplicationInput {
  employeeId: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  startDayType: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";

  endDayType: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";
  totalDays: number;
  reason: string;
  approverId: number;
}

async function create(
  input: CreateApplicationInput,
): Promise<LeaveApplicationWithNames | null> {
  const {
    employeeId,
    leaveTypeId,
    startDate,
    endDate,
    totalDays,
    startDayType,
    endDayType,
    reason,
    approverId,
  } = input;

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO leave_applications (
  employee_id,
  leave_type_id,
  start_date,
  end_date,
  start_day_type,
  end_day_type,
  total_days,
  duration_type,
  reason,
  approver_id,
  status
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
    [
      employeeId,
      leaveTypeId,
      startDate,
      endDate,
      startDayType,
      endDayType,
      totalDays,
      "FULL_DAY",
      reason,
      approverId,
    ],
  );

  return findById(result.insertId);
}

async function findById(id: number): Promise<LeaveApplicationWithNames | null> {
  const [rows] = await pool.query<
    (LeaveApplicationWithNames & RowDataPacket)[]
  >(
    `SELECT la.*, lt.name AS leave_type_name, e.name AS applicant_name
     FROM leave_applications la
     JOIN leave_types lt ON lt.id = la.leave_type_id
     JOIN employees e ON e.Emp_id = la.employee_id
     WHERE la.id = ?`,
    [id],
  );
  return rows[0] ?? null;
}

async function findByEmployee(
  employeeId: number,
): Promise<LeaveApplicationWithNames[]> {
  const [rows] = await pool.query<
    (LeaveApplicationWithNames & RowDataPacket)[]
  >(
    `SELECT la.*, lt.name AS leave_type_name
     FROM leave_applications la
     JOIN leave_types lt ON lt.id = la.leave_type_id
     WHERE la.employee_id = ?
     ORDER BY la.applied_on DESC`,
    [employeeId],
  );
  return rows;
}

// An approver's queue — this is the query that makes the whole hierarchy work:
// it needs no per-team or per-level branching, just a filter on approver_id.
async function findTeamHistory(
  approverId: number,
): Promise<LeaveApplicationWithNames[]> {
  const [rows] = await pool.query<
    (LeaveApplicationWithNames & RowDataPacket)[]
  >(
    `SELECT la.*, lt.name AS leave_type_name, e.name AS applicant_name
     FROM leave_applications la
     JOIN leave_types lt ON lt.id = la.leave_type_id
     JOIN employees e ON e.Emp_id = la.employee_id
     WHERE e.reporting_to = ?
     ORDER BY la.applied_on DESC`,
    [approverId],
  );
  return rows;
}

async function findAllHistory(): Promise<LeaveApplicationWithNames[]> {
  const [rows] = await pool.query<
    (LeaveApplicationWithNames & RowDataPacket)[]
  >(
    `SELECT la.*, lt.name AS leave_type_name, e.name AS applicant_name
     FROM leave_applications la
     JOIN leave_types lt ON lt.id = la.leave_type_id
     JOIN employees e ON e.Emp_id = la.employee_id
     ORDER BY la.applied_on DESC`,
  );
  return rows;
}

async function findPendingForApprover(
  approverId: number,
): Promise<LeaveApplicationWithNames[]> {
  const [rows] = await pool.query<
    (LeaveApplicationWithNames & RowDataPacket)[]
  >(
    `SELECT la.*, lt.name AS leave_type_name, e.name AS applicant_name
     FROM leave_applications la
     JOIN leave_types lt ON lt.id = la.leave_type_id
     JOIN employees e ON e.Emp_id = la.employee_id
     WHERE la.approver_id = ? AND la.status = 'pending'
     ORDER BY la.applied_on ASC`,
    [approverId],
  );
  return rows;
}

async function updateStatus(
  id: number,
  status: LeaveApplicationStatus,
  connection: Pool | PoolConnection = pool,
): Promise<LeaveApplicationWithNames | null> {
  await connection.query(
    "UPDATE leave_applications SET status = ?, decided_on = NOW() WHERE id = ?",
    [status, id],
  );
  return findById(id);
}


async function findForCalendar(
  approverId?: number,
): Promise<LeaveApplicationWithNames[]> {
  const params: number[] = [];

  let managerCondition = "";

  if (approverId) {
    managerCondition = "WHERE la.approver_id = ?";
    params.push(approverId);
  }

  const [rows] = await pool.query<
    (LeaveApplicationWithNames & RowDataPacket)[]
  >(
    `
    SELECT
      la.*,
      lt.name AS leave_type_name,
      e.name AS applicant_name,
      d.name AS department_name

    FROM leave_applications la

    JOIN leave_types lt
      ON lt.id = la.leave_type_id

    JOIN employees e
      ON e.Emp_id = la.employee_id

    LEFT JOIN departments d
      ON d.id = e.Dept_id

    ${managerCondition}

    ORDER BY la.start_date ASC
    `,
    params,
  );

  return rows;
}

export default {
  create,
  findById,
  findByEmployee,
  findTeamHistory,
  findAllHistory,
  findPendingForApprover,
  //findApprovedForCalendar,
  findForCalendar,
  updateStatus,
};