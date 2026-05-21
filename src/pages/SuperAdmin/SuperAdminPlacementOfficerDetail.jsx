import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Target, Briefcase, TrendingUp, Building2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useEmployeeStore } from "../../stores/employeeStore";
import { usePlacementStore } from "../../stores/placementStore";
import { selectPlacementOfficerDetail } from "../../stores/selectors/superAdminSelectors";

const tooltipStyle = {  border: "1px solid #334155", borderRadius: "12px" };

export default function SuperAdminPlacementOfficerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { records: employees, fetchWithAssignments } = useEmployeeStore();
  const { drives, fetchDrives } = usePlacementStore();
  useEffect(() => {
    fetchWithAssignments();
    fetchDrives();
  }, [fetchDrives, fetchWithAssignments]);
  const { employee: po, kpi } = useMemo(() => selectPlacementOfficerDetail(id, employees, drives), [drives, employees, id]);

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
