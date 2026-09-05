import { apiFetch } from "./client";

export const getLeaveTypes = (token) => apiFetch("/api/leave-types", { token });
export const getMyBalances = (token) =>
  apiFetch("/api/leave-balances/me", { token });
export const submitLeaveApplication = (token, body) =>
  apiFetch("/api/leave-applications", { method: "POST", token, body });
export const getMyApplications = (token) =>
  apiFetch("/api/leave-applications/me", { token });
export const getPendingApplications = (token) =>
  apiFetch("/api/leave-applications/pending", { token });
export const decideLeaveApplication = (token, id, body) =>
  apiFetch(`/api/leave-applications/${id}/decision`, {
    method: "PATCH",
    token,
    body,
  });
export const getApplicationStatus = (token, id) =>
  apiFetch(`/api/leave-applications/${id}/status`, { token });
