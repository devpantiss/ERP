import { PROJECT_LEAD_MENU } from "../../pages/ProjectLead/projectLeadConfig";
import { CENTER_MENU_ITEMS } from "./centerInchargeMenu";
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
  IndianRupee,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Quote,
  Radio,
  ReceiptText,
  UserRoundPen,
  Users,
  Wallet,
} from "lucide-react";

const MENU_ITEMS = [
  {
    label: "Dashboard",
    path: "/project-head/dashboard",
    icon: LayoutDashboard,
  },
  ...PROJECT_LEAD_MENU,
  {
    label: "Project Details",
    path: "/admin/project-details-reports",
    icon: Briefcase,
  },
  {
    label: "Invoices",
    path: "/admin/invoices",
    icon: ReceiptText,
  },
  {
    label: "Fee Collection",
    path: "/admin/fee-collection",
    icon: IndianRupee,
  },
  {
    label: "Live Feed",
    path: "/admin/live-feed",
    icon: Radio,
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
        label: "Reimbursement Approvals",
        path: "/admin/approvals/reimbursements",
        icon: HandCoins,
      },
      {
        label: "Operations Approvals",
        path: "/admin/approvals/operations",
        icon: FileCheck,
      },
    ],
  },
  {
    label: "Employee List",
    path: "/admin/employee-list",
    icon: Users,
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
    label: "Testimonials",
    path: "/admin/testimonials",
    icon: Quote,
  },
  {
    label: "Profile",
    path: "/admin/profile",
    icon: UserRoundPen,
  },
];

function AdminSidebar({ role = "project" }) {
  const isCenter = role === "center";
  const roleLabel = isCenter ? "Center Incharge" : "Project Head";
  const menuItems = isCenter ? CENTER_MENU_ITEMS : MENU_ITEMS;
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
      className="sticky top-0 z-50 hidden h-dvh max-h-dvh w-20 shrink-0 self-start md:block"
    >
      <div
        data-collapsed={collapsed}
        onMouseLeave={() => setCollapsed(true)}
        className="perf-sidebar admin-future-sidebar flex h-full min-h-0 max-h-dvh flex-col overflow-hidden border-r border-slate-700 bg-[#111827] text-white/80 shadow-2xl shadow-black/20 [--sidebar-expanded-width:18rem]"
      >
      <div className="admin-future-sidebar__brand flex h-16 shrink-0 items-center justify-between border-b border-slate-700 px-4">
          <span className="perf-sidebar-label text-lg font-semibold tracking-tight text-violet-400">
            {roleLabel}
          </span>
        <button
          onClick={() => {
            setCollapsed((current) => !current);
          }}
          className="admin-future-icon-button rounded-md p-2 text-white/60 transition hover:bg-slate-700 hover:text-white"
          aria-label={`${collapsed ? "Expand" : "Collapse"} ${roleLabel} sidebar`}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav aria-label={`${roleLabel} navigation`} tabIndex={0} className="admin-future-sidebar__nav min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-4">
        {menuItems.map((item) => {
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

      <div className="admin-future-sidebar__footer shrink-0 space-y-2 border-t border-slate-700 px-3 py-4">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={17} />
          <span className="perf-sidebar-label">Log Out</span>
        </Link>

          <div className="perf-sidebar-label px-3 text-xs text-slate-500">
            <p className="font-medium text-white/60">Kovon Platform</p>
            <p>{isCenter ? "Center Console" : "Project Console"}</p>
          </div>
      </div>
      </div>
    </aside>
  );
}

export default memo(AdminSidebar);
