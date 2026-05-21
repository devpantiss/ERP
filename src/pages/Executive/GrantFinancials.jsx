import { 
  Gem, 
  Wallet, 
  TrendingUp, 
  History, 
  Search, 
  Filter, 
  Download,
  Plus,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from "recharts";
import { selectEnterpriseFinanceAnalytics } from "../../stores/selectors/analyticsSelectors";

const KPI_ICONS = [Gem, Wallet, Clock, TrendingUp];
const KPI_TONES = ["bg-amber-500/10", "bg-blue-500/10", "bg-emerald-500/10", "bg-violet-500/10"];

/* ===================== COMPONENT ===================== */

export default function GrantFinancials() {
  const analytics = selectEnterpriseFinanceAnalytics();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3 tracking-tighter">
            <Gem size={28} className="text-amber-500" />
            Global Grant & Financials
          </h1>
          <p className="text-sm text-white/60 mt-1 uppercase tracking-widest font-bold">Funding Pipeline & Expenditure Audit</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-transparent text-white/80 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 hover:bg-slate-700 transition">
            <Download size={14} /> Audit Trail
          </button>
          <button className="px-5 py-2 bg-amber-500 text-black text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20">
            <Plus size={14} /> Register New Grant
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {analytics.grantKpis.map((kpi, index) => {
          const Icon = KPI_ICONS[index] || Gem;
          const tone = KPI_TONES[index] || KPI_TONES[0];
          return (
          <div key={kpi.label} className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition duration-500">
              <Icon size={64} />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">{kpi.label}</p>
            <h3 className="text-2xl font-black text-slate-100 flex items-baseline gap-1">
              {kpi.value}
            </h3>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-tighter">{kpi.sub}</span>
            </div>
            <div className="mt-4 h-1 w-full bg-transparent rounded-full overflow-hidden">
               <div className={`h-full ${tone} opacity-80 w-2/3`} />
            </div>
          </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Expenditure vs Allocation Chart */}
        <div className="lg:col-span-2 bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em] flex items-center gap-3">
              <TrendingUp size={18} className="text-blue-500" /> Disbursement Analytics
            </h3>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> Target</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Actual</div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={analytics.grantFlow}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#475569" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{  border: "1px solid #334155", borderRadius: "16px" }}
                />
                <Bar dataKey="actual" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                <Line type="monotone" dataKey="allocation" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Major Funding Sources */}
        <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
          <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
            <Gem size={18} className="text-amber-500" /> Active Grant Portfolio
          </h3>
          <div className="space-y-6">
            {analytics.fundingSources.map((source) => (
              <div key={source.id} className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-white/90 uppercase tracking-tighter">{source.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-bold uppercase">{source.id}</p>
                  </div>
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">
                    {source.total ? ((source.utilized / source.total) * 100).toFixed(0) : 0}% Utilized
                  </span>
                </div>
                <div className="h-1.5 w-full bg-transparent rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-amber-500 transition-all duration-1000" 
                     style={{ width: `${source.total ? (source.utilized / source.total) * 100 : 0}%` }} 
                   />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-white/60">
                   <span>Allocated: ₹{source.total} Cr</span>
                   <span>Utilized: ₹{source.utilized} Cr</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-4 mt-8 bg-transparent/50 hover:bg-transparent text-[10px] font-black text-white/60 uppercase tracking-widest rounded-xl transition border border-slate-700/50">
            View All Funding Contracts
          </button>
        </div>

      </div>

      {/* Transaction Master Log */}
      <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm">
         <div className="p-8 border-b border-white/[0.08] flex items-center justify-between">
            <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em] flex items-center gap-3">
              <History size={18} className="text-violet-500" /> Financial Audit Trail
            </h3>
            <div className="flex gap-4">
               <div className="relative">
                 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                 <input type="text" placeholder="Search entries..." className="pl-9 pr-4 py-2 bg-transparent/40 border border-slate-700 rounded-xl text-xs text-white/80 outline-none focus:border-amber-500 transition" />
               </div>
               <button className="p-2 bg-transparent rounded-lg text-white/60 hover:text-white transition">
                 <Filter size={14} />
               </button>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-transparent/20 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                     <th className="px-8 py-4">Transaction ID</th>
                     <th className="px-8 py-4">Expenditure Details</th>
                     <th className="px-8 py-4">Volume</th>
                     <th className="px-8 py-4">Date</th>
                     <th className="px-8 py-4 text-right">Operational Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800">
                  {analytics.transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-transparent/30 transition group">
                       <td className="px-8 py-5 text-[11px] font-black text-amber-500/80 font-mono">{txn.id}</td>
                       <td className="px-8 py-5">
                          <p className="text-[13px] font-bold text-white/90 group-hover:text-slate-100">{txn.desc}</p>
                       </td>
                       <td className="px-8 py-5">
                          <span className="text-xs font-black text-white/90">{txn.amount}</span>
                       </td>
                       <td className="px-8 py-5 text-[11px] text-slate-500 font-bold">{txn.date}</td>
                       <td className="px-8 py-5 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            txn.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {txn.status}
                          </span>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
         <div className="p-6 bg-transparent/10 border-t border-white/[0.08] text-center">
            <button className="text-[11px] font-black text-slate-500 hover:text-amber-500 transition uppercase tracking-widest">Load Extended Financial Archive</button>
         </div>
      </div>

    </div>
  );
}
