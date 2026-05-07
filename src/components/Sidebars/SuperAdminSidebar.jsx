import { useState, memo } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  ShieldAlert,
  Users,
  Briefcase,
  UserPlus,
  FolderKanban,
  Building2,
  UserCog,
  Settings,
  UserRoundPen,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Lock,
  Activity,
  Camera,
  Megaphone,
  MessageSquareWarning,
  ReceiptText,
  Wallet,
} from "lucide-react";

/* ================= MENU CONFIG ================= */

const SECTIONS = [
  {
    key: "operations",
    title: "Operations",
    icon: FolderKanban,
    items: [
      { label: "Dashboard", path: "/super-admin/dashboard", icon: LayoutDashboard },
      { label: "Candidate Details", path: "/super-admin/candidate-details", icon: Users },
      { label: "Employee Management", path: "/super-admin/employee-management", icon: UserCog },
      { heading: "Training" },
      { label: "Training Tracking", path: "/super-admin/training-tracking", icon: Activity },
      { label: "Exposure Visits", path: "/super-admin/exposure-visits", icon: Camera },
      { heading: "Mobilization" },
      { label: "Mobilization", path: "/super-admin/mobilization", icon: Building2 },
      { label: "Community Engagement Drives", path: "/super-admin/community-engagement-drives", icon: Megaphone },
      { heading: "Placements" },
      { label: "Placement Drives", path: "/super-admin/placement-drives", icon: Briefcase },
      { heading: "Grievances" },
      { label: "Grievance Tracker", path: "/super-admin/grievance-tracker", icon: MessageSquareWarning },
    ],
  },
  {
    key: "finance",
    title: "Finances",
    icon: Wallet,
    items: [
      { label: "Salaries", path: "/super-admin/salaries", icon: Wallet },
      { label: "Invoices", path: "/super-admin/invoices", icon: ReceiptText },
    ],
  },
  {
    key: "access",
    title: "Access Control",
    icon: Lock,
    items: [
      { label: "User Management", path: "/super-admin/user-management", icon: UserPlus },
    ],
  },
  {
    key: "account",
    title: "Settings",
    icon: Settings,
    items: [
      { label: "Platform Settings", path: "/super-admin/settings", icon: Settings },
      { label: "Profile", path: "/super-admin/profile", icon: UserRoundPen },
    ],
  },
];

/* ================= COMPONENT ================= */

const SuperAdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState(["operations"]);

  const toggleSection = (key) => {
    setOpenSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col
      bg-[#0f172a] text-white/80
      border-r border-slate-700/50
      transition-all duration-300 z-50
      ${collapsed ? "w-20" : "w-64"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-700/50">
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-red-500 flex items-center gap-2">
            <ShieldAlert size={20} className="text-red-500" />
            Super Admin
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md text-white/60 hover:text-white hover:bg-slate-700 transition"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
        {SECTIONS.map((section) => {
          const isOpen = openSections.includes(section.key);
          const SectionIcon = section.icon;

          return (
            <div key={section.key}>
              <button
                onClick={() => {
                  if (collapsed) {
                    setCollapsed(false);
                    if (!isOpen) toggleSection(section.key);
                  } else {
                    toggleSection(section.key);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-semibold transition-all duration-200 cursor-pointer
                ${
                  isOpen
                    ? "bg-red-500/10 text-red-500"
                    : "text-white/60 hover:bg-transparent hover:text-white"
                }`}
              >
                <SectionIcon size={16} className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{section.title}</span>
                    <ChevronDown
                      size={14}
                      className={`shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </button>

              {!collapsed && (
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="ml-3 pl-3 border-l border-slate-700/50 space-y-1">
                    {section.items.map((item, idx) =>
                      item.heading ? (
                        <p
                          key={item.heading}
                          className={`text-[9px] font-black uppercase tracking-[0.2em] text-slate-500/70 px-3 ${idx === 0 ? "pt-1 pb-1" : "pt-3 pb-1"}`}
                        >
                          {item.heading}
                        </p>
                      ) : (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          end={item.path === "/super-admin"}
                          className={({ isActive }) =>
                            `relative w-full flex items-center gap-3 px-3 py-2 rounded-lg
                            text-sm font-medium transition-all duration-200
                            ${
                              isActive
                                ? "bg-red-500/10 text-red-500 font-bold"
                                : "text-white/60 hover:bg-transparent hover:text-white"
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              {isActive && (
                                <span className="absolute left-0 top-0 h-full w-0.5 bg-red-500 rounded-r-md" />
                              )}
                              <item.icon size={14} className="shrink-0" />
                              <span className="truncate">{item.label}</span>
                            </>
                          )}
                        </NavLink>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-700 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg
          text-sm text-red-500 hover:bg-red-500/10
          hover:text-red-400 transition"
        >
          <LogOut size={18} />
          {!collapsed && <span>Exit to Portal</span>}
        </Link>
        {!collapsed && (
          <div className="px-3 text-[10px] text-slate-500">
            <p className="font-bold text-red-600/80 uppercase">Super Admin</p>
            <p>Master Console v3.0</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default memo(SuperAdminSidebar);
