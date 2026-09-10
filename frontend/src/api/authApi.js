import { apiFetch } from "./client";

export const login = (email, password) =>
  apiFetch("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });

export const forgotPassword = (email) =>
  apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: { email },
  });

export const resetPassword = (email, newPassword) =>
  apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: {
      email,
      newPassword,
    },
  });