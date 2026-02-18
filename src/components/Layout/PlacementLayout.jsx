import { Outlet } from "react-router-dom";
import PlacementSidebar from "../Sidebars/PlacementSidebar";

const PlacementLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#0b0f14] text-slate-200">

      {/* ================= SIDEBAR ================= */}
      <PlacementSidebar />

      {/* ================= MAIN WRAPPER ================= */}
      <div className="relative flex-1 flex flex-col overflow-hidden">

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
        <main className="relative z-10 flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto px-6 py-6">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default PlacementLayout;