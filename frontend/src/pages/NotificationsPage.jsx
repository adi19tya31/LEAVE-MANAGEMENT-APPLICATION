import { useEffect, useState } from "react";

import {
  Bell,
  CheckCheck,
  Clock,
  FileText,
  Calendar,
  Info,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import * as notificationApi from "../api/notificationApi";

import { Banner, PrimaryButton } from "../components/ui";

export default function NotificationsPage() {
  const { token, user } = useAuth();

  const navigate = useNavigate();

  const managerOrOwner =
    user?.role === "manager" || user?.role === "owner";

  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [markingAll, setMarkingAll] = useState(false);

  async function loadNotifications() {
    try {
      setLoading(true);

      setError("");

      const result = await notificationApi.getNotifications(token);

      setNotifications(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadNotifications();
    }
  }, [token]);

  async function handleMarkAsRead(notification) {
    try {
      if (managerOrOwner) {
        await notificationApi.deleteNotification(
          notification.notification_id,
          token,
        );

        setNotifications((previous) =>
          previous.filter(
            (item) => item.notification_id !== notification.notification_id,
          ),
        );
      } else if (!notification.is_read) {
        await notificationApi.markAsRead(notification.notification_id, token);

        setNotifications((previous) =>
          previous.map((item) =>
            item.notification_id === notification.notification_id
              ? { ...item, is_read: true }
              : item,
          ),
        );
      }

      const isCompOffNotification = notification.type.startsWith("COMPOFF_");
      navigate(
        managerOrOwner
          ? isCompOffNotification
            ? "/comp-off-approvals"
            : "/approvals"
          : isCompOffNotification
            ? "/comp-off"
            : "/my-applications",
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleMarkAllAsRead() {
    try {
      setMarkingAll(true);

      if (managerOrOwner) {
        await notificationApi.deleteAllNotifications(token);
        setNotifications([]);
      } else {
        await notificationApi.markAllAsRead(token);

        setNotifications((previous) =>
          previous.map((item) => ({
            ...item,
            is_read: true,
          })),
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setMarkingAll(false);
    }
  }

  function getNotificationIcon(type) {
    switch (type) {
      case "LEAVE_APPLIED":
      case "LEAVE_APPROVED":
      case "LEAVE_REJECTED":
        return <Calendar className="h-5 w-5" />;

      case "comp_off":
      case "COMPOFF_APPLIED":
      case "COMPOFF_APPROVED":
      case "COMPOFF_REJECTED":
        return <Clock className="h-5 w-5" />;

      case "employee":
        return <FileText className="h-5 w-5" />;

      default:
        return <Info className="h-5 w-5" />;
    }
  }

  function formatDate(date) {
    return new Date(date).toLocaleString();
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="h-7 w-7 text-[#1E2761]" />

              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-3 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl text-[#1E2761]">
              Notifications
            </h1>
          </div>

          <p className="mt-2 text-sm text-[#6D7597]">
            Stay updated with your leave requests and account activity.
          </p>
        </div>

        {unreadCount > 0 && (
          <PrimaryButton
            type="button"
            loading={markingAll}
            onClick={handleMarkAllAsRead}
          >
            <CheckCheck className="h-4 w-4" />
            {managerOrOwner ? "Clear Notifications" : "Mark All Read"}
          </PrimaryButton>
        )}
      </div>

      {/* ERROR */}

      {error && <Banner tone="error">{error}</Banner>}

      {/* LOADING */}

      {loading && (
        <div className="rounded-2xl border border-[#E3E7F5] bg-white p-8 text-center text-sm text-[#6D7597]">
          Loading notifications...
        </div>
      )}

      {/* EMPTY */}

      {!loading && notifications.length === 0 && (
        <div className="rounded-2xl border border-[#E3E7F5] bg-white p-10 text-center">
          <Bell className="mx-auto h-10 w-10 text-[#AAB2D5]" />

          <h2 className="mt-4 text-lg font-semibold text-[#1E2761]">
            No notifications
          </h2>

          <p className="mt-2 text-sm text-[#6D7597]">
            You don't have any notifications yet.
          </p>
        </div>
      )}

      {/* NOTIFICATIONS */}

      {!loading && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <button
              key={notification.notification_id}
              type="button"
              onClick={() => handleMarkAsRead(notification)}
              className={`w-full text-left rounded-2xl border p-5 transition-all hover:shadow-md
                  
                  ${
                    notification.is_read
                      ? "bg-white border-[#E3E7F5]"
                      : "bg-[#F3F5FF] border-[#C9D2FF]"
                  }
                  
                  `}
            >
              <div className="flex gap-4">
                {/* ICON */}

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl
                      
                      ${
                        notification.is_read
                          ? "bg-[#F4F6FC] text-[#6D7597]"
                          : "bg-[#E1E6FF] text-[#526FE8]"
                      }
                      
                      `}
                >
                  {getNotificationIcon(notification.type)}
                </div>

                {/* CONTENT */}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3
                        className={`text-sm
                            
                            ${
                              notification.is_read
                                ? "font-medium text-[#4A5278]"
                                : "font-bold text-[#1E2761]"
                            }
                            
                            `}
                      >
                        {notification.title}
                      </h3>

                      <p className="mt-1 text-sm text-[#6D7597]">
                        {notification.message}
                      </p>
                    </div>

                    {/* UNREAD DOT */}

                    {!notification.is_read && (
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#526FE8]" />
                    )}
                  </div>

                  {/* DATE */}

                  <div className="mt-3 flex items-center gap-2 text-xs text-[#8A92B5]">
                    <Clock className="h-3.5 w-3.5" />

                    {formatDate(notification.created_at)}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
