import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UserCheck,
  MapPin,
  ClipboardCheck,
  FlaskConical,
  BookOpen,
  FileText,
  BarChart3,
  UserRoundPen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ================= MENU CONFIG ================= */

const MENU = [
  { label: "Dashboard", path: "/trainer/dashboard", icon: LayoutDashboard },
  { label: "Exposure Visits", path: "/trainer/exposure-visits", icon: MapPin },
  { label: "Internal Assessment", path: "/trainer/internal-assessment", icon: ClipboardCheck },
  // { label: "Labs", path: "/trainer/labs", icon: FlaskConical },
  // { label: "Study Modules", path: "/trainer/study-modules", icon: BookOpen },
  // { label: "Daily Updates", path: "/trainer/daily-updates", icon: FileText },
  { label: "Module Progress", path: "/trainer/module-progress", icon: BarChart3 },
  { label: "Profile", path: "/trainer/profile", icon: UserRoundPen },
  { label: "Attendance", path: "/trainer/attendance", icon: UserCheck },
];

/* ================= COMPONENT ================= */

const TrainerSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col
      bg-[#111827] text-slate-300
      border-r border-slate-700
      transition-all duration-300
      ${collapsed ? "w-20" : "w-64"}`}
    >
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-700">

        {!collapsed && (
          <span className="text-lg font-semibold tracking-tight text-emerald-400">
            TeachHub
          </span>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* ================= MENU ================= */}
      <nav className="flex-1 px-3 py-6 space-y-1">

        {MENU.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
              text-sm font-medium transition-all duration-200
              ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active Indicator */}
                {isActive && (
                  <span className="absolute left-0 top-0 h-full w-1 bg-emerald-400 rounded-r-md" />
                )}

                <Icon size={18} className="shrink-0" />

                {!collapsed && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}

      </nav>

      {/* ================= FOOTER ================= */}
      <div className="px-4 py-4 border-t border-slate-700 text-xs text-slate-500">

        {!collapsed && (
          <div className="space-y-1">
            <p className="font-medium text-slate-400">Kovon Platform</p>
            <p>Trainer Console v1.0</p>
          </div>
        )}

      </div>
    </aside>
  );
};

export default TrainerSidebar;
