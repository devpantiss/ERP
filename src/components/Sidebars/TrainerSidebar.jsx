import { useState, memo } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  CalendarDays,
  UserRoundPen,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  IndianRupee,
  Briefcase,
  Receipt,
  MessageSquareWarning,
  GraduationCap,
  Quote,
} from "lucide-react";

/* ================= MENU CONFIG ================= */

const TOP_MENU = [
  { label: "Dashboard", path: "/trainer/dashboard", icon: LayoutDashboard },
  { label: "Teaching Management", path: "/trainer/teaching-management", icon: GraduationCap },
  { label: "Exposure Visits", path: "/trainer/exposure-visits", icon: MapPin },
  { label: "Testimonials", path: "/trainer/testimonials", icon: Quote },
];

/* HR Entitlement — NO Attendance for Trainer */
const HR_MENU = [
  { label: "Leave Management", path: "/trainer/hr/leave", icon: CalendarDays },
  { label: "Salary", path: "/trainer/hr/salary", icon: IndianRupee },
  { label: "Reimbursement", path: "/trainer/hr/reimbursement", icon: Receipt },
];

const BOTTOM_MENU = [
  { label: "Grievance Portal", path: "/trainer/grievance", icon: MessageSquareWarning },
  { label: "Profile", path: "/trainer/profile", icon: UserRoundPen },
];

/* ================= COMPONENT ================= */

const TrainerSidebar = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [hrOpen, setHrOpen] = useState(false);
  const location = useLocation();

  const isHrActive = location.pathname.startsWith("/trainer/hr");
  const isHrOpen = hrOpen || isHrActive;

  const NavItem = ({ label, path, icon }) => {
    const IconComponent = icon;

    return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
        text-sm font-medium transition-all duration-200
        ${
          isActive
            ? "bg-emerald-500/10 text-emerald-400"
            : "text-white/60 hover:bg-transparent hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-0 h-full w-1 bg-emerald-400 rounded-r-md" />
          )}
          <IconComponent size={18} className="shrink-0" />
          <span className="perf-sidebar-label">{label}</span>
        </>
      )}
    </NavLink>
    );
  };

  return (
    <aside
      className="sticky top-0 z-50 hidden h-screen w-20 shrink-0 md:block"
    >
      <div
        data-collapsed={collapsed}
        className="perf-sidebar h-screen flex flex-col
        bg-[#111827] text-white/80
        border-r border-slate-700 shadow-2xl shadow-black/20
        [--sidebar-expanded-width:16rem]"
      >
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-700">

          <span className="perf-sidebar-label text-lg font-semibold tracking-tight text-emerald-400">
            Teach Hub
          </span>

        <button
          onClick={() => {
            setCollapsed(!collapsed);
          }}
          className="p-2 rounded-md text-white/60 hover:text-white hover:bg-slate-700 transition"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* ================= MENU ================= */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {/* Top menu items */}
        {TOP_MENU.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}

        {/* HR Entitlement — collapsible group (NO Attendance) */}
        <div className="pt-2">
          <button
            onClick={() => setHrOpen(!hrOpen)}
            className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${isHrActive
                ? "bg-emerald-500/10 text-emerald-400"
                : "text-white/60 hover:bg-transparent hover:text-white"
              }`}
          >
            {isHrActive && (
              <span className="absolute left-0 top-0 h-full w-1 bg-emerald-400 rounded-r-md" />
            )}
            <Briefcase size={18} className="shrink-0" />
              <>
                <span className="perf-sidebar-label flex-1 text-left">HR Entitlement</span>
                <ChevronDown
                  size={14}
                  className={`perf-sidebar-label transition-transform duration-200 ${isHrOpen ? "rotate-180" : ""}`}
                />
              </>
          </button>

          {isHrOpen && (
            <div className="perf-sidebar-panel ml-4 pl-3 border-l border-emerald-500/15 mt-1 space-y-0.5">
              {HR_MENU.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-3 py-2 rounded-lg
                    text-[13px] font-medium transition-all
                    ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-white/50 hover:bg-white/5 hover:text-emerald-300"
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
      <div className="px-3 py-4 border-t border-slate-700 space-y-2">

        {/* LOGOUT */}
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg
          text-sm text-red-400 hover:bg-red-500/10
          hover:text-red-300 transition"
        >
          <LogOut size={18} />
          <span className="perf-sidebar-label">Log Out</span>
        </Link>

        {/* BRAND */}
          <div className="perf-sidebar-label px-3 text-xs text-slate-500">
            <p className="font-medium text-white/60">Kovon Platform</p>
            <p>Trainer Console v1.0</p>
          </div>

      </div>
      </div>
    </aside>
  );
};

export default memo(TrainerSidebar);
