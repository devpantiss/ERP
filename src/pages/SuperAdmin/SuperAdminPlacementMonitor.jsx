import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Target, Building2, Users, ExternalLink
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEmployeeStore } from "../../stores/employeeStore";
import { usePlacementStore } from "../../stores/placementStore";
import { selectPlacementMonitorData } from "../../stores/selectors/superAdminSelectors";

const tooltipStyle = {  border: "1px solid #334155", borderRadius: "12px" };

export default function SuperAdminPlacementMonitor() {
  const navigate = useNavigate();
  const { records: employees, fetchWithAssignments } = useEmployeeStore();
  const { drives, fetchDrives } = usePlacementStore();
  useEffect(() => {
    fetchWithAssignments();
    fetchDrives();
  }, [fetchDrives, fetchWithAssignments]);
  const { stats, centerTargets, officers } = useMemo(() => selectPlacementMonitorData(employees, drives), [drives, employees]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3 tracking-tighter">
          <Target size={28} className="text-red-500" /> Placement Monitor
        </h1>
        <p className="text-sm text-white/60 mt-1 uppercase tracking-widest font-bold">Track placements, drives & officer performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(s => (
          <div key={s.label} className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">{s.label}</p>
            <h3 className={`text-2xl font-black ${s.color}`}>{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Center vs Target */}
      <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
        <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
          <Building2 size={18} className="text-blue-500" /> Center-wise Placement vs Target
        </h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={centerTargets} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="center" stroke="#475569" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="target" fill="#334155" radius={[4, 4, 0, 0]} barSize={20} name="Target" />
              <Bar dataKey="placed" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} name="Placed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-6 mt-4 justify-center text-[10px] font-black uppercase tracking-widest text-slate-500">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-600" /> Target</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /> Placed</div>
        </div>
      </div>

      {/* PO Performance — Person-wise */}
      <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-white/[0.08]">
          <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em] flex items-center gap-3">
            <Users size={18} className="text-cyan-500" /> Placement Officer Performance — Individual Monitoring
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="bg-transparent/20 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              <th className="px-6 py-3">Officer</th><th className="px-6 py-3">Center</th>
              <th className="px-6 py-3">Drives</th><th className="px-6 py-3">Students Placed</th>
              <th className="px-6 py-3">Conversion</th><th className="px-6 py-3">Avg Salary</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-800">
              {officers.map((po) => {
                return (
                  <tr key={po.id} className="hover:bg-transparent/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-black text-white/80">
                          {po.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-white/90">{po.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{po.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-white/60">{po.center}</td>
                    <td className="px-6 py-4 text-xs font-bold text-white/90">{po.totalDrives}</td>
                    <td className="px-6 py-4 text-xs font-bold text-emerald-400">{po.studentsPlaced}</td>
                    <td className="px-6 py-4 text-xs font-bold text-red-400">{po.conversionRate}</td>
                    <td className="px-6 py-4 text-xs font-bold text-blue-400">{po.avgSalary}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => navigate(`/super-admin/placement-officer/${po.id}`)}
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
