import { apiFetch } from "./client";

export const getNotifications = (token) =>
  apiFetch("/api/notification", {
    method: "GET",
    token,
  });

export const getUnreadCount = (token) =>
  apiFetch("/api/notification/unread-count", {
    method: "GET",
    token,
  });

export const markAsRead = (notificationId, token) =>
  apiFetch(`/api/notification/${notificationId}/read`, {
    method: "PATCH",
    token,
  });

export const deleteNotification = (notificationId, token) =>
  apiFetch(`/api/notification/${notificationId}`, {
    method: "DELETE",
    token,
  });

export const markAllAsRead = (token) =>
  apiFetch("/api/notification/read-all", {
    method: "PATCH",
    token,
  });

export const deleteAllNotifications = (token) =>
  apiFetch("/api/notification/read-all", {
    method: "DELETE",
    token,
  });