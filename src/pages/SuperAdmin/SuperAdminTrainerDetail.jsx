import Pagination from "../../components/common/Pagination";
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, BookOpen, Users, TrendingUp, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useEmployeeStore } from "../../stores/employeeStore";
import { selectTrainerDetail } from "../../stores/selectors/superAdminSelectors";

const tooltipStyle = {  border: "1px solid #334155", borderRadius: "12px" };

export default function SuperAdminTrainerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { records: employees, fetchWithAssignments } = useEmployeeStore();
  useEffect(() => {
    fetchWithAssignments();
  }, [fetchWithAssignments]);
  const { employee: trainer, kpi, attendanceRows } = useMemo(() => selectTrainerDetail(id, employees), [employees, id]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return attendanceRows.slice(start, start + itemsPerPage);
  }, [attendanceRows, currentPage]);
  const totalPages = Math.ceil(attendanceRows.length / itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/super-admin/training-monitor")} className="p-2.5 rounded-xl bg-transparent hover:bg-slate-700 transition border border-slate-700">
          <ArrowLeft size={18} className="text-white/80" />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-lg font-black text-red-400">
            {trainer.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-100">{trainer.name}</h1>
            <p className="text-sm text-white/60 flex items-center gap-1 font-bold">
              <MapPin size={12} /> {trainer.center} Center • <span className="text-red-500/80 font-mono text-xs">{trainer.id}</span>
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Batches Assigned", value: kpi.batchCount.toString(), icon: Users, color: "text-red-400" },
          { label: "Modules Completed", value: `${kpi.modulesCompleted}/${kpi.totalModules}`, icon: BookOpen, color: "text-emerald-400" },
          { label: "Attendance Rate", value: kpi.attendance, icon: TrendingUp, color: "text-cyan-400" },
          { label: "Exposure Visits", value: kpi.exposureVisits.toString(), icon: CheckCircle2, color: "text-amber-400" },
        ].map((k) => (
          <div key={k.label} className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <k.icon size={14} className={k.color} />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">{k.label}</span>
            </div>
            <p className="text-2xl font-black text-slate-100">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Batch Progress */}
      <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-sm font-black text-red-400 uppercase tracking-widest mb-5">Batch-wise Module Progress</h3>
        <div className="space-y-4">
          {kpi.batches.map((b) => {
            const pct = Math.round((b.completed / b.total) * 100);

            return (
              <div key={b.batch}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-white/80 font-bold text-xs">{b.batch}</span>
                  <span className="text-slate-500 text-xs font-bold">{b.completed}/{b.total} ({pct}%)</span>
                </div>
                <div className="w-full h-3 bg-transparent rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Chart */}
        <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-sm font-black text-red-400 uppercase tracking-widest mb-4">Weekly Module Activity</h3>
          <div className="h-48">
            <ResponsiveContainer>
              <BarChart data={kpi.weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" stroke="#475569" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="modules" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Session Split Pie */}
        <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-sm font-black text-red-400 uppercase tracking-widest mb-4">Session Type Split</h3>
          <div className="h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={kpi.sessionSplit} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3} strokeWidth={0}>
                  {kpi.sessionSplit.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {kpi.sessionSplit.map((e) => (
              <div key={e.name} className="flex items-center gap-1.5 text-[10px] text-white/60 font-bold">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: e.color }} />{e.name}: {e.value}%
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance */}
      <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-sm font-black text-red-400 uppercase tracking-widest mb-4">Attendance Record</h3>
        <table className="w-full text-sm">
          <thead className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">
            <tr><th className="p-3 text-left">Date</th><th className="p-3 text-center">Session 1</th><th className="p-3 text-center">Session 2</th><th className="p-3 text-center">Session 3</th></tr>
          </thead>
          <tbody>
            {paginatedData.map((a, i) => (
              <tr key={i} className="border-t border-white/[0.08]">
                <td className="p-3 text-white/80 text-xs font-bold">{a.date}</td>
                {["s1", "s2", "s3"].map((s) => (
                  <td key={s} className="p-3 text-center">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${a[s] === "P" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                      {a[s] === "P" ? "Present" : "Absent"}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
