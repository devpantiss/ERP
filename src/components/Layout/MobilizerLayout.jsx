import { Outlet } from "react-router-dom";
import MobilizerSidebar from "../Sidebars/MobilizerSidebar";
import MobileBottomDock from "../common/MobileBottomDock";
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
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
  { label: "Dashboard", shortLabel: "Home", path: "/mobilizer/dashboard", icon: LayoutDashboard },
  { label: "Community", path: "/mobilizer/community-engagement", icon: CalendarCheck2 },
  { label: "Enrollment", shortLabel: "Enroll", path: "/mobilizer/student-enrollment", icon: Users },
];

const DRAWER_ITEMS = [
  {
    label: "HR Entitlement",
    icon: Briefcase,
    children: [
      { label: "Attendance", path: "/mobilizer/hr/attendance", icon: UserCheck },
      { label: "Leave Management", path: "/mobilizer/hr/leave", icon: CalendarDays },
      { label: "Tour Application", path: "/mobilizer/hr/tour", icon: MapPinned },
      { label: "Salary", path: "/mobilizer/hr/salary", icon: IndianRupee },
      { label: "Reimbursement", path: "/mobilizer/hr/reimbursement", icon: Receipt },
    ],
  },
  { label: "Grievance Portal", path: "/mobilizer/grievance", icon: MessageSquareWarning },
  { label: "Profile", path: "/mobilizer/profile", icon: UserRoundPen },
];

const ACCENT = {
  activeBg: "bg-yellow-400/15",
  activeText: "text-yellow-400",
  dot: "bg-yellow-400",
  headerText: "text-yellow-400",
};

const MobilizerLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#030712] text-white relative">

      {/* ================= SIDEBAR ================= */}
      <MobilizerSidebar />

      {/* ================= MAIN WRAPPER ================= */}
      <div className="relative flex-1 flex flex-col overflow-hidden">

        {/* Background Ambient Mesh */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/15 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/15 blur-[120px]" />
          <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-sky-900/15 blur-[100px]" />
        </div>


        {/* ===== HIGH VISIBILITY GRID (TAILWIND ONLY) ===== */}
        <div
          className="absolute inset-0 pointer-events-none
          bg-[linear-gradient(to_right,rgba(250,204,21,0.65)_1px,transparent_1px),
              linear-gradient(to_bottom,rgba(250,204,21,0.65)_1px,transparent_1px)]
          bg-size-[32px_32px]"
        />

        {/* ===== Ambient Accent Glow ===== */}
        <div
          className="absolute -top-48 -right-48 w-[600px] h-[600px]
          bg-yellow-400/10 blur-[200px] rounded-full pointer-events-none"
        />

        {/* ================= CONTENT AREA ================= */}
        <main className="relative z-10 flex-1 pb-20 md:pb-0">
          <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
            <Outlet />
          </div>
        </main>

      </div>

      {/* ================= MOBILE DOCK ================= */}
      <MobileBottomDock
        dockItems={DOCK_ITEMS}
        drawerItems={DRAWER_ITEMS}
        accentClass={ACCENT}
        roleLabel="Mobilize Hub"
      />
    </div>
  );
};

export default MobilizerLayout;
