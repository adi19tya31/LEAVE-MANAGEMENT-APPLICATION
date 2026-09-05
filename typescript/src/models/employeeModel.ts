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

async function findAll(): Promise<Employee[]> {
  const [rows] = await pool.query<(Employee & RowDataPacket)[]>(
    "SELECT * FROM employees",
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

export default {
  findAll,
  findById,
  findByEmail,
  getReportingTo,
  create,
  updateStatus,
  findDirectReports,
};
