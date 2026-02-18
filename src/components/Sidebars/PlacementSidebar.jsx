import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  Users,
  UserRoundPen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ================= MENU CONFIG ================= */

const MENU = [
  { label: "Dashboard", path: "/placement-officer/dashboard", icon: LayoutDashboard },
  { label: "Company Database", path: "/placement-officer/company-database", icon: Building2 },
  { label: "Placement Drives", path: "/placement-officer/placement-drives", icon: CalendarCheck },
  { label: "Job Openings Dashboard", path: "#", icon: Users },
  { label: "Profile", path: "/placement-officer/profile", icon: UserRoundPen },
];

/* ================= COMPONENT ================= */

const PlacementSidebar = () => {
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
          <span className="text-lg font-semibold tracking-tight text-cyan-400">
            PlaCom Hub
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
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active Indicator */}
                {isActive && (
                  <span className="absolute left-0 top-0 h-full w-1 bg-cyan-400 rounded-r-md" />
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
            <p>Placement Console v1.0</p>
          </div>
        )}

      </div>
    </aside>
  );
};

export default PlacementSidebar;
