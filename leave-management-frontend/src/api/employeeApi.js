import { apiFetch } from "./client";
export const registerEmployee = (token, body) =>
  apiFetch("/api/employees", { method: "POST", token, body });
