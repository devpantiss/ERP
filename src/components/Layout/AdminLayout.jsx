import { Outlet } from "react-router-dom";
import AdminSidebar from "../Sidebars/AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="admin-future flex min-h-screen bg-[#030712] text-white relative">

      {/* ================= SIDEBAR ================= */}
      <AdminSidebar />

      {/* ================= MAIN WRAPPER ================= */}
      <div className="relative flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* Background Ambient Mesh */}
        <div className="admin-future__backdrop absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="admin-future__grid" />
        </div>


        

        

        {/* ================= CONTENT AREA ================= */}
        <main className="admin-future__main relative z-10 flex-1 min-w-0">
          <div className="admin-future__content mx-auto w-full max-w-[1600px] min-w-0 px-6 py-6">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;
