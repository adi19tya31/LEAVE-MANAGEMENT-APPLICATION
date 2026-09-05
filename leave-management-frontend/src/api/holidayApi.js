import { apiFetch } from "./client";

export const getPublicHolidays = (token) =>
  apiFetch("/api/public-holidays", { token });
export const createPublicHoliday = (token, body) =>
  apiFetch("/api/public-holidays", { method: "POST", token, body });
export const deletePublicHoliday = (token, id) =>
  apiFetch(`/api/public-holidays/${id}`, { method: "DELETE", token });