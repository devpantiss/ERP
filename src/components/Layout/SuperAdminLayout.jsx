import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "../Sidebars/SuperAdminSidebar";

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
        className="relative z-10 h-screen min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-5 md:p-8"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#1e293b transparent",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default SuperAdminLayout;
