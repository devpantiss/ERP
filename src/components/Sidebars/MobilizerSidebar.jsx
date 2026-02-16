import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  CalendarCheck2,
  LayoutDashboard,
  Users,
  UserRoundPen,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from "lucide-react";

const MENU = [
  { label: "Dashboard", path: "/mobilizer/dashboard", icon: LayoutDashboard },
  { label: "Candidate Enrollment", path: "/mobilizer/student-enrollment", icon: Users },
  { label: "Community Engagement", path: "/mobilizer/community-engagement", icon: CalendarCheck2 },
  { label: "My Attendance", path: "/mobilizer/attendance", icon: UserCheck },
  { label: "Profile", path: "/mobilizer/profile", icon: UserRoundPen },
];

const MobilizerSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col
      bg-[#020617] text-slate-200
      border-r border-yellow-400/30
      transition-all duration-300
      ${collapsed ? "w-17" : "w-64"}`}
    >
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between px-4 h-16
        border-b border-yellow-400/20">

        {!collapsed && (
          <span className="text-lg font-semibold tracking-wide text-yellow-400">
            Mobilize Hub
          </span>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg
          text-slate-300 hover:text-yellow-400
          hover:bg-white/5 transition"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* ================= MENU ================= */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {MENU.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-sm font-medium transition-all
              ${
                isActive
                  ? "bg-yellow-400/15 text-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.15)]"
                  : "text-slate-300 hover:bg-white/5 hover:text-yellow-300"
              }`
            }
          >
            <Icon size={18} />

            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* ================= FOOTER ================= */}
      <div
        className="px-4 py-3 border-t border-yellow-400/20
        text-xs text-slate-400"
      >
        {!collapsed && "© Kovon Platform"}
      </div>
    </aside>
  );
};

export default MobilizerSidebar;