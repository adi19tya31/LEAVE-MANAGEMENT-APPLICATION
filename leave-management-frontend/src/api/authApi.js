import { apiFetch } from "./client";
export const login = (email, password) =>
  apiFetch("/api/auth/login", { method: "POST", body: { email, password } });
