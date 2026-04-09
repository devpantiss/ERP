import { useState } from "react";
import {
  ShieldAlert,
  Users,
  GraduationCap,
  Briefcase,
  Building2,
  TrendingUp,
  Activity,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* ===================== MOCK DATA ===================== */

const KPIS = [
  { label: "Total Enrollments", value: "4,862", delta: "+12.4%", icon: GraduationCap, color: "text-red-500", bg: "bg-red-500/10" },
  { label: "Active Trainers", value: "128", delta: "+3", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Active Placements", value: "1,247", delta: "+8.2%", icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Centers Online", value: "32/32", delta: "100%", icon: Building2, color: "text-violet-500", bg: "bg-violet-500/10" },
];

const ENROLLMENT_TREND = [
  { month: "Oct", value: 320 },
  { month: "Nov", value: 480 },
  { month: "Dec", value: 590 },
  { month: "Jan", value: 720 },
  { month: "Feb", value: 810 },
  { month: "Mar", value: 940 },
];

const CENTER_PERFORMANCE = [
  { center: "Angul", enrolled: 820, placed: 680 },
  { center: "Sundargarh", enrolled: 640, placed: 510 },
  { center: "Keonjhar", enrolled: 550, placed: 420 },
  { center: "Jharsuguda", enrolled: 480, placed: 390 },
  { center: "Kalahandi", enrolled: 370, placed: 280 },
];

const ROLE_DISTRIBUTION = [
  { name: "Admins", value: 12 },
  { name: "Mobilizers", value: 45 },
  { name: "Trainers", value: 128 },
  { name: "Placement Officers", value: 22 },
];

const PIE_COLORS = ["#ef4444", "#3b82f6", "#10b981", "#8b5cf6"];

const LIVE_ACTIVITY = [
  { id: 1, action: "New enrollment batch created", user: "Admin — Angul", time: "2 min ago", type: "enrollment" },
  { id: 2, action: "Placement drive approved for Sundargarh", user: "Admin — Sundargarh", time: "8 min ago", type: "placement" },
  { id: 3, action: "Module 4 completed by Batch B-22", user: "Trainer — Keonjhar", time: "15 min ago", type: "training" },
  { id: 4, action: "Attendance synced for all Jharsuguda centers", user: "System", time: "22 min ago", type: "system" },
  { id: 5, action: "New mobilizer onboarded: Priya Sahu", user: "Admin — Sundargarh", time: "45 min ago", type: "access" },
  { id: 6, action: "ISO audit report uploaded", user: "Admin — Angul", time: "1h ago", type: "system" },
];

/* ===================== COMPONENT ===================== */

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3 tracking-tight">
            <ShieldAlert size={32} className="text-red-500" />
            Command Center
          </h1>
          <p className="text-sm text-white/60 mt-1 max-w-xl leading-relaxed">
            Real-time monitoring of all ERP operations across centers, roles, and modules.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end px-4 border-r border-slate-700/50">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Status</span>
            <span className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </span>
          </div>
          <button className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-bold rounded-xl hover:opacity-90 transition shadow-xl shadow-red-500/20 active:scale-95">
            Download Report
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {KPIS.map((kpi) => (
          <div key={kpi.label} className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-6 hover:border-red-500/40 transition-all group backdrop-blur-sm shadow-lg shadow-black/20">
            <div className="flex items-start justify-between">
              <div className={`p-4 rounded-2xl ${kpi.bg} ${kpi.color} group-hover:scale-105 transition-transform duration-300`}>
                <kpi.icon size={28} />
              </div>
              <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full uppercase tracking-tighter">
                <ArrowUpRight size={12} /> {kpi.delta}
              </div>
            </div>
            <div className="mt-6">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">{kpi.label}</p>
              <h3 className="text-2xl font-black text-slate-100 mt-2">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* Enrollment Trend */}
        <div className="lg:col-span-2 bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em] flex items-center gap-3">
                <TrendingUp size={18} className="text-red-500" /> Enrollment Trend
              </h3>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">Monthly New Enrollments</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ENROLLMENT_TREND}>
                <defs>
                  <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#475569" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{  border: "1px solid #334155", borderRadius: "16px", padding: "12px" }}
                />
                <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorEnroll)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm flex flex-col">
          <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
            <Activity size={18} className="text-red-500" /> Live Activity
          </h3>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[320px]">
            {LIVE_ACTIVITY.map((act) => (
              <div key={act.id} className="relative pl-6 border-l-2 border-white/[0.08] hover:border-red-500/50 transition duration-500 group">
                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-transparent group-hover:bg-red-500 transition duration-500" />
                <p className="text-[12px] text-white/80 font-semibold leading-relaxed group-hover:text-slate-100 transition">{act.action}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-500 font-bold">{act.user}</span>
                  <span className="text-[10px] text-slate-600">•</span>
                  <span className="text-[10px] text-slate-600">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-8">

        {/* Center Performance */}
        <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
          <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
            <Building2 size={18} className="text-blue-500" /> Center Performance
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CENTER_PERFORMANCE} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="center" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{  border: "1px solid #334155", borderRadius: "16px" }} />
                <Bar dataKey="enrolled" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} name="Enrolled" />
                <Bar dataKey="placed" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} name="Placed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-4 justify-center text-[10px] font-black uppercase tracking-widest text-slate-500">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /> Enrolled</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Placed</div>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
          <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
            <Users size={18} className="text-violet-500" /> Role Distribution
          </h3>
          <div className="grid md:grid-cols-2 items-center">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ROLE_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {ROLE_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="rgba(0,0,0,0.5)" strokeWidth={4} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-5 md:pl-8 md:border-l border-white/[0.08]">
              {ROLE_DISTRIBUTION.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: PIE_COLORS[i] }} />
                    <span className="text-xs text-white/60 font-bold uppercase tracking-tight">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-white/90">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
