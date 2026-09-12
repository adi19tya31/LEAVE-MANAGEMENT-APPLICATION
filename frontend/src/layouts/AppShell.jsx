import {
  Bell,
  Building2,
  LayoutDashboard,
  BadgeCheck,
  CalendarDays,
  ClipboardList,
  ChevronRight,
  LogOut,
  Send,
  UserPlus,
  Users,
  LockKeyhole,
} from "lucide-react";

import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { useEffect, useState, useRef } from "react";

import * as notificationApi from "../api/notificationApi";

export default function AppShell() {
  const { user, logout, token } = useAuth();

  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);

  const [notifications, setNotifications] = useState([]);

  const [showNotifications, setShowNotifications] = useState(false);

  const notificationRef = useRef(null);

  const managerOrOwner = user.role === "manager" || user.role === "owner";

  // ================================
  // LOAD UNREAD COUNT
  // ================================

  async function loadUnreadCount() {
    try {
      const result = await notificationApi.getUnreadCount(token);

      setUnreadCount(result.data?.count || 0);
    } catch (err) {
      console.error("Failed to load unread notifications:", err);
    }
  }

  // ================================
  // LOAD NOTIFICATIONS
  // ================================

  async function loadNotifications() {
    try {
      const result = await notificationApi.getNotifications(token);

      setNotifications(result.data || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }

  // ================================
  // INITIAL LOAD
  // ================================

  useEffect(() => {
    if (!token) return;

    loadUnreadCount();
  }, [token]);

  // ================================
  // AUTO REFRESH
  // ================================

  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      loadUnreadCount();

      if (showNotifications) {
        loadNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [token, showNotifications]);

  // ================================
  // CLOSE DROPDOWN OUTSIDE CLICK
  // ================================

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ================================
  // TOGGLE NOTIFICATIONS
  // ================================

  async function handleNotificationClick() {
    const newState = !showNotifications;

    setShowNotifications(newState);

    if (newState) {
      await loadNotifications();
    }
  }

  // ================================
  // MARK ONE AS READ
  // ================================

  async function handleMarkAsRead(notification) {
    try {
      if (managerOrOwner) {
        await notificationApi.deleteNotification(
          notification.notification_id,
          token,
        );

        setNotifications((prev) =>
          prev.filter(
            (item) => item.notification_id !== notification.notification_id,
          ),
        );

        if (!notification.is_read) {
          setUnreadCount((prev) => Math.max(prev - 1, 0));
        }
      } else if (!notification.is_read) {
        await notificationApi.markAsRead(notification.notification_id, token);

        setNotifications((prev) =>
          prev.map((item) =>
            item.notification_id === notification.notification_id
              ? {
                  ...item,
                  is_read: true,
                }
              : item,
          ),
        );

        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }

      navigate(managerOrOwner ? "/approvals" : "/my-applications");

      setShowNotifications(false);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }

  // ================================
  // MARK ALL AS READ
  // ================================

  async function handleMarkAllAsRead() {
    try {
      if (managerOrOwner) {
        await notificationApi.deleteAllNotifications(token);
        setNotifications([]);
      } else {
        await notificationApi.markAllAsRead(token);

        setNotifications((prev) =>
          prev.map((item) => ({
            ...item,
            is_read: true,
          })),
        );
      }

      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }

  const navItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },

    {
      to: "/apply",
      label: "Apply for Leave",
      icon: Send,
    },

    {
      to: "/my-applications",
      label: "My Leave History",
      icon: ClipboardList,
    },

    {
      to: "/comp-off",
      label: "Comp-Off",
      icon: BadgeCheck,
    },

    {
      to: "/change-password",
      label: "Change Password",
      icon: LockKeyhole,
    },

    ...(managerOrOwner
      ? [
          {
            to: "/employees",
            label: "Employees",
            icon: Users,
          },

          {
            to: "/leave-calendar",
            label: "Leave Calendar",
            icon: CalendarDays,
          },

          {
            to: "/approvals",
            label: "Leave Approvals",
            icon: ClipboardList,
          },

          {
            to: "/comp-off-approvals",
            label: "Comp-Off Approvals",
            icon: BadgeCheck,
          },

          {
            to: "/register",
            label: "Register Employee",
            icon: UserPlus,
          },

          {
            to: "/departments",
            label: "Departments",
            icon: Building2,
          },

          {
            to: "/public-holidays",
            label: "Public Holidays",
            icon: CalendarDays,
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#F4F6FC] flex">
      {/* ================= SIDEBAR ================= */}

      <aside className="w-64 shrink-0 bg-[#1E2761] text-white flex flex-col">
        <div className="px-5 py-6">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#8CA0EE] uppercase">
            Leave Management
          </p>

          <p className="mt-2 text-sm font-medium">{user.name}</p>

          <p className="text-[12px] text-[#9AA6D9] capitalize">{user.role}</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] transition-colors
                  
                  ${
                    isActive
                      ? "bg-white/10 text-white font-medium"
                      : "text-[#B7C0EA] hover:bg-white/5"
                  }`
              }
            >
              <Icon className="h-4 w-4" />

              {label}

              <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-50" />
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-4">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] text-[#B7C0EA] hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}

      <main className="flex-1 p-8 overflow-y-auto relative">
        {/* ================= TOP BAR ================= */}

        <div className="flex justify-end mb-6">
          {/* NOTIFICATION */}

          <div className="relative" ref={notificationRef}>
            <button
              onClick={handleNotificationClick}
              className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-[#E3E7F5] shadow-sm hover:bg-[#F7F8FC]"
            >
              <Bell className="h-5 w-5 text-[#1E2761]" />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* NOTIFICATION DROPDOWN */}

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-[380px] max-h-[500px] overflow-y-auto bg-white border border-[#E3E7F5] rounded-xl shadow-xl z-50">
                {/* HEADER */}

                <div className="flex items-center justify-between px-4 py-3 border-b border-[#E3E7F5]">
                  <div>
                    <h3 className="font-semibold text-[#1E2761]">
                      Notifications
                    </h3>

                    <p className="text-xs text-[#6D7597]">
                      {unreadCount} unread
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs font-medium text-[#526FE8] hover:underline"
                    >
                      {managerOrOwner
                        ? "Clear notifications"
                        : "Mark all as read"}
                    </button>
                  )}
                </div>

                {/* NOTIFICATION LIST */}

                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-[#6D7597]">
                    No notifications yet
                  </div>
                ) : (
                  <div>
                    {notifications.map((notification) => (
                      <button
                        key={notification.notification_id}
                        onClick={() => handleMarkAsRead(notification)}
                        className={`w-full text-left px-4 py-4 border-b border-[#F0F2F8] hover:bg-[#F7F8FC] transition
                          
                          ${
                            !notification.is_read ? "bg-[#F4F6FF]" : "bg-white"
                          }`}
                      >
                        <div className="flex gap-3">
                          {/* UNREAD DOT */}

                          {!notification.is_read && (
                            <span className="mt-2 w-2 h-2 rounded-full bg-[#526FE8] shrink-0" />
                          )}

                          <div className="flex-1">
                            <p className="text-sm font-semibold text-[#1E2761]">
                              {notification.title}
                            </p>

                            <p className="mt-1 text-xs leading-relaxed text-[#6D7597]">
                              {notification.message}
                            </p>

                            <p className="mt-2 text-[10px] text-[#9AA1B8]">
                              {new Date(
                                notification.created_at,
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* PAGE CONTENT */}

        <Outlet />
      </main>
    </div>
  );
}
