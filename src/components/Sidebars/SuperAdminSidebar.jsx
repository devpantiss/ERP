import { useState, memo } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  ShieldAlert,
  UserPlus,
  FolderKanban,
  Settings,
  UserRoundPen,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Lock,
  CalendarDays,
  Camera,
  FileCheck,
  MapPinned,
  MessageSquareWarning,
  ReceiptText,
  Wallet,
  HandCoins,
  Award,
  IndianRupee,
  ShieldCheck,
  Target,
  BookOpen,
} from "lucide-react";

/* ================= MENU CONFIG ================= */

const SECTIONS = [
  {
    key: "project-details",
    title: "Projects",
    icon: FolderKanban,
    items: [
      { label: "Project Details", path: "/super-admin/project-details", icon: FolderKanban },
      { label: "Batch Certification", path: "/super-admin/batch-certification", icon: Award },
    ],
  },
  {
    key: "live-feed",
    title: "Live Feed",
    icon: Camera,
    items: [
      { label: "Live Feed Viewer", path: "/super-admin/live-feed", icon: Camera },
    ],
  },
  {
    key: "approvals",
    title: "Approvals",
    icon: FileCheck,
    items: [
      { label: "Tour Approvals", path: "/super-admin/approvals/tour", icon: MapPinned },
      { label: "Leave Approvals", path: "/super-admin/approvals/leave", icon: CalendarDays },
      { label: "Salary Approvals", path: "/super-admin/approvals/salary", icon: Wallet },
      { label: "Invoice Approvals", path: "/super-admin/approvals/invoices", icon: ReceiptText },
      { label: "Reimbursement Approvals", path: "/super-admin/approvals/reimbursements", icon: HandCoins },
      { label: "Operations Approvals", path: "/super-admin/approvals/operations", icon: FileCheck },
    ],
  },
  {
    key: "grievances",
    title: "Grievances",
    icon: MessageSquareWarning,
    items: [
      { label: "Grievance Tracker", path: "/super-admin/grievance-tracker", icon: MessageSquareWarning },
    ],
  },
  {
    key: "finance",
    title: "Finances",
    icon: Wallet,
    items: [
      { label: "Insurance", path: "/super-admin/student-insurance-details", icon: ShieldCheck },
      { label: "Fee Collection", path: "/super-admin/fee-collection", icon: IndianRupee },
    ],
  },
  {
    key: "training",
    title: "Training",
    icon: BookOpen,
    items: [
      { label: "Module Content", path: "/super-admin/module-content", icon: BookOpen },
    ],
  },
  {
    key: "access",
    title: "Access Control",
    icon: Lock,
    items: [
      { label: "Access & Target", path: "/super-admin/access-target", icon: Target },
      { label: "User Management", path: "/super-admin/user-management", icon: UserPlus },
      { label: "Create Projects", path: "/super-admin/create-projects", icon: FolderKanban },
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
  const [collapsed, setCollapsed] = useState(true);
  const [openSections, setOpenSections] = useState(["project-details"]);
  const location = useLocation();

  const toggleSection = (key) => {
    setOpenSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <aside
      data-collapsed={collapsed}
      onMouseLeave={() => setCollapsed(true)}
      className="perf-sidebar h-screen sticky top-0 hidden md:flex flex-col
      bg-[#0f172a] text-white/80
      border-r border-slate-700/50
      z-50 [--sidebar-expanded-width:16rem]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-700/50">
        <span className="perf-sidebar-label text-lg font-bold tracking-tight text-red-500 flex items-center gap-2">
          <ShieldAlert size={20} className="text-red-500" />
          Super Admin
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

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
        <NavLink
          to="/super-admin/dashboard"
          onClick={() => setCollapsed(true)}
          className={({ isActive }) =>
            `relative mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${isActive ? "bg-red-500/10 text-red-500" : "text-white/60 hover:bg-transparent hover:text-white"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && <span className="absolute left-0 top-0 h-full w-0.5 rounded-r-md bg-red-500" />}
              <LayoutDashboard size={16} className="shrink-0" />
              <span className="perf-sidebar-label">Dashboard</span>
            </>
          )}
        </NavLink>

        {SECTIONS.map((section) => {
          const hasActiveItem = section.items.some((item) => item.path && location.pathname === item.path);
          const isOpen = openSections.includes(section.key) || hasActiveItem;
          const SectionIcon = section.icon;

          return (
            <div key={section.key}>
              <button
                onClick={() => {
                  toggleSection(section.key);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-semibold transition-all duration-200 cursor-pointer
                ${isOpen
                    ? "bg-red-500/10 text-red-500"
                    : "text-white/60 hover:bg-transparent hover:text-white"
                  }`}
              >
                <SectionIcon size={16} className="shrink-0" />
                <>
                  <span className="perf-sidebar-label flex-1 text-left">{section.title}</span>
                  <ChevronDown
                    size={14}
                    className={`perf-sidebar-label shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                      }`}
                  />
                </>
              </button>

              <div className="perf-sidebar-panel">
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0"
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
                          onClick={() => setCollapsed(true)}
                          className={({ isActive }) =>
                            `relative w-full flex items-center gap-3 px-3 py-2 rounded-lg
                            text-sm font-medium transition-all duration-200
                            ${isActive
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
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-700 space-y-2">
        <Link
          to="/"
          onClick={() => setCollapsed(true)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg
          text-sm text-red-500 hover:bg-red-500/10
          hover:text-red-400 transition"
        >
          <LogOut size={18} />
          <span className="perf-sidebar-label">Exit to Portal</span>
        </Link>
        <div className="perf-sidebar-label px-3 text-[10px] text-slate-500">
          <p className="font-bold text-red-600/80 uppercase">Super Admin</p>
          <p>Master Console v3.0</p>
        </div>
      </div>
    </aside>
  );
};

export default memo(SuperAdminSidebar);
