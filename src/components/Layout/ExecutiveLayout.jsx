import { Outlet } from "react-router-dom";
import ExecutiveSidebar from "../Sidebars/ExecutiveSidebar";
import MobileBottomDock from "../common/MobileBottomDock";
import {
  LayoutDashboard,
  Globe,
  TrendingUp,
  Gem,
  Wallet,
  Boxes,
  Scale,
  ShieldAlert,
  Milestone,
  FileText,
  Activity,
  UserCheck,
  Settings,
  UserRoundPen,
} from "lucide-react";

/* ─── Custom icon re-used from sidebar ─── */
const ClipboardCheck = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="m9 14 2 2 4-4" />
  </svg>
);

/* ─── Dock config ─── */
const DOCK_ITEMS = [
  { label: "Console", path: "/executive", icon: LayoutDashboard },
  { label: "Operations", path: "/executive/operations", icon: Globe },
  { label: "Performance", shortLabel: "ROI", path: "/executive/performance", icon: TrendingUp },
];

const DRAWER_ITEMS = [
  {
    label: "Grants & Financials",
    icon: Wallet,
    children: [
      { label: "Grant Management", path: "/executive/grants", icon: Gem },
      { label: "Expenditure Tracking", path: "/executive/expenditure", icon: Wallet },
      { label: "Funding Pipeline", path: "/executive/funding", icon: Boxes },
    ],
  },
  {
    label: "Compliance & Audit",
    icon: Scale,
    children: [
      { label: "ISO/NSDC Standards", path: "/executive/compliance", icon: Scale },
      { label: "Periodic Audits", path: "/executive/audits", icon: ClipboardCheck },
      { label: "Risk Management", path: "/executive/risk", icon: ShieldAlert },
    ],
  },
  {
    label: "Strategic Roadmap",
    icon: Milestone,
    children: [
      { label: "Expansion Goals", path: "/executive/roadmap", icon: Milestone },
      { label: "Strategic Planning", path: "/executive/strategy", icon: FileText },
      { label: "Forecasting", path: "/executive/forecast", icon: Activity },
    ],
  },
  {
    label: "Access Control",
    icon: UserCheck,
    children: [
      { label: "Credentials Manager", path: "/executive/credentials", icon: UserCheck },
      { label: "Role Authority", path: "/executive/roles", icon: ShieldAlert },
    ],
  },
  { label: "Platform Settings", path: "/executive/settings", icon: Settings },
  { label: "Executive Profile", path: "/executive/profile", icon: UserRoundPen },
];

const ACCENT = {
  activeBg: "bg-amber-500/10",
  activeText: "text-amber-500",
  dot: "bg-amber-500",
  headerText: "text-amber-500",
};

const ExecutiveLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#030712] text-white relative">

      {/* ================= SIDEBAR ================= */}
      <ExecutiveSidebar />

      {/* ================= MAIN WRAPPER ================= */}
      <div className="relative flex-1 flex flex-col">

        {/* Background Ambient Mesh */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/15 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/15 blur-[120px]" />
          <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-sky-900/15 blur-[100px]" />
        </div>


        {/* ===== PREMIUM AMBER GRID BACKGROUND ===== */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20
          bg-[linear-gradient(to_right,rgba(245,158,11,0.1)_1px,transparent_1px),
              linear-gradient(to_bottom,rgba(245,158,11,0.1)_1px,transparent_1px)]
          bg-size-[40px_40px]"
        />

        {/* ===== Enterprise Ambient Glows ===== */}
        <div
          className="absolute -top-64 -right-64 w-[800px] h-[800px]
          bg-amber-600/10 blur-[240px] rounded-full pointer-events-none animate-pulse"
        />
        <div
          className="absolute -bottom-64 -left-64 w-[600px] h-[600px]
          bg-blue-600/5 blur-[200px] rounded-full pointer-events-none"
        />

        {/* ================= CONTENT AREA ================= */}
        <main className="relative z-10 flex-1 pb-20 md:pb-0">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 transition-all duration-300">
            <Outlet />
          </div>
        </main>

      </div>

      {/* ================= MOBILE DOCK ================= */}
      <MobileBottomDock
        dockItems={DOCK_ITEMS}
        drawerItems={DRAWER_ITEMS}
        accentClass={ACCENT}
        roleLabel="Executive Console"
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

export default ExecutiveLayout;
