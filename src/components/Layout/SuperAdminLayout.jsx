import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "../Sidebars/SuperAdminSidebar";
import MobileBottomDock from "../common/MobileBottomDock";
import {
  LayoutDashboard,
  Users,
  UserCog,
  FolderKanban,
  Activity,
  CalendarDays,
  Camera,
  Building2,
  FileCheck,
  Megaphone,
  MapPinned,
  Briefcase,
  MessageSquareWarning,
  Wallet,
  ReceiptText,
  HandCoins,
  UserPlus,
  Settings,
  UserRoundPen,
  Award,
  ShieldCheck,
  Target,
} from "lucide-react";

/* ─── Dock config ─── */
const DOCK_ITEMS = [
  { label: "Dashboard", shortLabel: "Home", path: "/super-admin/dashboard", icon: LayoutDashboard },
  { label: "Projects", path: "/super-admin/project-details", icon: FolderKanban },
  { label: "Access & Target", shortLabel: "Access", path: "/super-admin/access-target", icon: Target },
];

const DRAWER_ITEMS = [
  {
    label: "Projects",
    icon: FolderKanban,
    children: [
      { label: "Project Details", path: "/super-admin/project-details", icon: FolderKanban },
      { label: "Candidate Details", path: "/super-admin/candidate-details", icon: Users },
      { label: "Batch Certification", path: "/super-admin/batch-certification", icon: Award },
    ],
  },
  {
    label: "Approvals",
    icon: FileCheck,
    children: [
      { label: "Tour Approvals", path: "/super-admin/approvals/tour", icon: MapPinned },
      { label: "Leave Approvals", path: "/super-admin/approvals/leave", icon: CalendarDays },
      { label: "Salary Approvals", path: "/super-admin/approvals/salary", icon: Wallet },
      { label: "Invoice Approvals", path: "/super-admin/approvals/invoices", icon: ReceiptText },
      { label: "Reimbursement Approvals", path: "/super-admin/approvals/reimbursements", icon: HandCoins },
      { label: "Operations Approvals", path: "/super-admin/approvals/operations", icon: FileCheck },
    ],
  },
  { label: "Industry Database", path: "/super-admin/industry-database", icon: Building2 },
  { label: "Grievance Tracker", path: "/super-admin/grievance-tracker", icon: MessageSquareWarning },
  {
    label: "Finances",
    icon: Wallet,
    children: [
      { label: "Insurance", path: "/super-admin/student-insurance-details", icon: ShieldCheck },
    ],
  },
  {
    label: "Access Control",
    icon: UserPlus,
    children: [
      { label: "Access & Target", path: "/super-admin/access-target", icon: Target },
      { label: "User Management", path: "/super-admin/user-management", icon: UserPlus },
      { label: "Create Projects", path: "/super-admin/create-projects", icon: FolderKanban },
    ],
  },
  { label: "Platform Settings", path: "/super-admin/settings", icon: Settings },
  { label: "Profile", path: "/super-admin/profile", icon: UserRoundPen },
];

const ACCENT = {
  activeBg: "bg-red-500/10",
  activeText: "text-red-500",
  dot: "bg-red-500",
  headerText: "text-red-500",
};

const SuperAdminLayout = () => {
  return (
    <div className="relative flex h-screen overflow-hidden bg-[#020617]">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(239, 68, 68, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(239, 68, 68, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Ambient glow */}
      <div className="fixed top-0 left-1/3 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[200px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-red-600/3 rounded-full blur-[150px] pointer-events-none" />

      {/* Sidebar */}
      <SuperAdminSidebar />

      {/* Main content */}
      <main
        className="relative z-10 h-screen min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 pb-24 md:pb-8"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#1e293b transparent",
        }}
      >
        <Outlet />
      </main>

      {/* ================= MOBILE DOCK ================= */}
      <MobileBottomDock
        dockItems={DOCK_ITEMS}
        drawerItems={DRAWER_ITEMS}
        accentClass={ACCENT}
        roleLabel="Super Admin"
      />
    </div>
  );
};

export default SuperAdminLayout;
