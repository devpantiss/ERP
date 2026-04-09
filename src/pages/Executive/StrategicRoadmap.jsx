import { useState } from "react";
import { 
  Milestone, 
  TrendingUp, 
  Globe, 
  Target, 
  MapPin, 
  Rocket, 
  ArrowUpRight, 
  ArrowRight,
  ChevronRight,
  Box,
  Layout,
  Calendar,
  Zap,
  Star,
  Users
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts";

/* ===================== ENTERPRISE MOCK DATA ===================== */

const STRATEGIC_KPIS = [
  { label: "Market Presence", value: "18 Districts", sub: "East-Northern Node", icon: Globe, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Strategic Target", value: "10,000", sub: "Annual Placements", icon: Target, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Operational Depth", value: "Level 4", sub: "Enterprise Maturity", icon: Zap, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Expansion Velocity", value: "2.4x", sub: "QoQ growth rate", icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-500/10" },
];

const FORECAST_DATA = [
  { p: "FY 24", actual: 4200, forecast: 4200 },
  { p: "FY 25", actual: 5800, forecast: 6200 },
  { p: "FY 26", actual: null, forecast: 8500 },
  { p: "FY 27", actual: null, forecast: 11200 },
];

const MILESTONES = [
  { id: 1, title: "Western Node Inception", date: "Sep 2024", status: "Completed", color: "border-emerald-500" },
  { id: 2, title: "Grant v2.0 Rollout", date: "Mar 2025", status: "In-Progress", color: "border-blue-500" },
  { id: 3, title: "Corporate Tie-up Phase II", date: "Jun 2025", status: "Upcoming", color: "border-white/[0.08]" },
  { id: 4, title: "Pan-State Accreditation", date: "Dec 2025", status: "Upcoming", color: "border-white/[0.08]" },
];

/* ===================== COMPONENT ===================== */

export default function StrategicRoadmap() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-1000">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3 tracking-tighter uppercase font-sans">
            <Milestone size={28} className="text-amber-500" />
            Enterprise Strategic roadmap
          </h1>
          <p className="text-sm text-white/60 mt-1 uppercase tracking-widest font-bold">Expansion Velocity & Tactical Planning</p>
        </div>
        <div className="flex gap-4">
          <button className="px-5 py-2.5 bg-transparent text-white/80 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-700 hover:bg-slate-700 transition">
            Export Vision 2026
          </button>
          <button className="px-5 py-2.5 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 transition shadow-lg shadow-amber-500/20">
            Define New Milestone
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STRATEGIC_KPIS.map((stat) => (
          <div key={stat.label} className="bg-[#0f172a] border border-white/[0.08] rounded-2xl p-6 group relative overflow-hidden transition hover:border-blue-500/30">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} mb-4 inline-block transform group-hover:scale-110 transition duration-500`}>
              <stat.icon size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-100 mb-1">{stat.value}</h3>
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-tighter">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Growth Forecast Chart */}
        <div className="lg:col-span-2 bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em] flex items-center gap-3">
              <TrendingUp size={18} className="text-blue-500" /> Multi-Year Growth Projection
            </h3>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-700" /> Historical</div>
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Forecasted</div>
            </div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={FORECAST_DATA}>
                <defs>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="p" stroke="#475569" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{  border: "1px solid #334155", borderRadius: "16px" }}
                />
                <Area type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorForecast)" />
                <Line type="monotone" dataKey="actual" stroke="#cbd5e1" strokeWidth={5} dot={{ r: 6, fill: '#cbd5e1' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Milestone Timeline */}
        <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
           <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
             <Star size={18} className="text-amber-500" /> Strategic Progress
           </h3>
           <div className="space-y-10 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-transparent">
              {MILESTONES.map((mile) => (
                <div key={mile.id} className="relative pl-10 group">
                   <div className={`absolute left-0 top-1 w-6 h-6 rounded-full bg-[#020617] border-2 flex items-center justify-center z-10 ${mile.color} transform group-hover:scale-110 transition duration-500`}>
                      <div className={`w-2 h-2 rounded-full ${mile.status === 'Completed' ? 'bg-emerald-500' : mile.status === 'In-Progress' ? 'bg-blue-500' : 'bg-slate-700'}`} />
                   </div>
                   <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-1">
                         <h4 className="text-xs font-black text-white/90 uppercase group-hover:text-blue-400 transition">{mile.title}</h4>
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{mile.date}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{mile.status}</p>
                   </div>
                </div>
              ))}
           </div>
           
           <div className="mt-12 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10">
              <h5 className="text-[10px] font-black text-amber-500/80 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Layout size={14} /> Intelligence Note
              </h5>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                The **Grant v2.0 Rollout** is currently at **75%** readiness. Strategic synchronization with the Western Node will accelerate ROI by **1.8x** once Pan-State accreditation is achieved.
              </p>
           </div>
        </div>

      </div>

      {/* Strategic Vision Grid */}
      <div className="grid md:grid-cols-3 gap-6">
         {[
           { label: "Talent Acquisition", val: "L3", icon: Users, desc: "Building executive leadership core for multi-state operations." },
           { label: "Tech Infrastructure", val: "Enterprise", icon: Zap, desc: "Migration to multi-tenant cloud node architecture with real-time sync." },
           { label: "Policy Influence", val: "High", icon: Layout, desc: "Stakeholder engagement with State and National skill ministries." },
         ].map((item) => (
           <div key={item.label} className="p-6 rounded-2xl bg-transparent/10 border border-slate-700/30 hover:bg-transparent/20 transition group border-t-4 border-t-blue-500/20">
              <div className="flex items-center justify-between mb-4">
                 <item.icon size={20} className="text-slate-500 group-hover:text-amber-500 transition" />
                 <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{item.val} Readiness</span>
              </div>
              <h5 className="text-xs font-black text-white/90 uppercase tracking-tight mb-2">{item.label}</h5>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed leading-relaxed">{item.desc}</p>
           </div>
         ))}
      </div>

    </div>
  );
}
