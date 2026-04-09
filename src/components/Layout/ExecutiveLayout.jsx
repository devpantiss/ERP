import { Outlet } from "react-router-dom";
import ExecutiveSidebar from "../Sidebars/ExecutiveSidebar";

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
        <main className="relative z-10 flex-1">
          <div className="max-w-[1600px] mx-auto px-8 py-8 transition-all duration-300">
            <Outlet />
          </div>
        </main>

      </div>

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
