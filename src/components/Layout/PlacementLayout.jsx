import { Outlet } from "react-router-dom";
import PlacementSidebar from "../Sidebars/PlacementSidebar";
import MobileBottomDock from "../common/MobileBottomDock";
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  List,
  Briefcase,
  UserCheck,
  CalendarDays,
  IndianRupee,
  Receipt,
  MessageSquareWarning,
  UserRoundPen,
  MapPinned,
} from "lucide-react";

/* ─── Dock config ─── */
const DOCK_ITEMS = [
  { label: "Dashboard", shortLabel: "Home", path: "/placement-officer/dashboard", icon: LayoutDashboard },
  { label: "Companies", path: "/placement-officer/company-database", icon: Building2 },
  { label: "Openings", path: "/placement-officer/job-openings", icon: LayoutDashboard },
];

const DRAWER_ITEMS = [
  { label: "Placement Drives", path: "/placement-officer/placement-drives", icon: CalendarCheck },
  { label: "Placement List", path: "/placement-officer/placements-list", icon: List },
  {
    label: "HR Entitlement",
    icon: Briefcase,
    children: [
      { label: "Attendance", path: "/placement-officer/hr/attendance", icon: UserCheck },
      { label: "Leave Management", path: "/placement-officer/hr/leave", icon: CalendarDays },
      { label: "Tour Application", path: "/placement-officer/hr/tour", icon: MapPinned },
      { label: "Salary", path: "/placement-officer/hr/salary", icon: IndianRupee },
      { label: "Reimbursement", path: "/placement-officer/hr/reimbursement", icon: Receipt },
    ],
  },
  { label: "Grievance Portal", path: "/placement-officer/grievance", icon: MessageSquareWarning },
  { label: "Profile", path: "/placement-officer/profile", icon: UserRoundPen },
];

const ACCENT = {
  activeBg: "bg-cyan-500/10",
  activeText: "text-cyan-400",
  dot: "bg-cyan-400",
  headerText: "text-cyan-400",
};

const PlacementLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#07111f] text-white relative">

      {/* ================= SIDEBAR ================= */}
      <PlacementSidebar />

      {/* ================= MAIN WRAPPER ================= */}
      <div className="relative flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.08),transparent_34%),linear-gradient(180deg,#07111f_0%,#09131f_46%,#060b13_100%)]" />

        {/* ================= CONTENT AREA ================= */}
        <main className="relative z-10 flex-1 min-w-0 pb-20 md:pb-0">
          <div className="mx-auto w-full max-w-[1600px] min-w-0 px-4 md:px-6 py-6">
            <Outlet />
          </div>
        </main>

      </div>

      {/* ================= MOBILE DOCK ================= */}
      <MobileBottomDock
        dockItems={DOCK_ITEMS}
        drawerItems={DRAWER_ITEMS}
        accentClass={ACCENT}
        roleLabel="PlaCom Hub"
      />
    </div>
  );
};

export default PlacementLayout;
