import Pagination from "../../components/common/Pagination";
import ExportPDFButton from "../../components/common/ExportPDFButton";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Eye, TrendingUp, MapPin, BarChart3, UserCheck } from "lucide-react";
import { useEmployeeStore } from "../../stores/employeeStore.js";
import { selectEmployeesByRole } from "../../stores/selectors/employeeSelectors.js";

export default function AdminMobilizerList() {
  const navigate = useNavigate();
  const { records, fetchWithAssignments } = useEmployeeStore();
  const [search, setSearch] = useState("");
  const [centerFilter, setCenterFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchWithAssignments();
  }, [fetchWithAssignments]);

  const mobilizers = useMemo(() => selectEmployeesByRole("Mobilizer", records), [records]);
  const centers = useMemo(() => ["All", ...new Set(mobilizers.map((m) => m.center))], [mobilizers]);
  const statuses = useMemo(() => ["All", ...new Set(mobilizers.map((m) => m.status))], [mobilizers]);

  const filtered = useMemo(() => {
    return mobilizers.filter((m) => {
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
      const matchCenter = centerFilter === "All" || m.center === centerFilter;
      const matchStatus = statusFilter === "All" || m.status === statusFilter;
      return matchSearch && matchCenter && matchStatus;
    });
  }, [mobilizers, search, centerFilter, statusFilter]);

  const totalMobilized = mobilizers.reduce((s, m) => s + m.candidatesMobilized, 0);
  const totalEvents = mobilizers.reduce((s, m) => s + m.eventsCompleted, 0);
  const avgAttendance = mobilizers.length
    ? Math.round(mobilizers.reduce((s, m) => s + m.attendanceRate, 0) / mobilizers.length)
    : 0;

  
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
        <ExportPDFButton
          title="Mobilizer List"
          columns={["Name","Center","Candidates Mobilized","Events","Attendance","Status"]}
          data={filtered.map(m=>[m.name,m.center,m.candidatesMobilized,m.eventsCompleted,`${m.attendanceRate}%`,m.status])}
          fileName="mobilizer_list"
          accent="violet"
        />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Mobilizers", value: mobilizers.length, icon: Users },
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
        <input placeholder="Search mobilizer..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="flex-1 min-w-[200px] px-4 py-2 rounded-lg bg-[#111827] border border-slate-700 text-sm text-white/90 focus:border-violet-400 outline-none" />
        <div className="flex gap-2">
          {centers.map((c) => (
            <button key={c} onClick={() => { setCenterFilter(c); setCurrentPage(1); }}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${centerFilter === c ? "bg-violet-500 text-white" : "bg-[#111827] text-white/60 border border-slate-700 hover:border-violet-500/30"}`}>
              {c}
            </button>
          ))}
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 rounded-lg bg-[#111827] border border-slate-700 text-sm text-white/90">
          {statuses.map((status) => (
            <option key={status} value={status}>{status === "All" ? "All Status" : status}</option>
          ))}
        </select>
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
