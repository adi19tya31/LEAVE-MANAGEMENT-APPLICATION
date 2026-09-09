import { apiFetch } from "./client";

export const applyCompOff = (token, body) =>
  apiFetch("/api/comp-offs", { method: "POST", token, body });
export const getMyCompOffHistory = (token) =>
  apiFetch("/api/comp-offs/me", { token });
export const getPendingCompOffs = (token) =>
  apiFetch("/api/comp-offs/pending", { token });
export const getTeamCompOffHistory = (token) =>
  apiFetch("/api/comp-offs/team-history", { token });
export const decideCompOff = (token, id, body) =>
  apiFetch(`/api/comp-offs/${id}/decision`, { method: "PATCH", token, body });
