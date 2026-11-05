import useRoleTheme from "../../theme/useRoleTheme";
import { PROJECT_LEAD_MENU } from "../../pages/ProjectLead/projectLeadConfig";
import { CENTER_MENU_ITEMS } from "../Sidebars/centerInchargeMenu";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../Sidebars/AdminSidebar";
import MobileBottomDock from "../common/MobileBottomDock";
import {
  CalendarCheck,
  CalendarDays,
  LayoutDashboard,
  Users,
  FileCheck,
  HandCoins,
  MapPinned,
  Wallet,
  Radio,
  Briefcase,
  Quote,
  ReceiptText,
  UserRoundPen,
} from "lucide-react";

/* ─── Dock config ─── */
const DOCK_ITEMS = [
  { label: "Dashboard", shortLabel: "Home", path: "/project-head/dashboard", icon: LayoutDashboard },
  { label: "Projects", path: "/admin/project-details-reports", icon: Briefcase },
  { label: "Live Feed", shortLabel: "Live", path: "/admin/live-feed", icon: Radio },
];

const DRAWER_ITEMS = [
  ...PROJECT_LEAD_MENU,
  { label: "Invoices", path: "/admin/invoices", icon: ReceiptText },
  {
    label: "Approvals",
    icon: FileCheck,
    children: [
      { label: "Tour Approvals", path: "/admin/approvals/tour", icon: MapPinned },
      { label: "Leave Approvals", path: "/admin/approvals/leave", icon: CalendarDays },
      { label: "Salary Approvals", path: "/admin/approvals/salary", icon: Wallet },
      { label: "Reimbursement Approvals", path: "/admin/approvals/reimbursements", icon: HandCoins },
      { label: "Operations Approvals", path: "/admin/approvals/operations", icon: FileCheck },
    ],
  },
  { label: "Employee List", path: "/admin/employee-list", icon: Users },
  {
    label: "HR Entitlement",
    icon: CalendarCheck,
    children: [
      { label: "Attendance", path: "/admin/hr/attendance", icon: CalendarCheck },
      { label: "Leave Management", path: "/admin/hr/leave", icon: CalendarDays },
      { label: "Salary", path: "/admin/hr/salary", icon: Wallet },
      { label: "Reimbursement", path: "/admin/hr/reimbursement", icon: HandCoins },
    ],
  },
  { label: "Testimonials", path: "/admin/testimonials", icon: Quote },
  { label: "Profile", path: "/admin/profile", icon: UserRoundPen },
];

const ACCENT = {
  activeBg: "bg-violet-500/10",
  activeText: "text-violet-300",
  dot: "bg-violet-400",
  headerText: "text-violet-400",
};

const AdminLayout = ({ role = "project" }) => {
  const isCenter = role === "center";
  useRoleTheme(isCenter ? "center" : "project");
  const roleLabel = isCenter ? "Center Incharge" : "Project Head";
  return (
    <div className="role-shell admin-future flex min-h-screen bg-[#030712] text-white relative">

      {/* ================= SIDEBAR ================= */}
      <AdminSidebar role={role} />

      {/* ================= MAIN WRAPPER ================= */}
      <div className="relative flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* Background Ambient Mesh */}
        <div className="admin-future__backdrop absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="admin-future__grid" />
        </div>

        {/* ================= CONTENT AREA ================= */}
        <main className="admin-future__main relative z-10 flex-1 min-w-0 pb-20 md:pb-0">
          <div className="admin-future__content mx-auto w-full max-w-[1600px] min-w-0 px-4 md:px-6 py-6">
            <Outlet />
          </div>
        </main>

      </div>

      {/* ================= MOBILE DOCK ================= */}
      <MobileBottomDock
        dockItems={isCenter ? CENTER_MENU_ITEMS.filter((item) => item.label !== "Alerts").slice(0, 3) : DOCK_ITEMS}
        drawerItems={isCenter ? CENTER_MENU_ITEMS.filter((item) => !["Dashboard", "Center Team", "Project Details"].includes(item.label)) : DRAWER_ITEMS}
        accentClass={isCenter ? { activeBg: "bg-teal-500/10", activeText: "text-teal-300", dot: "bg-teal-400", headerText: "text-teal-400" } : ACCENT}
        roleLabel={roleLabel}
      />
    </div>
  );
};

export default AdminLayout;
