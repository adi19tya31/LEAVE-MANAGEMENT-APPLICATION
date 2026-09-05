import { apiFetch } from "./client";
export const getDepartments = (token) =>
  apiFetch("/api/departments", { token });
export const createDepartment = (token, name) =>
  apiFetch("/api/departments", { method: "POST", token, body: { name } });
export const renameDepartment = (token, id, name) =>
  apiFetch(`/api/departments/${id}`, {
    method: "PATCH",
    token,
    body: { name },
  });
export const setDepartmentManager = (token, id, managerId) =>
  apiFetch(`/api/departments/${id}/manager`, {
    method: "PATCH",
    token,
    body: { managerId },
  });
export const deactivateDepartment = (token, id) =>
  apiFetch(`/api/departments/${id}/deactivate`, { method: "PATCH", token });
export const reactivateDepartment = (token, id) =>
  apiFetch(`/api/departments/${id}/reactivate`, { method: "PATCH", token });
export const deleteDepartment = (token, id) =>
  apiFetch(`/api/departments/${id}`, { method: "DELETE", token });
