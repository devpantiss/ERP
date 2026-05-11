import { Outlet } from "react-router-dom";
import AdminSidebar from "../Sidebars/AdminSidebar";
import MobileBottomDock from "../common/MobileBottomDock";
import {
  LayoutDashboard,
  Users,
  FileCheck,
  Wallet,
  Receipt,
  ShoppingCart,
  Radio,
  Briefcase,
  MessageSquareWarning,
} from "lucide-react";

/* ─── Dock config ─── */
const DOCK_ITEMS = [
  { label: "Dashboard", shortLabel: "Home", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Employees", path: "/admin/employee-list", icon: Users },
  { label: "Approvals", path: "/admin/approvals", icon: FileCheck },
];

const DRAWER_ITEMS = [
  {
    label: "Financial Management",
    icon: Wallet,
    children: [
      { label: "Salary Approvals", path: "/admin/financial-management/salary-approvals", icon: Wallet },
      { label: "Invoices Raised", path: "/admin/financial-management/invoices-raised", icon: Receipt },
      { label: "Procurement", path: "/admin/financial-management/procurement", icon: ShoppingCart },
    ],
  },
  { label: "Live Feed", path: "/admin/live-feed", icon: Radio },
  { label: "Project Details / Reports", path: "/admin/project-details-reports", icon: Briefcase },
  { label: "Grievance Portal", path: "/admin/grievance-portal", icon: MessageSquareWarning },
];

const ACCENT = {
  activeBg: "bg-violet-500/10",
  activeText: "text-violet-300",
  dot: "bg-violet-400",
  headerText: "text-violet-400",
};

const AdminLayout = () => {
  return (
    <div className="admin-future flex min-h-screen bg-[#030712] text-white relative">

      {/* ================= SIDEBAR ================= */}
      <AdminSidebar />

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
        dockItems={DOCK_ITEMS}
        drawerItems={DRAWER_ITEMS}
        accentClass={ACCENT}
        roleLabel="Admin Hub"
      />
    </div>
  );
};

export default AdminLayout;
