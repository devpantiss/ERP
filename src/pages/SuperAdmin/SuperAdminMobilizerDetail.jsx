import Pagination from "../../components/common/Pagination";
import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, CalendarCheck, MapPin, TrendingUp, CheckCircle2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ALL_USERS } from "./superAdminUsers";

const MOB_MAP = {};
ALL_USERS.filter(u => u.role === "Mobilizer").forEach(u => { MOB_MAP[u.id] = u; });

const MOB_KPIS = {
  "PSU-MOB-001": { mobilized: 280, events: 18, attendance: "94%", enrollmentRate: "76%", enrolled: 213, pending: 48, rejected: 19 },
  "PSU-MOB-002": { mobilized: 195, events: 12, attendance: "91%", enrollmentRate: "72%", enrolled: 140, pending: 38, rejected: 17 },
  "PSU-MOB-003": { mobilized: 320, events: 22, attendance: "87%", enrollmentRate: "81%", enrolled: 259, pending: 42, rejected: 19 },
};

const WEEKLY_ACTIVITY = [
  { day: "Mon", candidates: 5 }, { day: "Tue", candidates: 8 }, { day: "Wed", candidates: 3 },
  { day: "Thu", candidates: 7 }, { day: "Fri", candidates: 6 }, { day: "Sat", candidates: 4 },
];

const RECENT_EVENTS = [
  { name: "Community Awareness Drive", location: "Binjharpur GP", date: "28 Feb 2026", participants: 45, status: "Completed" },
  { name: "Skill India Campaign", location: "Jajpur Road GP", date: "22 Feb 2026", participants: 62, status: "Completed" },
  { name: "Youth Mobilization Camp", location: "Dharmasala GP", date: "15 Feb 2026", participants: 38, status: "Completed" },
  { name: "Door-to-Door Survey", location: "Sukinda GP", date: "08 Feb 2026", participants: 28, status: "Completed" },
];

const ATTENDANCE = [
  { date: "05 Mar", s1: "P", s2: "P", s3: "P" },
  { date: "04 Mar", s1: "P", s2: "P", s3: "A" },
  { date: "03 Mar", s1: "P", s2: "P", s3: "P" },
  { date: "02 Mar", s1: "A", s2: "P", s3: "P" },
  { date: "01 Mar", s1: "P", s2: "P", s3: "P" },
];

const tooltipStyle = {  border: "1px solid #334155", borderRadius: "12px" };

export default function SuperAdminMobilizerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mob = MOB_MAP[id] || ALL_USERS.find(u => u.role === "Mobilizer");
  const kpi = MOB_KPIS[id] || MOB_KPIS["PSU-MOB-001"];

  const enrollmentStatus = [
    { name: "Enrolled", value: kpi.enrolled, color: "#ef4444" },
    { name: "Pending", value: kpi.pending, color: "#f59e0b" },
    { name: "Rejected", value: kpi.rejected, color: "#64748b" },
  ];

  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return RECENT_EVENTS?.slice(start, start + itemsPerPage) || [];
  }, [RECENT_EVENTS, currentPage]);
  const totalPages = Math.ceil((RECENT_EVENTS?.length || 0) / itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/super-admin/enrollment-monitor")} className="p-2.5 rounded-xl bg-transparent hover:bg-slate-700 transition border border-slate-700">
          <ArrowLeft size={18} className="text-white/80" />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-lg font-black text-red-400">
            {mob.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-100">{mob.name}</h1>
            <p className="text-sm text-white/60 flex items-center gap-1 font-bold">
              <MapPin size={12} /> {mob.center} Center • <span className="text-red-500/80 font-mono text-xs">{mob.id}</span>
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Candidates Mobilized", value: kpi.mobilized.toString(), icon: Users, color: "text-red-400" },
          { label: "Events Completed", value: kpi.events.toString(), icon: CalendarCheck, color: "text-emerald-400" },
          { label: "Attendance Rate", value: kpi.attendance, icon: TrendingUp, color: "text-cyan-400" },
          { label: "Enrollment Rate", value: kpi.enrollmentRate, icon: CheckCircle2, color: "text-amber-400" },
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

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Enrollment Status Pie */}
        <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-sm font-black text-red-400 uppercase tracking-widest mb-4">Enrollment Status</h3>
          <div className="h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={enrollmentStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3} strokeWidth={0}>
                  {enrollmentStatus.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {enrollmentStatus.map((e) => (
              <div key={e.name} className="flex items-center gap-1.5 text-[10px] text-white/60 font-bold">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: e.color }} />{e.name}: {e.value}
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity Bar */}
        <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-sm font-black text-red-400 uppercase tracking-widest mb-4">Weekly Candidate Activity</h3>
          <div className="h-48">
            <ResponsiveContainer>
              <BarChart data={WEEKLY_ACTIVITY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" stroke="#475569" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="candidates" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-sm font-black text-red-400 uppercase tracking-widest mb-4">Recent Community Events</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              <tr><th className="p-3 text-left">Event</th><th className="p-3 text-left">Location</th><th className="p-3 text-left">Date</th><th className="p-3 text-center">Participants</th><th className="p-3 text-right">Status</th></tr>
            </thead>
            <tbody>
            {paginatedData.map((e, i) => (
                <tr key={i} className="border-t border-white/[0.08] hover:bg-transparent/30 transition">
                  <td className="p-3 text-white/90 font-bold text-xs">{e.name}</td>
                  <td className="p-3 text-white/60 text-xs">{e.location}</td>
                  <td className="p-3 text-white/60 text-xs">{e.date}</td>
                  <td className="p-3 text-center text-red-400 font-bold text-xs">{e.participants}</td>
                  <td className="p-3 text-right"><span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-500/10 text-emerald-400 uppercase">{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance */}
      <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-sm font-black text-red-400 uppercase tracking-widest mb-4">Attendance Record</h3>
        <table className="w-full text-sm">
          <thead className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">
            <tr><th className="p-3 text-left">Date</th><th className="p-3 text-center">Session 1 (9–11)</th><th className="p-3 text-center">Session 2 (11:30–1:30)</th><th className="p-3 text-center">Session 3 (2:30–4:30)</th></tr>
          </thead>
          <tbody>
            {ATTENDANCE.map((a, i) => (
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
