import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import employeeModel, {
  isValidAadhar,
  isValidPan,
} from "../models/employeeModel";
import roleModel from "../models/roleModel";
import departmentModel from "../models/departmentModel";
import leaveTypeModel from "../models/leaveTypeModel";
import leaveBalanceModel from "../models/leaveBalanceModel";
import { currentYear } from "../utils/dateUtils";

interface RegisterEmployeeBody {
  name: string;
  company?: string;
  employeeCode?: string;
  aadharNo?: string;
  panNo?: string;
  email: string;
  password: string;
  roleName: string; // e.g. "employee", "manager", "ceo"
  departmentName?: string; // e.g. "Development"
  reportingTo?: number; // Emp_id of their manager — omit only for the very top of the hierarchy
}

// POST /api/employees — register a new employee, and give them a starting
// leave balance for every leave type so they can apply for leave right away.
export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const {
      name,
      company,
      employeeCode,
      aadharNo,
      panNo,
      email,
      password,
      roleName,
      departmentName,
      reportingTo,
    } = req.body as RegisterEmployeeBody;

    // --- required fields ---
    if (!name || !email || !password || !roleName) {
      res
        .status(400)
        .json({ error: "name, email, password and roleName are required." });
      return;
    }

    // --- format validation, same rules as the model enforces on insert ---
    if (aadharNo && !isValidAadhar(aadharNo)) {
      res
        .status(400)
        .json({ error: "Aadhaar number must be exactly 12 digits." });
      return;
    }
    if (panNo && !isValidPan(panNo)) {
      res.status(400).json({ error: "PAN must be in the format ABCDE1234F." });
      return;
    }

    // --- reject duplicate email early, with a clear message ---
    const existing = await employeeModel.findByEmail(email);
    if (existing) {
      res
        .status(409)
        .json({ error: "An employee with this email already exists." });
      return;
    }

    // --- resolve role name -> role_id ---
    const role = await roleModel.findByName(roleName);
    if (!role) {
      res.status(400).json({
        error: `Unknown role '${roleName}'. Create it first via /api roles, or check spelling.`,
      });
      return;
    }

    // --- resolve department name -> Dept_id (optional) ---
    let deptId: number | null = null;
    if (departmentName) {
      const department = await departmentModel.findByName(departmentName);
      if (!department) {
        res
          .status(400)
          .json({ error: `Unknown department '${departmentName}'.` });
        return;
      }
      deptId = department.id;
    }

    // --- validate reportingTo actually exists, if provided ---
    if (reportingTo != null) {
      const manager = await employeeModel.findById(reportingTo);
      if (!manager) {
        res.status(400).json({
          error: `No employee found with Emp_id = ${reportingTo} to report to.`,
        });
        return;
      }
    }

    // --- hash the password, never store plain text ---
    const passwordHash = await bcrypt.hash(password, 10);

    const employee = await employeeModel.create({
      name,
      company,
      employeeCode,
      aadharNo,
      panNo,
      email,
      passwordHash,
      roleId: role.id,
      deptId,
      reportingTo: reportingTo ?? null,
    });

    if (!employee) {
      res.status(500).json({ error: "Failed to create employee." });
      return;
    }

    // --- give them a starting balance for every leave type this year,
    //     using each type's real max_days_per_year (not a flat guess) ---
    const leaveTypes = await leaveTypeModel.findAll();
    const year = currentYear();
    for (const lt of leaveTypes) {
      await leaveBalanceModel.create({
        employeeId: employee.Emp_id,
        leaveTypeId: lt.id,
        year,
        allocatedDays: lt.max_days_per_year,
      });
    }

    res.status(201).json({
      id: employee.Emp_id,
      name: employee.name,
      email: employee.email,
      role: role.name,
      department: departmentName ?? null,
      reportingTo: employee.reporting_to,
      leaveBalancesCreated: leaveTypes.length,
    });
  } catch (err) {
    next(err);
  }
}
