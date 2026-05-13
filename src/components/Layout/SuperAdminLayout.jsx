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
  Megaphone,
  Briefcase,
  MessageSquareWarning,
  Wallet,
  ReceiptText,
  UserPlus,
  Settings,
  UserRoundPen,
} from "lucide-react";

/* ─── Dock config ─── */
const DOCK_ITEMS = [
  { label: "Dashboard", shortLabel: "Home", path: "/super-admin/dashboard", icon: LayoutDashboard },
  { label: "Candidates", path: "/super-admin/candidate-details", icon: Users },
  { label: "Employees", path: "/super-admin/employee-management", icon: UserCog },
];

const DRAWER_ITEMS = [
  {
    label: "Operations",
    icon: FolderKanban,
    children: [
      { heading: "Training" },
      { label: "Training Tracking", path: "/super-admin/training-tracking", icon: Activity },
      { label: "Exposure Visits", path: "/super-admin/exposure-visits", icon: Camera },
      { heading: "Mobilization" },
      { label: "Mobilization", path: "/super-admin/mobilization", icon: Building2 },
      { label: "Community Drives", path: "/super-admin/community-engagement-drives", icon: Megaphone },
      { heading: "Placements" },
      { label: "Placement Drives", path: "/super-admin/placement-drives", icon: Briefcase },
    ],
  },
  { label: "Grievance Tracker", path: "/super-admin/grievance-tracker", icon: MessageSquareWarning },
  { label: "Leave Monitor", path: "/super-admin/leave-monitor", icon: CalendarDays },
  {
    label: "Finances",
    icon: Wallet,
    children: [
      { label: "Salaries", path: "/super-admin/salaries", icon: Wallet },
      { label: "Invoices", path: "/super-admin/invoices", icon: ReceiptText },
    ],
  },
  { label: "User Management", path: "/super-admin/user-management", icon: UserPlus },
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
