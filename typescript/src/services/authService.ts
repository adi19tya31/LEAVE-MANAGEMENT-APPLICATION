import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";

import employeeModel from "../models/employeeModel";
import roleModel from "../models/roleModel";
import passwordResetOtpModel from "../models/passwordResetOtpModel";
import { sendPasswordResetOtp } from "./emailService";

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

  // Generate secure 6-digit OTP
  const otp = crypto.randomInt(100000, 1000000).toString();

  // Hash OTP before storing in database
  const otpHash = await bcrypt.hash(otp, 10);

  // OTP expires after 5 minutes
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Delete previous OTPs for this employee
  await passwordResetOtpModel.deleteByEmployeeId(employee.Emp_id);

  // Save new hashed OTP
  await passwordResetOtpModel.create(employee.Emp_id, otpHash, expiresAt);

  // Send OTP to employee's registered email
  await sendPasswordResetOtp(employee.email, otp);

  return {
    message: "OTP sent successfully to your registered email.",
    email: employee.email,
  };
}

// ======================================
// VERIFY PASSWORD RESET OTP
// ======================================

export async function verifyResetOtp(email: string, otp: string) {
  // Verify employee
  const employee = await employeeModel.findByEmail(email);

  if (!employee) {
    throw serviceError(404, "Employee not found.");
  }

  const storedOtp = await passwordResetOtpModel.findLatestByEmployeeId(
    employee.Emp_id,
  );

  if (!storedOtp) {
    throw serviceError(401, "Invalid or expired OTP.");
  }

  if (new Date(storedOtp.expires_at).getTime() <= Date.now()) {
    throw serviceError(401, "Invalid or expired OTP.");
  }

  const isOtpValid = await bcrypt.compare(otp, storedOtp.otp_hash);

  if (!isOtpValid) {
    throw serviceError(401, "Invalid or expired OTP.");
  }

  // Generate reset token
  const resetToken = jwt.sign(
    {
      id: employee.Emp_id,
      purpose: "password-reset",
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "10m",
    },
  );

  return {
    message: "OTP verified successfully.",
    resetToken,
  };
}

// ======================================
// RESET PASSWORD
// ======================================

export async function resetPassword(
  resetToken: string,
  newPassword: string,
): Promise<void> {
  if (newPassword.length < 6) {
    throw serviceError(400, "Password must be at least 6 characters long.");
  }

  let payload: any;

  try {
    payload = jwt.verify(resetToken, process.env.JWT_SECRET as string);
  } catch {
    throw serviceError(401, "Invalid or expired password reset token.");
  }

  // Ensure this token is only for password reset
  if (payload.purpose !== "password-reset") {
    throw serviceError(401, "Invalid password reset token.");
  }

  const employee = await employeeModel.findById(payload.id);

  if (!employee) {
    throw serviceError(404, "Employee not found.");
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 10);

  // Update password
  await employeeModel.updatePassword(employee.Emp_id, passwordHash);

  // Delete OTP after successful password reset
  await passwordResetOtpModel.deleteAfterUse(employee.Emp_id);
}

export default {
  login,
  forgotPassword,
  resetPassword,
};
