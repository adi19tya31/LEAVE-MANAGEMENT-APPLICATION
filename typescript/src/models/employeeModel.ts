import pool from "../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { Employee } from "../types";

// Aadhaar: exactly 12 digits. PAN: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).
const AADHAR_REGEX = /^\d{12}$/;
const PAN_REGEX = /^[A-Z]{5}\d{4}[A-Z]$/;

export function isValidAadhar(value: string): boolean {
  return AADHAR_REGEX.test(value);
}

export function isValidPan(value: string): boolean {
  return PAN_REGEX.test(value.toUpperCase());
}

interface CreateEmployeeInput {
  name: string;
  company?: string | null;
  employeeCode?: string | null;
  aadharNo?: string | null;
  panNo?: string | null;
  email: string;
  passwordHash: string;
  roleId: number;
  deptId: number | null;
  reportingTo: number | null;
}

async function findAll(): Promise<any[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT
      e.Emp_id,
      e.name,
      e.company,
      e.employee_code,
      e.email,
      e.status,
      e.created_at,

      r.name AS role_name,

      d.name AS department_name,

      manager.Emp_id AS reporting_to_id,
      manager.name AS reporting_to_name

    FROM employees e

    LEFT JOIN roles r
      ON r.id = e.role_id

    LEFT JOIN departments d
      ON d.id = e.Dept_id

    LEFT JOIN employees manager
      ON manager.Emp_id = e.reporting_to

    ORDER BY e.Emp_id DESC
    `,
  );

  return rows;
}

async function findById(empId: number): Promise<Employee | null> {
  const [rows] = await pool.query<(Employee & RowDataPacket)[]>(
    "SELECT * FROM employees WHERE Emp_id = ?",
    [empId],
  );
  return rows[0] ?? null;
}

async function findByEmail(email: string): Promise<Employee | null> {
  const [rows] = await pool.query<(Employee & RowDataPacket)[]>(
    "SELECT * FROM employees WHERE email = ?",
    [email],
  );
  return rows[0] ?? null;
}

async function getReportingTo(empId: number): Promise<number | null> {
  const employee = await findById(empId);
  if (!employee) throw new Error("Employee not found");
  return employee.reporting_to;
}

async function create(input: CreateEmployeeInput): Promise<Employee | null> {
  const {
    name,
    company,
    employeeCode,
    aadharNo,
    panNo,
    email,
    passwordHash,
    roleId,
    deptId,
    reportingTo,
  } = input;

  if (aadharNo && !isValidAadhar(aadharNo)) {
    throw new Error("Aadhaar number must be exactly 12 digits.");
  }
  if (panNo && !isValidPan(panNo)) {
    throw new Error("PAN must be in the format ABCDE1234F.");
  }

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO employees
       (name, company, employee_code, aadhar_no, pan_no, email, password_hash, role_id, Dept_id, reporting_to, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
    [
      name,
      company ?? null,
      employeeCode ?? null,
      aadharNo ?? null,
      panNo ?? null,
      email,
      passwordHash,
      roleId,
      deptId,
      reportingTo ?? null,
    ],
  );
  return findById(result.insertId);
}

async function updateStatus(
  empId: number,
  status: Employee["status"],
): Promise<Employee | null> {
  await pool.query("UPDATE employees SET status = ? WHERE Emp_id = ?", [
    status,
    empId,
  ]);
  return findById(empId);
}

// All direct reports of a given employee — useful for a manager's team view.
async function findDirectReports(empId: number): Promise<Employee[]> {
  const [rows] = await pool.query<(Employee & RowDataPacket)[]>(
    "SELECT * FROM employees WHERE reporting_to = ?",
    [empId],
  );
  return rows;
}

async function updatePassword(
  empId: number,
  passwordHash: string,
): Promise<Employee | null> {
  await pool.query("UPDATE employees SET password_hash = ? WHERE Emp_id = ?", [
    passwordHash,
    empId,
  ]);

  return findById(empId);
}

async function saveResetToken(
  empId: number,
  token: string,
  expires: Date,
): Promise<void> {
  await pool.query(
    `UPDATE employees
     SET reset_token = ?, reset_token_expires = ?
     WHERE Emp_id = ?`,
    [token, expires, empId],
  );
}

async function findByResetToken(token: string): Promise<Employee | null> {
  const [rows] = await pool.query<(Employee & RowDataPacket)[]>(
    `SELECT *
     FROM employees
     WHERE reset_token = ?
     AND reset_token_expires > NOW()`,
    [token],
  );

  return rows[0] ?? null;
}

async function clearResetToken(empId: number): Promise<void> {
  await pool.query(
    `UPDATE employees
     SET reset_token = NULL,
         reset_token_expires = NULL
     WHERE Emp_id = ?`,
    [empId],
  );
}

export default {
  findAll,
  findById,
  findByEmail,
  getReportingTo,
  create,
  updateStatus,
  updatePassword,
  findDirectReports,

  saveResetToken,
  findByResetToken,
  clearResetToken,
};
