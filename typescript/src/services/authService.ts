import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";

import employeeModel from "../models/employeeModel";
import roleModel from "../models/roleModel";

interface ServiceError extends Error {
  statusCode: number;
}

function serviceError(statusCode: number, message: string): ServiceError {
  const err = new Error(message) as ServiceError;
  err.statusCode = statusCode;
  return err;
}

interface LoginResult {
  token: string;

  employee: {
    id: number;
    name: string;
    role: string | null;
    email: string;
  };
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  const employee = await employeeModel.findByEmail(email);

  if (!employee) {
    throw serviceError(401, "Invalid email or password.");
  }

  const isMatch = await bcrypt.compare(password, employee.password_hash);
  if (!isMatch) throw serviceError(401, "Invalid email or password.");

  if (!isMatch) {
    throw serviceError(401, "Invalid email or password.");
  }

  const role = await roleModel.findById(employee.role_id);

  const roleName = role ? role.name : null;

  const token = jwt.sign(
    {
      id: employee.Emp_id,
      roleId: employee.role_id,
      role: roleName,
      name: employee.name,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: (process.env.JWT_EXPIRES_IN ||
        "8h") as SignOptions["expiresIn"],
    },
  );

  return {
    token,

    employee: {
      id: employee.Emp_id,
      name: employee.name,
      role: roleName,
      email: employee.email,
    },
  };
}

// ======================================
// FORGOT PASSWORD
// ======================================

export async function forgotPassword(email: string) {
  const employee = await employeeModel.findByEmail(email);

  if (!employee) {
    throw serviceError(404, "No employee found with this email.");
  }

  return {
    message: "Email verified successfully.",
    email: employee.email,
  };
}

// ======================================
// RESET PASSWORD
// ======================================

export async function resetPassword(
  email: string,
  newPassword: string,
): Promise<void> {
  const employee = await employeeModel.findByEmail(email);

  if (!employee) {
    throw serviceError(404, "No employee found with this email.");
  }

  if (newPassword.length < 6) {
    throw serviceError(
      400,
      "Password must be at least 6 characters long.",
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await employeeModel.updatePassword(
    employee.Emp_id,
    passwordHash,
  );
}

export default {
  login,
  forgotPassword,
  resetPassword,
};
