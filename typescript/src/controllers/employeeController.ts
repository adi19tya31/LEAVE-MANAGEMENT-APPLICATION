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

import {
  createKeycloakUser,
} from "../services/keycloakService";


interface RegisterEmployeeBody {
  name: string;
  company?: string;
  employeeCode?: string;
  aadharNo?: string;
  panNo?: string;
  email: string;
  password: string;
  roleName: string;
  departmentName?: string;
  reportingTo?: number;
}



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


    // -----------------------------------------
    // Required fields
    // -----------------------------------------

    if (!name || !email || !password || !roleName) {

      res.status(400).json({
        error:
          "name, email, password and roleName are required.",
      });

      return;
    }


    // -----------------------------------------
    // Aadhaar validation
    // -----------------------------------------

    if (
      aadharNo &&
      !isValidAadhar(aadharNo)
    ) {

      res.status(400).json({
        error:
          "Aadhaar number must be exactly 12 digits.",
      });

      return;
    }


    // -----------------------------------------
    // PAN validation
    // -----------------------------------------

    if (
      panNo &&
      !isValidPan(panNo)
    ) {

      res.status(400).json({
        error:
          "PAN must be in the format ABCDE1234F.",
      });

      return;
    }


    // -----------------------------------------
    // Check duplicate MySQL email
    // -----------------------------------------

    const existing =
      await employeeModel.findByEmail(email);

    if (existing) {

      res.status(409).json({
        error:
          "An employee with this email already exists.",
      });

      return;
    }


    // -----------------------------------------
    // Resolve application role
    // -----------------------------------------

    const role =
      await roleModel.findByName(roleName);

    if (!role) {

      res.status(400).json({
        error:
          `Unknown role '${roleName}'.`,
      });

      return;
    }


    // -----------------------------------------
    // Resolve department
    // -----------------------------------------

    let deptId: number | null = null;

    if (departmentName) {

      const department =
        await departmentModel.findByName(
          departmentName,
        );

      if (!department) {

        res.status(400).json({
          error:
            `Unknown department '${departmentName}'.`,
        });

        return;
      }

      deptId = department.id;
    }


    // -----------------------------------------
    // Validate reporting manager
    // -----------------------------------------

    if (reportingTo != null) {

      const manager =
        await employeeModel.findById(
          reportingTo,
        );

      if (!manager) {

        res.status(400).json({
          error:
            `No employee found with Emp_id = ${reportingTo} to report to.`,
        });

        return;
      }
    }


    // -----------------------------------------
    // Get current manager/owner token
    // -----------------------------------------

    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {

      res.status(401).json({
        error:
          "Missing authorization token.",
      });

      return;
    }

    const accessToken =
      authHeader.substring(7);


    // -----------------------------------------
    // CREATE USER IN KEYCLOAK
    // -----------------------------------------

    console.log(
      "Creating user in Keycloak:",
      email,
    );

    const keycloakUser =
      await createKeycloakUser(
        accessToken,
        {
          name,
          email,
          password,
        },
      );

    const keycloakId =
      keycloakUser.id;


    console.log(
      "Keycloak user created:",
      keycloakId,
    );


    // -----------------------------------------
    // Hash password
    // -----------------------------------------

    const passwordHash =
      await bcrypt.hash(
        password,
        10,
      );


    // -----------------------------------------
    // CREATE EMPLOYEE IN MYSQL
    // -----------------------------------------

    const employee =
      await employeeModel.create({

        keycloakId,

        name,
        company,
        employeeCode,
        aadharNo,
        panNo,
        email,

        passwordHash,

        roleId: role.id,

        deptId,

        reportingTo:
          reportingTo ?? null,
      });


    if (!employee) {

      res.status(500).json({
        error:
          "Failed to create employee.",
      });

      return;
    }


    // -----------------------------------------
    // Create leave balances
    // -----------------------------------------

    const leaveTypes =
      await leaveTypeModel.findAll();

    const year =
      currentYear();

    for (const lt of leaveTypes) {

      await leaveBalanceModel.create({

        employeeId:
          employee.Emp_id,

        leaveTypeId:
          lt.id,

        year,

        allocatedDays:
          lt.max_days_per_year,

      });
    }


    // -----------------------------------------
    // SUCCESS
    // -----------------------------------------

    res.status(201).json({

      id:
        employee.Emp_id,

      keycloakId,

      name:
        employee.name,

      email:
        employee.email,

      role:
        role.name,

      department:
        departmentName ?? null,

      reportingTo:
        employee.reporting_to,

      leaveBalancesCreated:
        leaveTypes.length,

    });

  } catch (err) {

    console.error(
      "Employee registration failed:",
      err,
    );

    next(err);
  }
}


// -----------------------------------------
// GET ALL EMPLOYEES
// -----------------------------------------

export async function getAllEmployees(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {

  try {

    const employees =
      await employeeModel.findAll();

    res.status(200).json(
      employees,
    );

  } catch (err) {

    next(err);
  }
}