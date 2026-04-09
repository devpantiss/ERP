import Pagination from "../../components/common/Pagination";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Eye, TrendingUp, MapPin, BarChart3, UserCheck } from "lucide-react";

/* ===================== MOCK DATA ===================== */

const MOBILIZERS = [
  { id: 1, name: "Priya Mishra", center: "Jajpur", status: "Active", avatar: "https://i.pravatar.cc/40?img=5", candidatesMobilized: 85, eventsCompleted: 12, attendanceRate: 94, phone: "+91 9876543211", email: "priya@example.com" },
  { id: 2, name: "Vikram Singh", center: "Keonjhar", status: "Active", avatar: "https://i.pravatar.cc/40?img=11", candidatesMobilized: 72, eventsCompleted: 9, attendanceRate: 88, phone: "+91 9876543214", email: "vikram@example.com" },
  { id: 3, name: "Kavita Behera", center: "Jajpur", status: "Inactive", avatar: "https://i.pravatar.cc/40?img=20", candidatesMobilized: 45, eventsCompleted: 6, attendanceRate: 72, phone: "+91 9876543217", email: "kavita@example.com" },
  { id: 4, name: "Rajan Nayak", center: "Angul", status: "Active", avatar: "https://i.pravatar.cc/40?img=33", candidatesMobilized: 96, eventsCompleted: 15, attendanceRate: 97, phone: "+91 9876543220", email: "rajan@example.com" },
  { id: 5, name: "Sunita Patra", center: "Kalahandi", status: "Active", avatar: "https://i.pravatar.cc/40?img=23", candidatesMobilized: 63, eventsCompleted: 8, attendanceRate: 91, phone: "+91 9876543221", email: "sunita@example.com" },
  { id: 6, name: "Manoj Sahu", center: "Sundargarh", status: "Active", avatar: "https://i.pravatar.cc/40?img=14", candidatesMobilized: 78, eventsCompleted: 11, attendanceRate: 89, phone: "+91 9876543222", email: "manoj@example.com" },
];

export default function AdminMobilizerList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [centerFilter, setCenterFilter] = useState("All");

  const centers = ["All", ...new Set(MOBILIZERS.map((m) => m.center))];

  const filtered = useMemo(() => {
    return MOBILIZERS.filter((m) => {
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
      const matchCenter = centerFilter === "All" || m.center === centerFilter;
      return matchSearch && matchCenter;
    });
  }, [search, centerFilter]);

  const totalMobilized = MOBILIZERS.reduce((s, m) => s + m.candidatesMobilized, 0);
  const totalEvents = MOBILIZERS.reduce((s, m) => s + m.eventsCompleted, 0);
  const avgAttendance = Math.round(MOBILIZERS.reduce((s, m) => s + m.attendanceRate, 0) / MOBILIZERS.length);

  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered?.slice(start, start + itemsPerPage) || [];
  }, [filtered, currentPage]);
  const totalPages = Math.ceil((filtered?.length || 0) / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Mobilizer Management</h1>
          <p className="text-sm text-white/60 mt-1">View and monitor all mobilizers under your center</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Mobilizers", value: MOBILIZERS.length, icon: Users },
          { label: "Candidates Mobilized", value: totalMobilized, icon: UserCheck },
          { label: "Events Completed", value: totalEvents, icon: BarChart3 },
          { label: "Avg. Attendance", value: `${avgAttendance}%`, icon: TrendingUp },
        ].map((s) => (
          <div key={s.label} className="bg-[#111827] border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={14} className="text-violet-400" />
              <span className="text-xs text-white/60">{s.label}</span>
            </div>
            <p className="text-xl font-semibold text-slate-100">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <input placeholder="Search mobilizer..." value={search} onChange={(e) => setSearch(e.target.value)}
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

      {/* Table */}
      <div className="bg-[#111827] border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0b1220] text-white/60">
            <tr>
              <th className="p-4 text-left">Mobilizer</th>
              <th className="p-4 text-left">Center</th>
              <th className="p-4 text-center">Candidates Mobilized</th>
              <th className="p-4 text-center">Events</th>
              <th className="p-4 text-center">Attendance</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((m) => (
              <tr key={m.id} className="border-t border-slate-700/50 hover:bg-transparent/30 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={m.avatar} className="w-9 h-9 rounded-lg border border-slate-700" />
                    <div>
                      <p className="font-medium text-white/90">{m.name}</p>
                      <p className="text-xs text-slate-500">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-white/60 flex items-center gap-1"><MapPin size={12} />{m.center}</td>
                <td className="p-4 text-center text-violet-400 font-semibold">{m.candidatesMobilized}</td>
                <td className="p-4 text-center text-white/80">{m.eventsCompleted}</td>
                <td className="p-4 text-center">
                  <span className={`text-sm font-medium ${m.attendanceRate >= 90 ? "text-emerald-400" : m.attendanceRate >= 80 ? "text-yellow-400" : "text-red-400"}`}>
                    {m.attendanceRate}%
                  </span>
                </td>
                <td className="p-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${m.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-white/60"}`}>
                    {m.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => navigate(`/admin/mobilizer-dashboard/${m.id}`)}
                    className="flex items-center gap-1.5 mx-auto px-3 py-1.5 text-xs rounded-lg bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition">
                    <Eye size={13} /> View Dashboard
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
