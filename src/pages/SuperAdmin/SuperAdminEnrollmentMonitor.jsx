import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap, Building2, Users, ExternalLink,
  CheckCircle2, Clock, XCircle, Download
} from "lucide-react";
import { ALL_USERS } from "./superAdminUsers";

const MOBILIZERS = ALL_USERS.filter(u => u.role === "Mobilizer");

const MOB_DETAILS = {
  "PSU-MOB-001": { mobilized: 280, approved: 240, pending: 28, rejected: 12, attendanceRate: "94%" },
  "PSU-MOB-002": { mobilized: 195, approved: 165, pending: 22, rejected: 8, attendanceRate: "91%" },
  "PSU-MOB-003": { mobilized: 320, approved: 275, pending: 30, rejected: 15, attendanceRate: "87%" },
};

const STATS = [
  { label: "Total Enrolled", value: "4,862", color: "text-red-500" },
  { label: "Approved", value: "3,940", color: "text-emerald-500" },
  { label: "Pending Review", value: "612", color: "text-amber-500" },
  { label: "Rejected", value: "310", color: "text-red-500" },
];

const CENTER_DATA = [
  { center: "Angul", total: 1240, approved: 1080, pending: 110, rejected: 50 },
  { center: "Sundargarh", total: 980, approved: 820, pending: 120, rejected: 40 },
  { center: "Keonjhar", total: 860, approved: 710, pending: 100, rejected: 50 },
  { center: "Jharsuguda", total: 720, approved: 580, pending: 90, rejected: 50 },
  { center: "Kalahandi", total: 620, approved: 480, pending: 80, rejected: 60 },
];

export default function SuperAdminEnrollmentMonitor() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3 tracking-tighter">
            <GraduationCap size={28} className="text-red-500" /> Enrollment Monitor
          </h1>
          <p className="text-sm text-white/60 mt-1 uppercase tracking-widest font-bold">Track all candidate enrollments across centers</p>
        </div>
        <button className="px-4 py-2 border border-slate-700 text-white/60 rounded-xl text-xs font-bold flex items-center gap-2 hover:border-slate-600 transition">
          <Download size={14} /> Export CSV
        </button>
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

      {/* Center Breakdown */}
      <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
        <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
          <Building2 size={18} className="text-blue-500" /> Center-wise Breakdown
        </h3>
        <div className="space-y-5">
          {CENTER_DATA.map(c => {
            const apPct = Math.round((c.approved / c.total) * 100);
            const pePct = Math.round((c.pending / c.total) * 100);
            const rePct = Math.round((c.rejected / c.total) * 100);
            return (
              <div key={c.center}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-white/90">{c.center}</span>
                  <span className="text-slate-500 text-xs font-bold">{c.total} Total</span>
                </div>
                <div className="w-full h-3 bg-transparent rounded-full flex overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${apPct}%` }} />
                  <div className="bg-amber-500 h-full" style={{ width: `${pePct}%` }} />
                  <div className="bg-red-500 h-full" style={{ width: `${rePct}%` }} />
                </div>
                <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold">
                  <span>● {c.approved} Approved</span>
                  <span>● {c.pending} Pending</span>
                  <span>● {c.rejected} Rejected</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobilizer Performance — Person-wise */}
      <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-white/[0.08]">
          <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em] flex items-center gap-3">
            <Users size={18} className="text-amber-500" /> Mobilizer Performance — Individual Monitoring
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="bg-transparent/20 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              <th className="px-6 py-3">Mobilizer</th><th className="px-6 py-3">Center</th>
              <th className="px-6 py-3">Mobilized</th><th className="px-6 py-3">Approved</th>
              <th className="px-6 py-3">Pending</th><th className="px-6 py-3">Attendance</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-800">
              {MOBILIZERS.map((mob) => {
                const d = MOB_DETAILS[mob.id];
                return (
                  <tr key={mob.id} className="hover:bg-transparent/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-black text-white/80">
                          {mob.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-white/90">{mob.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{mob.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-white/60">{mob.center}</td>
                    <td className="px-6 py-4 text-xs font-bold text-white/90">{d.mobilized}</td>
                    <td className="px-6 py-4 text-xs font-bold text-emerald-400">{d.approved}</td>
                    <td className="px-6 py-4 text-xs font-bold text-amber-400">{d.pending}</td>
                    <td className="px-6 py-4 text-xs font-bold text-blue-400">{d.attendanceRate}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => navigate(`/super-admin/mobilizer/${mob.id}`)}
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
