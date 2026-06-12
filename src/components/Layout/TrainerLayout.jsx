import { Outlet } from "react-router-dom";
import TrainerSidebar from "../Sidebars/TrainerSidebar";
import MobileBottomDock from "../common/MobileBottomDock";
import {
  LayoutDashboard,
  GraduationCap,
  MapPin,
  CalendarDays,
  Briefcase,
  IndianRupee,
  Receipt,
  MessageSquareWarning,
  UserRoundPen,
  Quote,
} from "lucide-react";

/* ─── Dock config ─── */
const DOCK_ITEMS = [
  { label: "Dashboard", shortLabel: "Home", path: "/trainer/dashboard", icon: LayoutDashboard },
  { label: "Teaching", path: "/trainer/teaching-management", icon: GraduationCap },
  { label: "Visits", path: "/trainer/exposure-visits", icon: MapPin },
];

const DRAWER_ITEMS = [
  { label: "Testimonials", path: "/trainer/testimonials", icon: Quote },
  {
    label: "HR Entitlement",
    icon: Briefcase,
    children: [
      { label: "Leave Management", path: "/trainer/hr/leave", icon: CalendarDays },
      { label: "Salary", path: "/trainer/hr/salary", icon: IndianRupee },
      { label: "Reimbursement", path: "/trainer/hr/reimbursement", icon: Receipt },
    ],
  },
  { label: "Grievance Portal", path: "/trainer/grievance", icon: MessageSquareWarning },
  { label: "Profile", path: "/trainer/profile", icon: UserRoundPen },
];

const ACCENT = {
  activeBg: "bg-emerald-500/10",
  activeText: "text-emerald-400",
  dot: "bg-emerald-400",
  headerText: "text-emerald-400",
};

const TrainerLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#030712] text-white relative">

      {/* ================= SIDEBAR ================= */}
      <TrainerSidebar />

      {/* ================= MAIN WRAPPER ================= */}
      <div className="relative flex-1 min-w-0 flex flex-col overflow-hidden">

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
        roleLabel="Teach Hub"
      />
    </div>
  );
};

export default TrainerLayout;
