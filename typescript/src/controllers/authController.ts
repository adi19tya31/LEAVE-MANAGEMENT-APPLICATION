import { Request, Response, NextFunction } from "express";
import * as authService from "../services/authService";

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      res.status(400).json({
        error: "email and password are required.",
      });
      return;
    }

    const result = await authService.login(email, password);

    res.json(result);
  } catch (err) {
    next(err);
  }
}

// FORGOT PASSWORD

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    //   console.log("FORGOT PASSWORD ROUTE REACHED");
    // console.log("Request body:", req.body);

    const { email } = req.body as {
      email?: string;
    };

    if (!email) {
      res.status(400).json({
        error: "Email is required.",
      });
      return;
    }

    const result = await authService.forgotPassword(email);

    res.json(result);
  } catch (err) {
    next(err);
  }
}

// VERIFY RESET OTP

export async function verifyResetOtp(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, otp } = req.body as {
      email?: string;
      otp?: string;
    };

    if (!email || !otp) {
      res.status(400).json({
        error: "Email and OTP are required.",
      });

      return;
    }

    const result = await authService.verifyResetOtp(email, otp);

    res.json(result);
  } catch (err) {
    next(err);
  }
}

// RESET PASSWORD

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { resetToken, newPassword } = req.body as {
      resetToken?: string;
      newPassword?: string;
    };

    if (!resetToken || !newPassword) {
      res.status(400).json({
        error: "Reset token and new password are required.",
      });

      return;
    }

    await authService.resetPassword(
      resetToken,
      newPassword,
    );

    res.json({
      message: "Password reset successfully.",
    });
  } catch (err) {
    next(err);
  }
}