import { useState, memo } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Building2,
  ClipboardCheck,
  BarChart3,
  Settings,
  UserRoundPen,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  UserCheck,
  CalendarCheck,
  GraduationCap,
  Video,
  BookOpen,
  Megaphone,
  Briefcase,
  FileCheck,
  IndianRupee,
  Utensils,
} from "lucide-react";

/* ================= MENU CONFIG ================= */

const SECTIONS = [
  {
    key: "general",
    title: "General",
    icon: LayoutDashboard,
    items: [
      { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
      { label: "User Management", path: "/admin/user-management", icon: Users },
      { label: "Project Management", path: "/admin/project-management", icon: FolderKanban },
      { label: "Center Management", path: "/admin/center-management", icon: Building2 },
      { label: "Attendance Overview", path: "/admin/attendance-overview", icon: ClipboardCheck },
      { label: "Reports & Analytics", path: "/admin/reports", icon: BarChart3 },
      { label: "Invoice Management", path: "/admin/invoice-management", icon: IndianRupee },
    ],
  },
  {
    key: "mobilizers",
    title: "Mobilizers",
    icon: Megaphone,
    items: [
      { label: "Mobilizer List", path: "/admin/mobilizer-list", icon: Users },
      { label: "Candidate Approvals", path: "/admin/candidate-approvals", icon: UserCheck },
      { label: "Community Events", path: "/admin/community-events", icon: Megaphone },
    ],
  },
  {
    key: "trainers",
    title: "Trainers",
    icon: GraduationCap,
    items: [
      { label: "Trainer List", path: "/admin/trainer-list", icon: GraduationCap },
      { label: "Exposure Visits", path: "/admin/exposure-visit-approvals", icon: CalendarCheck },
      { label: "Module Progress", path: "/admin/module-progress", icon: BookOpen },
      { label: "Trainer Attendance", path: "/admin/trainer-attendance", icon: ClipboardCheck },
      { label: "Live Feed", path: "/admin/trainer-live-feed", icon: Video },
    ],
  },
  {
    key: "placements",
    title: "Placements",
    icon: Briefcase,
    items: [
      { label: "Drive Approvals", path: "/admin/placement-drive-approvals", icon: Briefcase },
      { label: "Placement Tracker", path: "/admin/placement-tracker", icon: FileCheck },
    ],
  },
  {
    key: "account",
    title: "Account",
    icon: Settings,
    items: [
      { label: "Settings", path: "/admin/settings", icon: Settings },
      { label: "Profile", path: "/admin/profile", icon: UserRoundPen },
    ],
  },
];

/* ================= COMPONENT ================= */

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState(["general"]);

  const toggleSection = (key) => {
    setOpenSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col
      bg-[#111827] text-white/80
      border-r border-slate-700
      transition-all duration-300
      ${collapsed ? "w-20" : "w-64"}`}
    >
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-700">
        {!collapsed && (
          <span className="text-lg font-semibold tracking-tight text-violet-400">
            Admin Hub
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md text-white/60 hover:text-white hover:bg-slate-700 transition"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* ================= MENU ================= */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
        {SECTIONS.map((section) => {
          const isOpen = openSections.includes(section.key);
          const SectionIcon = section.icon;

          return (
            <div key={section.key}>
              {/* Section Header (Dropdown Toggle) */}
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
                    ? "bg-violet-500/10 text-violet-400"
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

              {/* Section Items (Expandable) */}
              {!collapsed && (
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-96 opacity-100 mt-0.5" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="ml-3 pl-3 border-l border-slate-700/50 space-y-0.5">
                    {section.items.map(({ label, path, icon: Icon }) => (
                      <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) =>
                          `relative w-full flex items-center gap-3 px-3 py-2 rounded-lg
                          text-sm font-medium transition-all duration-200
                          ${
                            isActive
                              ? "bg-violet-500/10 text-violet-400"
                              : "text-white/60 hover:bg-transparent hover:text-white"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <span className="absolute left-0 top-0 h-full w-0.5 bg-violet-400 rounded-r-md" />
                            )}
                            <Icon size={15} className="shrink-0" />
                            <span className="truncate">{label}</span>
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ================= FOOTER ================= */}
      <div className="px-3 py-4 border-t border-slate-700 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg
          text-sm text-red-400 hover:bg-red-500/10
          hover:text-red-300 transition"
        >
          <LogOut size={18} />
          {!collapsed && <span>Log Out</span>}
        </Link>

        {!collapsed && (
          <div className="px-3 text-xs text-slate-500">
            <p className="font-medium text-white/60">Kovon Platform</p>
            <p>Admin Console v2.0</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default memo(AdminSidebar);
