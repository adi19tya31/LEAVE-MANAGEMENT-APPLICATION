import {
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
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppShell() {
  const { user, logout } = useAuth();
  const managerOrOwner = user.role === "manager" || user.role === "owner";
  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/apply", label: "Apply for Leave", icon: Send },
    { to: "/my-applications", label: "My Leave History", icon: ClipboardList },
    { to: "/comp-off", label: "Comp-Off", icon: BadgeCheck },

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
                `w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] transition-colors ${isActive ? "bg-white/10 text-white font-medium" : "text-[#B7C0EA] hover:bg-white/5"}`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
              <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-0 group-[.active]:opacity-100" />
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
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
