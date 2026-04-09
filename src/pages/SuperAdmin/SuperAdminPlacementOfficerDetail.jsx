import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Target, Briefcase, TrendingUp, Building2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ALL_USERS } from "./SuperAdminUserManagement";

const PO_MAP = {};
ALL_USERS.filter(u => u.role === "Placement Officer").forEach(u => { PO_MAP[u.id] = u; });

const PO_KPIS = {
  "PSU-PLC-001": {
    totalDrives: 12, studentsPlaced: 185, conversionRate: "72%", avgSalary: "₹14,500/mo", partnerCompanies: 18,
    drives: [
      { company: "Tata Steel", sector: "Manufacturing", date: "28 Feb", placed: 32, appeared: 45, status: "Completed" },
      { company: "TCS", sector: "IT/ITES", date: "15 Feb", placed: 28, appeared: 40, status: "Completed" },
      { company: "Vedanta Ltd", sector: "Mining", date: "05 Feb", placed: 18, appeared: 30, status: "Completed" },
      { company: "Apollo Hospitals", sector: "Healthcare", date: "08 Mar", placed: 0, appeared: 0, status: "Upcoming" },
    ],
    sectorSplit: [
      { name: "Manufacturing", value: 35, color: "#ef4444" },
      { name: "IT/ITES", value: 28, color: "#3b82f6" },
      { name: "Mining", value: 20, color: "#f59e0b" },
      { name: "Healthcare", value: 17, color: "#10b981" },
    ],
    monthly: [{ m: "Oct", p: 18 },{ m: "Nov", p: 25 },{ m: "Dec", p: 32 },{ m: "Jan", p: 40 },{ m: "Feb", p: 38 },{ m: "Mar", p: 32 }],
  },
  "PSU-PLC-002": {
    totalDrives: 8, studentsPlaced: 120, conversionRate: "68%", avgSalary: "₹13,200/mo", partnerCompanies: 12,
    drives: [
      { company: "NALCO", sector: "Mining", date: "20 Feb", placed: 22, appeared: 35, status: "Completed" },
      { company: "Infosys BPO", sector: "IT/ITES", date: "10 Feb", placed: 18, appeared: 28, status: "Completed" },
      { company: "L&T", sector: "Construction", date: "01 Feb", placed: 15, appeared: 25, status: "Completed" },
      { company: "Vedanta Ltd", sector: "Mining", date: "08 Mar", placed: 0, appeared: 0, status: "Upcoming" },
    ],
    sectorSplit: [
      { name: "Mining", value: 40, color: "#f59e0b" },
      { name: "IT/ITES", value: 25, color: "#3b82f6" },
      { name: "Construction", value: 20, color: "#ef4444" },
      { name: "Other", value: 15, color: "#64748b" },
    ],
    monthly: [{ m: "Oct", p: 12 },{ m: "Nov", p: 16 },{ m: "Dec", p: 22 },{ m: "Jan", p: 28 },{ m: "Feb", p: 24 },{ m: "Mar", p: 18 }],
  },
};

const tooltipStyle = {  border: "1px solid #334155", borderRadius: "12px" };

export default function SuperAdminPlacementOfficerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const po = PO_MAP[id] || ALL_USERS.find(u => u.role === "Placement Officer");
  const kpi = PO_KPIS[id] || PO_KPIS["PSU-PLC-001"];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/super-admin/placement-monitor")} className="p-2.5 rounded-xl bg-transparent hover:bg-slate-700 transition border border-slate-700">
          <ArrowLeft size={18} className="text-white/80" />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-lg font-black text-red-400">
            {po.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-100">{po.name}</h1>
            <p className="text-sm text-white/60 flex items-center gap-1 font-bold">
              <MapPin size={12} /> {po.center} Center • <span className="text-red-500/80 font-mono text-xs">{po.id}</span>
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Drives", value: kpi.totalDrives.toString(), icon: Target, color: "text-red-400" },
          { label: "Students Placed", value: kpi.studentsPlaced.toString(), icon: Briefcase, color: "text-emerald-400" },
          { label: "Conversion Rate", value: kpi.conversionRate, icon: TrendingUp, color: "text-cyan-400" },
          { label: "Partner Companies", value: kpi.partnerCompanies.toString(), icon: Building2, color: "text-amber-400" },
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
        {/* Monthly Placements */}
        <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-sm font-black text-red-400 uppercase tracking-widest mb-4">Monthly Placements</h3>
          <div className="h-48">
            <ResponsiveContainer>
              <BarChart data={kpi.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="m" stroke="#475569" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="p" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={24} name="Placed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Distribution */}
        <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-sm font-black text-red-400 uppercase tracking-widest mb-4">Sector Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={kpi.sectorSplit} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3} strokeWidth={0}>
                  {kpi.sectorSplit.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {kpi.sectorSplit.map((e) => (
              <div key={e.name} className="flex items-center gap-1.5 text-[10px] text-white/60 font-bold">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: e.color }} />{e.name}: {e.value}%
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Placement Drives */}
      <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-sm font-black text-red-400 uppercase tracking-widest mb-4">Placement Drives</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              <tr><th className="p-3 text-left">Company</th><th className="p-3 text-left">Sector</th><th className="p-3 text-left">Date</th><th className="p-3 text-center">Placed</th><th className="p-3 text-center">Appeared</th><th className="p-3 text-right">Status</th></tr>
            </thead>
            <tbody>
              {kpi.drives.map((d, i) => (
                <tr key={i} className="border-t border-white/[0.08] hover:bg-transparent/30 transition">
                  <td className="p-3 text-white/90 font-bold text-xs">{d.company}</td>
                  <td className="p-3 text-white/60 text-xs">{d.sector}</td>
                  <td className="p-3 text-white/60 text-xs">{d.date}</td>
                  <td className="p-3 text-center text-emerald-400 font-bold text-xs">{d.placed || "—"}</td>
                  <td className="p-3 text-center text-white/60 text-xs">{d.appeared || "—"}</td>
                  <td className="p-3 text-right">
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase ${d.status === "Completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"}`}>
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
