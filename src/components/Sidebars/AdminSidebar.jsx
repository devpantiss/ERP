import { memo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Briefcase,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  HandCoins,
  LayoutDashboard,
  LogOut,
  MapPinned,
  MessageSquareWarning,
  PackageCheck,
  Radio,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";

const MENU_ITEMS = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Employee List",
    path: "/admin/employee-list",
    icon: Users,
  },
  {
    label: "Financial Management",
    icon: Wallet,
    key: "financial-management",
    children: [
      {
        label: "Invoices Raised",
        path: "/admin/financial-management/invoices-raised",
        icon: Receipt,
      },
      {
        label: "Procurement",
        path: "/admin/financial-management/procurement",
        icon: ShoppingCart,
      },
    ],
  },
  {
    label: "HR Entitlement",
    icon: CalendarCheck,
    key: "hr-entitlement",
    children: [
      {
        label: "Attendance",
        path: "/admin/hr/attendance",
        icon: CalendarCheck,
      },
      {
        label: "Leave Management",
        path: "/admin/hr/leave",
        icon: CalendarDays,
      },
      {
        label: "Salary",
        path: "/admin/hr/salary",
        icon: Wallet,
      },
      {
        label: "Reimbursement",
        path: "/admin/hr/reimbursement",
        icon: HandCoins,
      },
    ],
  },
  {
    label: "Live Feed",
    path: "/admin/live-feed",
    icon: Radio,
  },
  {
    label: "Project Details / Reports",
    path: "/admin/project-details-reports",
    icon: Briefcase,
  },
  {
    label: "Students Kit Distribution",
    path: "/admin/students-kit-distribution",
    icon: PackageCheck,
  },
  {
    label: "Student Insurance Details",
    path: "/admin/student-insurance-details",
    icon: ShieldCheck,
  },
  {
    label: "Approvals",
    icon: FileCheck,
    key: "approvals",
    children: [
      {
        label: "Tour Approvals",
        path: "/admin/approvals/tour",
        icon: MapPinned,
      },
      {
        label: "Leave Approvals",
        path: "/admin/approvals/leave",
        icon: CalendarDays,
      },
      {
        label: "Salary Approvals",
        path: "/admin/approvals/salary",
        icon: Wallet,
      },
      {
        label: "Operations Approvals",
        path: "/admin/approvals/operations",
        icon: FileCheck,
      },
    ],
  },
  {
    label: "Grievance Portal",
    path: "/admin/grievance-portal",
    icon: MessageSquareWarning,
  },
];

function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const [openGroups, setOpenGroups] = useState([]);
  const location = useLocation();

  const toggleGroup = (groupKey) => {
    setOpenGroups((current) =>
      current.includes(groupKey)
        ? current.filter((item) => item !== groupKey)
        : [...current, groupKey]
    );
  };

  return (
    <aside
      className="sticky top-0 z-50 hidden h-screen w-20 shrink-0 md:block"
    >
      <div
        data-collapsed={collapsed}
        className="perf-sidebar admin-future-sidebar flex h-screen flex-col border-r border-slate-700 bg-[#111827] text-white/80 shadow-2xl shadow-black/20 [--sidebar-expanded-width:18rem]"
      >
      <div className="admin-future-sidebar__brand flex h-16 items-center justify-between border-b border-slate-700 px-4">
          <span className="perf-sidebar-label text-lg font-semibold tracking-tight text-violet-400">
            Admin Hub
          </span>
        <button
          onClick={() => {
            setCollapsed((current) => !current);
          }}
          className="admin-future-icon-button rounded-md p-2 text-white/60 transition hover:bg-slate-700 hover:text-white"
          aria-label={collapsed ? "Expand admin sidebar" : "Collapse admin sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;

          if (!item.children) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-violet-500/10 text-violet-300"
                      : "text-white/65 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon size={17} className="shrink-0" />
                <span className="perf-sidebar-label truncate">{item.label}</span>
              </NavLink>
            );
          }

          const hasActiveChild = item.children.some((child) => location.pathname === child.path);
          const isOpen = openGroups.includes(item.key) || hasActiveChild;

          return (
            <div key={item.key} className="space-y-1">
              <button
                onClick={() => {
                  if (collapsed) {
                    setCollapsed(false);
                  }
                  toggleGroup(item.key);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isOpen
                    ? "bg-violet-500/10 text-violet-300"
                    : "text-white/65 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={17} className="shrink-0" />
                  <>
                    <span className="perf-sidebar-label flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      size={15}
                      className={`perf-sidebar-label transition ${isOpen ? "rotate-180" : ""}`}
                    />
                  </>
              </button>

              {isOpen && (
                <div className="perf-sidebar-panel ml-4 space-y-1 border-l border-slate-700/70 pl-4">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    return (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                            isActive
                              ? "bg-violet-500/10 text-violet-300"
                              : "text-white/60 hover:bg-slate-800 hover:text-white"
                          }`
                        }
                      >
                        <ChildIcon size={15} className="shrink-0" />
                        <span>{child.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="admin-future-sidebar__footer space-y-2 border-t border-slate-700 px-3 py-4">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={17} />
          <span className="perf-sidebar-label">Log Out</span>
        </Link>

          <div className="perf-sidebar-label px-3 text-xs text-slate-500">
            <p className="font-medium text-white/60">Kovon Platform</p>
            <p>Admin Console</p>
          </div>
      </div>
      </div>
    </aside>
  );
}

export default memo(AdminSidebar);
