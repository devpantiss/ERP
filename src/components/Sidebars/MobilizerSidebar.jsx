import { useState, memo } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  CalendarCheck2,
  LayoutDashboard,
  Users,
  UserRoundPen,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  UserCheck,
  CalendarDays,
  LogOut,
  IndianRupee,
  Briefcase,
  Receipt,
  MessageSquareWarning,
} from "lucide-react";

/* ================= MENU CONFIG ================= */

const TOP_MENU = [
  { label: "Dashboard", path: "/mobilizer/dashboard", icon: LayoutDashboard },
  { label: "Community Engagement", path: "/mobilizer/community-engagement", icon: CalendarCheck2 },
  { label: "Candidate Enrollment", path: "/mobilizer/student-enrollment", icon: Users },
];

const HR_MENU = [
  { label: "Attendance", path: "/mobilizer/hr/attendance", icon: UserCheck },
  { label: "Leave Management", path: "/mobilizer/hr/leave", icon: CalendarDays },
  { label: "Salary", path: "/mobilizer/hr/salary", icon: IndianRupee },
  { label: "Reimbursement", path: "/mobilizer/hr/reimbursement", icon: Receipt },
];

const BOTTOM_MENU = [
  { label: "Grievance Portal", path: "/mobilizer/grievance", icon: MessageSquareWarning },
  { label: "Profile", path: "/mobilizer/profile", icon: UserRoundPen },
];

/* ================= COMPONENT ================= */

const MobilizerSidebar = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [hrOpen, setHrOpen] = useState(false);
  const location = useLocation();

  const isHrActive = location.pathname.startsWith("/mobilizer/hr");
  const isHrOpen = hrOpen || isHrActive;

  const NavItem = ({ label, path, icon }) => {
    const IconComponent = icon;

    return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
        text-sm font-medium transition-all
        ${
          isActive
            ? "bg-yellow-400/15 text-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.15)]"
            : "text-white/80 hover:bg-white/5 hover:text-yellow-300"
        }`
      }
    >
      <IconComponent size={18} className="shrink-0" />
      <span className="perf-sidebar-label">{label}</span>
    </NavLink>
    );
  };

  return (
    <aside
      data-collapsed={collapsed}
      className="perf-sidebar h-screen sticky top-0 hidden md:flex flex-col
      bg-[#020617] text-white/90
      border-r border-yellow-400/30
      [--sidebar-expanded-width:16rem]"
    >
      {/* ================= HEADER ================= */}
      <div
        className="flex items-center justify-between px-4 h-16
        border-b border-yellow-400/20"
      >
          <span className="perf-sidebar-label text-lg font-semibold tracking-wide text-yellow-400">
            Mobilize Hub
          </span>

        <button
          onClick={() => {
            setCollapsed(!collapsed);
          }}
          className="p-2 rounded-lg
          text-white/80 hover:text-yellow-400
          hover:bg-white/5 transition"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* ================= MENU ================= */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Top menu items */}
        {TOP_MENU.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}

        {/* HR Entitlement — collapsible group */}
        <div className="pt-2">
          <button
            onClick={() => setHrOpen(!hrOpen)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
              ${isHrActive
                ? "bg-yellow-400/10 text-yellow-400"
                : "text-white/80 hover:bg-white/5 hover:text-yellow-300"
              }`}
          >
            <Briefcase size={18} />
              <>
                <span className="perf-sidebar-label flex-1 text-left">HR Entitlement</span>
                <ChevronDown
                  size={14}
                  className={`perf-sidebar-label transition-transform duration-200 ${isHrOpen ? "rotate-180" : ""}`}
                />
              </>
          </button>

          {/* Sub-items */}
          {isHrOpen && (
            <div className="perf-sidebar-panel ml-4 pl-3 border-l border-yellow-400/15 mt-1 space-y-0.5">
              {HR_MENU.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-3 py-2 rounded-lg
                    text-[13px] font-medium transition-all
                    ${
                      isActive
                        ? "bg-yellow-400/10 text-yellow-400"
                        : "text-white/60 hover:bg-white/5 hover:text-yellow-300"
                    }`
                  }
                >
                  <item.icon size={15} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Grievance & Profile */}
        <div className="pt-1 space-y-1">
          {BOTTOM_MENU.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
        </div>
      </nav>

      {/* ================= FOOTER ================= */}
      <div className="px-3 py-3 border-t border-yellow-400/20 space-y-2">

        {/* LOGOUT */}
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-xl
          text-sm text-red-400 hover:bg-red-500/10
          hover:text-red-300 transition"
        >
          <LogOut size={18} />
          <span className="perf-sidebar-label">Log Out</span>
        </Link>

        {/* BRAND */}
          <div className="perf-sidebar-label text-xs text-slate-500 px-3">
            © Kovon Platform
          </div>

      </div>
    </aside>
  );
};

export default memo(MobilizerSidebar);
