import { apiFetch } from "./client";

// LOGIN
export const login = (email, password) =>
  apiFetch("/api/auth/login", {
    method: "POST",
    body: {
      email,
      password,
    },
  });

// FORGOT PASSWORD
export const forgotPassword = (email) =>
  apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: {
      email,
    },
  });

// VERIFY OTP
export const verifyResetOtp = (email, otp) =>
  apiFetch("/api/auth/verify-reset-otp", {
    method: "POST",
    body: {
      email,
      otp,
    },
  });

// RESET PASSWORD
export const resetPassword = (resetToken, newPassword) =>
  apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: {
      resetToken,
      newPassword,
    },
  });