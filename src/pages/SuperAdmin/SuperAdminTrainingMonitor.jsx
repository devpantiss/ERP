import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Building2, Users, ExternalLink, TrendingUp
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ALL_USERS } from "./SuperAdminUserManagement";

const TRAINERS = ALL_USERS.filter(u => u.role === "Trainer");

const TRAINER_DETAILS = {
  "PSU-TRN-001": { batchesAssigned: 4, modulesCompleted: 78, totalModules: 135, attendanceRate: "96%" },
  "PSU-TRN-002": { batchesAssigned: 3, modulesCompleted: 62, totalModules: 105, attendanceRate: "93%" },
  "PSU-TRN-003": { batchesAssigned: 2, modulesCompleted: 45, totalModules: 70, attendanceRate: "97%" },
  "PSU-TRN-004": { batchesAssigned: 2, modulesCompleted: 38, totalModules: 70, attendanceRate: "71%" },
};

const tooltipStyle = {  border: "1px solid #334155", borderRadius: "12px" };

const STATS = [
  { label: "Training Centers", value: "5", color: "text-blue-500" },
  { label: "Active Trainers", value: TRAINERS.length.toString(), color: "text-emerald-500" },
  { label: "Avg Completion", value: "72%", color: "text-red-500" },
  { label: "Modules Delivered", value: "223", color: "text-violet-500" },
];

const CENTER_COMPLETION = [
  { center: "Angul", completion: 78 },
  { center: "Sundargarh", completion: 82 },
  { center: "Keonjhar", completion: 68 },
  { center: "Jharsuguda", completion: 59 },
  { center: "Kalahandi", completion: 74 },
];

export default function SuperAdminTrainingMonitor() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3 tracking-tighter">
          <BookOpen size={28} className="text-red-500" /> Training Monitor
        </h1>
        <p className="text-sm text-white/60 mt-1 uppercase tracking-widest font-bold">Module progress & trainer performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map(s => (
          <div key={s.label} className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">{s.label}</p>
            <h3 className={`text-2xl font-black ${s.color}`}>{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Center Completion */}
      <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
        <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
          <Building2 size={18} className="text-blue-500" /> Module Completion by Center
        </h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CENTER_COMPLETION} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" stroke="#475569" fontSize={10} domain={[0, 100]} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="center" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="completion" fill="#ef4444" radius={[0, 6, 6, 0]} barSize={18} name="Completion %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trainer Performance — Person-wise */}
      <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-white/[0.08]">
          <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em] flex items-center gap-3">
            <Users size={18} className="text-emerald-500" /> Trainer Performance — Individual Monitoring
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="bg-transparent/20 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              <th className="px-6 py-3">Trainer</th><th className="px-6 py-3">Center</th>
              <th className="px-6 py-3">Batches</th><th className="px-6 py-3">Progress</th>
              <th className="px-6 py-3">Attendance</th><th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-800">
              {TRAINERS.map((t) => {
                const d = TRAINER_DETAILS[t.id];
                const pct = Math.round((d.modulesCompleted / d.totalModules) * 100);
                return (
                  <tr key={t.id} className="hover:bg-transparent/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-black text-white/80">
                          {t.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-white/90">{t.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{t.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-white/60">{t.center}</td>
                    <td className="px-6 py-4 text-xs font-bold text-white/90">{d.batchesAssigned}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-white/60">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-blue-400">{d.attendanceRate}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${t.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-500"}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => navigate(`/super-admin/trainer/${t.id}`)}
                        className="px-3 py-1.5 bg-red-500/10 text-red-500 text-[10px] font-black uppercase rounded-lg hover:bg-red-500/20 transition flex items-center gap-1 ml-auto cursor-pointer">
                        <ExternalLink size={12} /> View Dashboard
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
