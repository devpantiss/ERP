import { useState, memo } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  ShieldAlert,
  LayoutDashboard,
  Gem,
  Scale,
  Milestone,
  Users,
  Building2,
  FolderKanban,
  Settings,
  UserRoundPen,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Wallet,
  Globe,
  Activity,
  UserCheck,
  FileText,
  TrendingUp,
  Boxes
} from "lucide-react";

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

/* ================= MENU CONFIG ================= */

const SECTIONS = [
  {
    key: "intelligence",
    title: "Executive Intelligence",
    icon: LayoutDashboard,
    items: [
      { label: "Executive Console", path: "/executive", icon: LayoutDashboard },
      { label: "Global Operations", path: "/executive/operations", icon: Globe },
      { label: "Performance ROI", path: "/executive/performance", icon: TrendingUp },
    ],
  },
  {
    key: "financials",
    title: "Grants & Financials",
    icon: Wallet,
    items: [
      { label: "Grant Management", path: "/executive/grants", icon: Gem },
      { label: "Expenditure Tracking", path: "/executive/expenditure", icon: Wallet },
      { label: "Funding Pipeline", path: "/executive/funding", icon: Boxes },
    ],
  },
  {
    key: "governance",
    title: "Compliance & Audit",
    icon: Scale,
    items: [
      { label: "ISO/NSDC Standards", path: "/executive/compliance", icon: Scale },
      { label: "Periodic Audits", path: "/executive/audits", icon: ClipboardCheck },
      { label: "Risk Management", path: "/executive/risk", icon: ShieldAlert },
    ],
  },
  {
    key: "strategy",
    title: "Strategic Roadmap",
    icon: Milestone,
    items: [
      { label: "Expansion Goals", path: "/executive/roadmap", icon: Milestone },
      { label: "Strategic Planning", path: "/executive/strategy", icon: FileText },
      { label: "Forecasting", path: "/executive/forecast", icon: Activity },
    ],
  },
  {
    key: "access",
    title: "Access Control",
    icon: UserCheck,
    items: [
      { label: "Credentials Manager", path: "/executive/credentials", icon: UserCheck },
      { label: "Role Authority", path: "/executive/roles", icon: ShieldAlert },
    ],
  },
  {
    key: "account",
    title: "Master Settings",
    icon: Settings,
    items: [
      { label: "Platform Settings", path: "/executive/settings", icon: Settings },
      { label: "Executive Profile", path: "/executive/profile", icon: UserRoundPen },
    ],
  },
];


/* ================= COMPONENT ================= */

const ExecutiveSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState(["intelligence"]);

  const toggleSection = (key) => {
    setOpenSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col
      bg-[#0f172a] text-white/80
      border-r border-slate-700/50
      transition-all duration-300 z-50
      ${collapsed ? "w-20" : "w-64"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-700/50">
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-amber-500 flex items-center gap-2">
            <Gem size={20} className="text-amber-500" />
            Executive Console
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md text-white/60 hover:text-white hover:bg-slate-700 transition"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
        {SECTIONS.map((section) => {
          const isOpen = openSections.includes(section.key);
          const SectionIcon = section.icon;

          return (
            <div key={section.key}>
              <button
                onClick={() => {
                  if (collapsed) {
                    setCollapsed(false);
                    if (!isOpen) toggleSection(section.key);
                  } else {
                    toggleSection(section.key);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-semibold transition-all duration-200 cursor-pointer
                ${
                  isOpen
                    ? "bg-amber-500/10 text-amber-500"
                    : "text-white/60 hover:bg-transparent hover:text-white"
                }`}
              >
                <SectionIcon size={16} className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{section.title}</span>
                    <ChevronDown
                      size={14}
                      className={`shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </button>

              {!collapsed && (
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="ml-3 pl-3 border-l border-slate-700/50 space-y-1">
                    {section.items.map(({ label, path, icon: Icon }) => (
                      <NavLink
                        key={path}
                        to={path}
                        end={path === "/executive"}
                        className={({ isActive }) =>
                          `relative w-full flex items-center gap-3 px-3 py-2 rounded-lg
                          text-sm font-medium transition-all duration-200
                          ${
                            isActive
                              ? "bg-amber-500/10 text-amber-500 font-bold"
                              : "text-white/60 hover:bg-transparent hover:text-white"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <span className="absolute left-0 top-0 h-full w-0.5 bg-amber-500 rounded-r-md" />
                            )}
                            <Icon size={14} className="shrink-0" />
                            <span className="truncate">{label}</span>
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-700 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg
          text-sm text-red-500 hover:bg-red-500/10
          hover:text-red-400 transition"
        >
          <LogOut size={18} />
          {!collapsed && <span>Exit to Portal</span>}
        </Link>
        {!collapsed && (
          <div className="px-3 text-[10px] text-slate-500">
            <p className="font-bold text-amber-600/80 uppercase">Enterprise Standard</p>
            <p>Master Console v2.0-Alpha</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default memo(ExecutiveSidebar);
