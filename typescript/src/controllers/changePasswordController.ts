import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import employeeModel from "../models/employeeModel";

interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { currentPassword, newPassword } =
      req.body as ChangePasswordBody;

    const employeeId = req.user!.id;

    // Validation
    if (!currentPassword || !newPassword) {
      res.status(400).json({
        error: "Current password and new password are required.",
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        error: "New password must be at least 6 characters.",
      });
      return;
    }

    // Get employee
    const employee = await employeeModel.findById(employeeId);

    if (!employee) {
      res.status(404).json({
        error: "Employee not found.",
      });
      return;
    }

    // Check current password
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      employee.password_hash,
    );

    if (!isPasswordCorrect) {
      res.status(400).json({
        error: "Current password is incorrect.",
      });
      return;
    }

    // Prevent same password
    const isSamePassword = await bcrypt.compare(
      newPassword,
      employee.password_hash,
    );

    if (isSamePassword) {
      res.status(400).json({
        error: "New password cannot be the same as current password.",
      });
      return;
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await employeeModel.updatePassword(
      employeeId,
      passwordHash,
    );

    res.json({
      message: "Password changed successfully.",
    });
  } catch (err) {
    next(err);
  }
}