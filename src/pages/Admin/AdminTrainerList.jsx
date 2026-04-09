import Pagination from "../../components/common/Pagination";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Users, TrendingUp, BookOpen, MapPin } from "lucide-react";

const TRAINERS = [
  { id: 1, name: "Aditya Sahu", center: "Angul", status: "Active", avatar: "https://i.pravatar.cc/40?img=12", modulesCompleted: 32, totalModules: 45, batches: 3, attendanceRate: 96, phone: "+91 9876543210", email: "aditya@example.com" },
  { id: 2, name: "Sneha Das", center: "Jharsuguda", status: "Inactive", avatar: "https://i.pravatar.cc/40?img=9", modulesCompleted: 18, totalModules: 45, batches: 2, attendanceRate: 72, phone: "+91 9876543213", email: "sneha@example.com" },
  { id: 3, name: "Deepak Kumar", center: "Sundargarh", status: "Active", avatar: "https://i.pravatar.cc/40?img=14", modulesCompleted: 40, totalModules: 45, batches: 4, attendanceRate: 94, phone: "+91 9876543216", email: "deepak@example.com" },
  { id: 4, name: "Suresh Naik", center: "Kalahandi", status: "Active", avatar: "https://i.pravatar.cc/40?img=15", modulesCompleted: 28, totalModules: 45, batches: 3, attendanceRate: 91, phone: "+91 9876543218", email: "suresh@example.com" },
  { id: 5, name: "Rahul Sharma", center: "Angul", status: "Active", avatar: "https://i.pravatar.cc/40?img=8", modulesCompleted: 38, totalModules: 45, batches: 3, attendanceRate: 98, phone: "+91 9876543223", email: "rahul.s@example.com" },
  { id: 6, name: "Amit Panda", center: "Keonjhar", status: "Active", avatar: "https://i.pravatar.cc/40?img=18", modulesCompleted: 22, totalModules: 45, batches: 2, attendanceRate: 87, phone: "+91 9876543224", email: "amit@example.com" },
];

export default function AdminTrainerList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [centerFilter, setCenterFilter] = useState("All");

  const centers = ["All", ...new Set(TRAINERS.map((t) => t.center))];

  const filtered = useMemo(() => {
    return TRAINERS.filter((t) => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
      const matchCenter = centerFilter === "All" || t.center === centerFilter;
      return matchSearch && matchCenter;
    });
  }, [search, centerFilter]);

  const avgProgress = Math.round(TRAINERS.reduce((s, t) => s + (t.modulesCompleted / t.totalModules) * 100, 0) / TRAINERS.length);
  const totalBatches = TRAINERS.reduce((s, t) => s + t.batches, 0);

  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered?.slice(start, start + itemsPerPage) || [];
  }, [filtered, currentPage]);
  const totalPages = Math.ceil((filtered?.length || 0) / itemsPerPage);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Trainer Management</h1>
        <p className="text-sm text-white/60 mt-1">Monitor trainers, their batches and module progress</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Trainers", value: TRAINERS.length, icon: Users },
          { label: "Total Batches", value: totalBatches, icon: BookOpen },
          { label: "Avg. Module Progress", value: `${avgProgress}%`, icon: TrendingUp },
          { label: "Active", value: TRAINERS.filter((t) => t.status === "Active").length, icon: Users },
        ].map((s) => (
          <div key={s.label} className="bg-[#111827] border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1"><s.icon size={14} className="text-violet-400" /><span className="text-xs text-white/60">{s.label}</span></div>
            <p className="text-xl font-semibold text-slate-100">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <input placeholder="Search trainer..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 rounded-lg bg-[#111827] border border-slate-700 text-sm text-white/90 focus:border-violet-400 outline-none" />
        <div className="flex gap-2">
          {centers.map((c) => (
            <button key={c} onClick={() => setCenterFilter(c)}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${centerFilter === c ? "bg-violet-500 text-white" : "bg-[#111827] text-white/60 border border-slate-700 hover:border-violet-500/30"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111827] border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0b1220] text-white/60">
            <tr>
              <th className="p-4 text-left">Trainer</th>
              <th className="p-4 text-left">Center</th>
              <th className="p-4 text-center">Batches</th>
              <th className="p-4 text-center">Module Progress</th>
              <th className="p-4 text-center">Attendance</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((t) => {
              const progress = Math.round((t.modulesCompleted / t.totalModules) * 100);
              return (
                <tr key={t.id} className="border-t border-slate-700/50 hover:bg-transparent/30 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={t.avatar} className="w-9 h-9 rounded-lg border border-slate-700" />
                      <div><p className="font-medium text-white/90">{t.name}</p><p className="text-xs text-slate-500">{t.email}</p></div>
                    </div>
                  </td>
                  <td className="p-4 text-white/60 flex items-center gap-1"><MapPin size={12} />{t.center}</td>
                  <td className="p-4 text-center text-white/80">{t.batches}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-20 h-2 bg-slate-700 rounded-full"><div className="h-full bg-violet-500 rounded-full" style={{ width: `${progress}%` }} /></div>
                      <span className="text-xs text-white/60">{progress}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-sm font-medium ${t.attendanceRate >= 90 ? "text-emerald-400" : t.attendanceRate >= 80 ? "text-yellow-400" : "text-red-400"}`}>
                      {t.attendanceRate}%
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${t.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-white/60"}`}>{t.status}</span>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => navigate(`/admin/trainer-dashboard/${t.id}`)}
                      className="flex items-center gap-1.5 mx-auto px-3 py-1.5 text-xs rounded-lg bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition">
                      <Eye size={13} /> View Dashboard
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
