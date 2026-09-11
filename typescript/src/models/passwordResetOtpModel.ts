import pool from "../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface PasswordResetOtp {
  id: number;
  employee_id: number;
  otp_hash: string;
  expires_at: string;
  created_at: string;
}

// Delete all previous OTPs for an employee
async function deleteByEmployeeId(employeeId: number): Promise<void> {
  await pool.query("DELETE FROM password_reset_otps WHERE employee_id = ?", [
    employeeId,
  ]);
}

// Create a new OTP
async function create(
  employeeId: number,
  otpHash: string,
  expiresAt: Date,
): Promise<void> {
  await pool.query<ResultSetHeader>(
    `
      INSERT INTO password_reset_otps
      (employee_id, otp_hash, expires_at)
      VALUES (?, ?, ?)
    `,
    [employeeId, otpHash, expiresAt],
  );
}

// Get the latest OTP for an employee
async function findLatestByEmployeeId(
  employeeId: number,
): Promise<PasswordResetOtp | null> {
  const [rows] = await pool.query<(PasswordResetOtp & RowDataPacket)[]>(
    `
      SELECT *
      FROM password_reset_otps
      WHERE employee_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [employeeId],
  );

  return rows[0] ?? null;
}

// Delete a specific employee's OTP after successful reset
async function deleteAfterUse(employeeId: number): Promise<void> {
  await pool.query("DELETE FROM password_reset_otps WHERE employee_id = ?", [
    employeeId,
  ]);
}

export default {
  deleteByEmployeeId,
  create,
  findLatestByEmployeeId,
  deleteAfterUse,
};
