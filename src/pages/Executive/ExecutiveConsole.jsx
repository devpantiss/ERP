import { 
  Globe, 
  Users, 
  Building2, 
  Gem, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Activity,
  ArrowUpRight,
  Zap,
  DollarSign,
  PieChart as PieIcon,
  ShieldAlert,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { selectEnterpriseFinanceAnalytics } from "../../stores/selectors/analyticsSelectors";

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"];
const KPI_ICONS = [Gem, TrendingUp, Building2, Activity];
const KPI_COLORS = [
  { color: "text-amber-500", bg: "bg-amber-500/10" },
  { color: "text-blue-500", bg: "bg-blue-500/10" },
  { color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { color: "text-violet-500", bg: "bg-violet-500/10" },
];
const ROADMAP_ICONS = [TrendingUp, Globe, Gem, Users];

/* ===================== COMPONENT ===================== */

export default function ExecutiveConsole() {
  const analytics = selectEnterpriseFinanceAnalytics();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3 tracking-tight">
            <Gem size={32} className="text-amber-500" />
            Executive Intelligence Console
          </h1>
          <p className="text-sm text-white/60 mt-1 max-w-xl leading-relaxed">
            Real-world enterprise-level monitoring for global skilling operations, financials, and strategic ROI analytics.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end px-4 border-r border-slate-700/50">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Status</span>
            <span className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Operational Integrity
            </span>
          </div>
          <button className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-black text-sm font-bold rounded-xl hover:opacity-90 transition shadow-xl shadow-amber-500/20 active:scale-95">
            Download Annual Audit
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {analytics.kpis.map((kpi, index) => {
          const Icon = KPI_ICONS[index] || Activity;
          const tone = KPI_COLORS[index] || KPI_COLORS[0];
          return (
          <div key={kpi.label} className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-6 hover:border-amber-500/40 transition-all group backdrop-blur-sm shadow-lg shadow-black/20">
            <div className="flex items-start justify-between">
              <div className={`p-4 rounded-2xl ${tone.bg} ${tone.color} group-hover:scale-105 transition-transform duration-300`}>
                <Icon size={28} />
              </div>
              <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full uppercase tracking-tighter">
                <ArrowUpRight size={12} /> +4.2%
              </div>
            </div>
            <div className="mt-6">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">{kpi.label}</p>
              <h3 className="text-2xl font-black text-slate-100 mt-2">{kpi.value}</h3>
              <p className="text-[11px] text-white/60 mt-1.5 flex items-center gap-1.5 font-medium">
                {kpi.sub}
              </p>
            </div>
          </div>
          );
        })}
      </div>

      {/* Middle Section: Financial vs Strategic */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Financial ROI Trend */}
        <div className="lg:col-span-2 bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em] flex items-center gap-3">
                <DollarSign size={18} className="text-amber-500" /> Operational Grant Flow
              </h3>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">Quarterly Allocation vs Expenditure (₹ Cr)</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-transparent text-white/60 text-[10px] font-bold rounded-lg hover:text-white transition">GRANTS</button>
              <button className="px-3 py-1.5 bg-transparent text-white/60 text-[10px] font-bold rounded-lg hover:text-white transition">EXPENDITURE</button>
            </div>
          </div>
          
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.grantFlow}>
                <defs>
                  <linearGradient id="colorAlloc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="p" stroke="#475569" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{  border: "1px solid #334155", borderRadius: "16px", padding: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)" }}
                />
                <Area type="monotone" dataKey="allocation" stroke="#f59e0b" strokeWidth={4} fillOpacity={1} fill="url(#colorAlloc)" />
                <Area type="monotone" dataKey="spends" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorSpend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strategic Alerts & Compliance */}
        <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm flex flex-col">
          <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
            <ShieldAlert size={18} className="text-red-500" /> Operational Audit
          </h3>
          <div className="flex-1 space-y-6">
            {analytics.alerts.map((alert) => (
              <div key={alert.id} className="relative pl-6 border-l-2 border-white/[0.08] hover:border-amber-500/50 transition duration-500 group">
                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-transparent group-hover:bg-amber-500 transition duration-500" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-amber-500/80 uppercase tracking-widest">{alert.type}</span>
                  <span className="text-[10px] font-bold text-slate-500">{alert.time}</span>
                </div>
                <p className="text-[13px] text-white/80 font-semibold leading-relaxed group-hover:text-slate-100 transition duration-500">
                  {alert.msg}
                </p>
                <button className="mt-3 text-[10px] font-bold text-blue-400 hover:underline">VIEW REPORT</button>
              </div>
            ))}
          </div>
          <button className="w-full py-4 mt-8 bg-transparent/50 hover:bg-transparent text-[11px] font-black text-white/60 uppercase tracking-widest rounded-xl transition border border-slate-700/50">
            View Compliance Master Log
          </button>
        </div>

      </div>

      {/* Bottom Section: Distribution vs Progress */}
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Funding Portfolio */}
        <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em]">Enterprise Funding Portfolio</h3>
            <PieIcon size={20} className="text-slate-500" />
          </div>
          <div className="grid md:grid-cols-2 items-center">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.grantDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {analytics.grantDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" strokeWidth={4} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-6 md:pl-10 md:border-l border-white/[0.08]">
              {analytics.grantDistribution.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-xs text-white/60 font-bold uppercase tracking-tight">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-white/90">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Strategic Road-map Milestones */}
        <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em]">Strategic Roadmap Targets</h3>
            <BarChart3 size={20} className="text-slate-500" />
          </div>
          <div className="space-y-8">
            {analytics.roadmap.map((m, index) => {
              const Icon = ROADMAP_ICONS[index] || TrendingUp;
              return (
              <div key={m.label} className="group cursor-default">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <Icon size={16} className="text-slate-500 group-hover:text-amber-500 transition duration-300" />
                    <span className="text-[11px] font-extrabold text-white/60 uppercase tracking-tighter group-hover:text-white/90 transition duration-300">{m.label}</span>
                  </div>
                  <span className="text-xs font-black text-amber-500">{m.val}%</span>
                </div>
                <div className="h-2 w-full bg-transparent/80 rounded-full overflow-hidden p-[1px] border border-slate-700/30">
                  <div className={`h-full ${m.color} rounded-full transition-all duration-1000 ease-out shadow-lg`} style={{ width: `${m.val}%` }} />
                </div>
              </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
