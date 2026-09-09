import { apiFetch } from "./client";

export const registerEmployee = (token, body) =>
  apiFetch("/api/employees", {
    method: "POST",
    token,
    body,
  });

export const getAllEmployees = (token) =>
  apiFetch("/api/employees", {
    method: "GET",
    token,
  });

export const changePassword = (token, body) =>
  apiFetch("/api/employees/change-password", {
    method: "PATCH",
    token,
    body,
  });
