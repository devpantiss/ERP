import { useMemo, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  PlayCircle,
  UserRound,
} from "lucide-react";
import MobileBottomDock from "../common/MobileBottomDock";
import { getStoredClient } from "../../pages/Client/clientPortalData";

const NAV_ITEMS = [
  { label: "Dashboard", shortLabel: "Home", path: "/client/dashboard", icon: LayoutDashboard },
  { label: "Projects", path: "/client/projects", icon: FolderKanban },
  { label: "Reports", path: "/client/reports", icon: FileText },
  { label: "Success Story", shortLabel: "Story", path: "/client/success-story", icon: PlayCircle },
];

const ACCENT = {
  activeBg: "bg-violet-500/10",
  activeText: "text-violet-300",
  dot: "bg-violet-300",
  headerText: "text-violet-300",
};

export default function ClientLayout() {
  const navigate = useNavigate();
  const client = useMemo(() => getStoredClient(), []);
  const [collapsed, setCollapsed] = useState(true);

  const logout = () => {
    localStorage.removeItem("clientSession");
    navigate("/client-login");
  };

  return (
    <div className="client-portal flex min-h-screen bg-[#05020a] text-white">
      <aside
        data-collapsed={collapsed}
        className="perf-sidebar sticky top-0 hidden h-screen flex-col border-r border-violet-200/10 bg-[#10061d]/95 md:flex [--sidebar-expanded-width:18rem]"
      >
        <div className="flex h-16 items-center justify-between gap-3 border-b border-violet-200/10 px-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-500/15">
            <Building2 size={20} className="shrink-0 text-violet-200" />
          </div>
            <div className="perf-sidebar-label min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">Client Portal</p>
              <p className="truncate text-xs text-white/40">{client.name}</p>
            </div>
          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            className="rounded-xl p-2 text-white/55 transition hover:bg-white/[0.06] hover:text-white"
            aria-label={collapsed ? "Expand client sidebar" : "Collapse client sidebar"}
          >
            {collapsed ? <ChevronRight size={17} className="shrink-0" /> : <ChevronLeft size={17} className="shrink-0" />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-violet-500/15 text-violet-200"
                      : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                  }`
                }
              >
                <Icon size={18} className="h-[18px] w-[18px] shrink-0" />
                <span className="perf-sidebar-label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-violet-200/10 p-4">
            <div className="perf-sidebar-label mb-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <UserRound size={18} className="mb-2 text-violet-300" />
            <p className="text-sm font-semibold text-white">{client.contact}</p>
            <p className="text-xs text-white/40">{client.designation}</p>
            </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-red-300 transition hover:bg-red-500/10"
          >
            <LogOut size={17} className="h-[17px] w-[17px] shrink-0" />
            <span className="perf-sidebar-label">Log Out</span>
          </button>
            <Link to="/" className="perf-sidebar-label mt-2 block px-4 text-xs text-white/35 hover:text-white/60">
            Back to website
            </Link>
        </div>
      </aside>

      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-56 left-1/3 h-[520px] w-[520px] rounded-full bg-violet-600/20 blur-[160px]" />
          <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-fuchsia-500/10 blur-[150px]" />
          <div className="absolute inset-0 opacity-[0.16] bg-[linear-gradient(to_right,rgba(196,181,253,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(196,181,253,0.18)_1px,transparent_1px)] bg-size-[48px_48px]" />
        </div>

        <main className="relative z-10 pb-24 md:pb-0">
          <div className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileBottomDock
        dockItems={NAV_ITEMS}
        drawerItems={[
          {
            label: "Account",
            icon: UserRound,
            children: [{ label: "Client Login", path: "/client-login", icon: LogOut }],
          },
        ]}
        accentClass={ACCENT}
        roleLabel={`${client.name} Portal`}
      />
    </div>
  );
}
