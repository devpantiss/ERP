import Pagination from "../../components/common/Pagination";
import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, BookOpen, Users, TrendingUp, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const TRAINER_DATA = {
  1: { name: "Aditya Sahu", center: "Angul", avatar: "https://i.pravatar.cc/80?img=12" },
  2: { name: "Sneha Das", center: "Jharsuguda", avatar: "https://i.pravatar.cc/80?img=9" },
  3: { name: "Deepak Kumar", center: "Sundargarh", avatar: "https://i.pravatar.cc/80?img=14" },
  4: { name: "Suresh Naik", center: "Kalahandi", avatar: "https://i.pravatar.cc/80?img=15" },
  5: { name: "Rahul Sharma", center: "Angul", avatar: "https://i.pravatar.cc/80?img=8" },
  6: { name: "Amit Panda", center: "Keonjhar", avatar: "https://i.pravatar.cc/80?img=18" },
};

const MODULE_DATA = [
  { batch: "BATCH-101", completed: 32, total: 45 },
  { batch: "BATCH-102", completed: 28, total: 45 },
  { batch: "BATCH-103", completed: 18, total: 45 },
];

const SESSION_SPLIT = [
  { name: "Theory", value: 55, color: "#8b5cf6" },
  { name: "Lab", value: 45, color: "#22d3ee" },
];

const WEEKLY = [
  { day: "Mon", modules: 3 }, { day: "Tue", modules: 4 }, { day: "Wed", modules: 2 },
  { day: "Thu", modules: 5 }, { day: "Fri", modules: 3 }, { day: "Sat", modules: 1 },
];

const ATTENDANCE = [
  { date: "05 Mar", s1: "P", s2: "P", s3: "P" },
  { date: "04 Mar", s1: "P", s2: "P", s3: "A" },
  { date: "03 Mar", s1: "P", s2: "P", s3: "P" },
  { date: "02 Mar", s1: "A", s2: "P", s3: "P" },
  { date: "01 Mar", s1: "P", s2: "P", s3: "P" },
];

const tooltipStyle = {  border: "1px solid #334155", borderRadius: "8px", color: "#e2e8f0" };

export default function AdminTrainerDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const trainer = TRAINER_DATA[id] || TRAINER_DATA[1];
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return ATTENDANCE.slice(start, start + itemsPerPage);
  }, [currentPage]);
  const totalPages = Math.ceil(ATTENDANCE.length / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/admin/trainer-list")} className="p-2 rounded-lg bg-transparent hover:bg-slate-700 transition">
          <ArrowLeft size={18} className="text-white/80" />
        </button>
        <div className="flex items-center gap-4">
          <img src={trainer.avatar} className="w-14 h-14 rounded-xl border border-slate-700" />
          <div>
            <h1 className="text-xl font-semibold text-slate-100">{trainer.name}</h1>
            <p className="text-sm text-white/60 flex items-center gap-1"><MapPin size={12} /> {trainer.center} Center</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Batches Assigned", value: "3", icon: Users, color: "text-violet-400" },
          { label: "Modules Completed", value: "78/135", icon: BookOpen, color: "text-emerald-400" },
          { label: "Attendance Rate", value: "96%", icon: TrendingUp, color: "text-cyan-400" },
          { label: "Exposure Visits", value: "5", icon: CheckCircle2, color: "text-yellow-400" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#111827] border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1"><kpi.icon size={14} className={kpi.color} /><span className="text-xs text-white/60">{kpi.label}</span></div>
            <p className="text-2xl font-semibold text-slate-100">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Batch Progress */}
      <div className="bg-[#111827] border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-medium text-violet-400 mb-4">Batch-wise Module Progress</h3>
        <div className="space-y-4">
          {MODULE_DATA.map((b) => {
            const pct = Math.round((b.completed / b.total) * 100);

            return (
              <div key={b.batch}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/80">{b.batch}</span>
                  <span className="text-white/60">{b.completed}/{b.total} ({pct}%)</span>
                </div>
                <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#111827] border border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-medium text-violet-400 mb-4">Weekly Module Activity</h3>
          <div className="h-48">
            <ResponsiveContainer>
              <BarChart data={WEEKLY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="modules" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-[#111827] border border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-medium text-violet-400 mb-4">Session Type Split</h3>
          <div className="h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={SESSION_SPLIT} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3} strokeWidth={0}>
                  {SESSION_SPLIT.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {SESSION_SPLIT.map((e) => (
              <div key={e.name} className="flex items-center gap-1.5 text-xs text-white/60">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: e.color }} />{e.name}: {e.value}%
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance */}
      <div className="bg-[#111827] border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-medium text-violet-400 mb-4">Attendance Record</h3>
        <table className="w-full text-sm">
          <thead className="text-white/60 text-xs">
            <tr><th className="p-3 text-left">Date</th><th className="p-3 text-center">Session 1</th><th className="p-3 text-center">Session 2</th><th className="p-3 text-center">Session 3</th></tr>
          </thead>
          <tbody>
            {paginatedData.map((a, i) => (
              <tr key={i} className="border-t border-slate-700/50">
                <td className="p-3 text-white/80">{a.date}</td>
                {["s1", "s2", "s3"].map((s) => (
                  <td key={s} className="p-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${a[s] === "P" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
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
