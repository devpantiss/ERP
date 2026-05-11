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
  IndianRupee,
  Receipt,
  MessageSquareWarning,
  UserRoundPen,
} from "lucide-react";

/* ─── Dock config ─── */
const DOCK_ITEMS = [
  { label: "Dashboard", shortLabel: "Home", path: "/placement-officer/dashboard", icon: LayoutDashboard },
  { label: "Companies", path: "/placement-officer/company-database", icon: Building2 },
  { label: "Drives", path: "/placement-officer/placement-drives", icon: CalendarCheck },
];

const DRAWER_ITEMS = [
  { label: "Placement-List", path: "/placement-officer/placements-list", icon: List },
  { label: "Openings Dashboard", path: "/placement-officer/job-openings", icon: LayoutDashboard },
  {
    label: "HR Entitlement",
    icon: Briefcase,
    children: [
      { label: "Attendance", path: "/placement-officer/hr/attendance", icon: UserCheck },
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
    <div className="flex min-h-screen bg-[#030712] text-white relative">

      {/* ================= SIDEBAR ================= */}
      <PlacementSidebar />

      {/* ================= MAIN WRAPPER ================= */}
      <div className="relative flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* Background Ambient Mesh */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/15 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/15 blur-[120px]" />
          <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-sky-900/15 blur-[100px]" />
        </div>


        {/* ===== CYAN GRID BACKGROUND ===== */}
        <div
          className="absolute inset-0 pointer-events-none
          bg-[linear-gradient(to_right,rgba(34,211,238,0.65)_1px,transparent_1px),
              linear-gradient(to_bottom,rgba(34,211,238,0.65)_1px,transparent_1px)]
          bg-size-[32px_32px]"
        />

        {/* ===== Ambient Cyan Glow ===== */}
        <div
          className="absolute -top-48 -right-48 w-[600px] h-[600px]
          bg-cyan-400/10 blur-[200px] rounded-full pointer-events-none"
        />

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
