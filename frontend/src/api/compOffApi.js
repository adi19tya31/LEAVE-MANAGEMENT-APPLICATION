import { apiFetch } from "./client";

export const applyCompOff = (token, body) =>
  apiFetch("/api/comp-offs", {
    method: "POST",
    token,
    body,
  });

export const getMyCompOffHistory = (token) =>
  apiFetch("/api/comp-offs/me", {
    method: "GET",
    token,
  });

export const cancelCompOffRequest = (token, id) =>
  apiFetch(`/api/comp-offs/${id}/cancel`, {
    method: "PATCH",
    token,
  });

export const getPendingCompOffs = (token) =>
  apiFetch("/api/comp-offs/pending", {
    method: "GET",
    token,
  });

export const getCompOffTeamHistory = (token) =>
  apiFetch("/api/comp-offs/team-history", {
    method: "GET",
    token,
  });

export const decideCompOff = (
  token,
  id,
  body
) =>
  apiFetch(`/api/comp-offs/${id}/decision`, {
    method: "PATCH",
    token,
    body,
  });

export const markCompOffAsWorked = (
  token,
  id
) =>
  apiFetch(`/api/comp-offs/${id}/worked`, {
    method: "PATCH",
    token,
  });

export const getMyCompOffBalance = (token) =>
  apiFetch("/api/compoff-balances/me", {
    method: "GET",
    token,
  });