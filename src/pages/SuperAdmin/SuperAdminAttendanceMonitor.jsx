import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck, Users, ChevronDown, ChevronUp
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEmployeeStore } from "../../stores/employeeStore";
import { selectAttendanceMonitorData } from "../../stores/selectors/superAdminSelectors";

const ROLE_BADGE = {
  Trainer: "bg-emerald-500/15 text-emerald-400",
  Mobilizer: "bg-amber-500/15 text-amber-400",
  "Placement Officer": "bg-cyan-500/15 text-cyan-400",
};

const tooltipStyle = {  border: "1px solid #334155", borderRadius: "12px" };

export default function SuperAdminAttendanceMonitor() {
  const { records: employees, fetchWithAssignments } = useEmployeeStore();
  const [expanded, setExpanded] = useState(null);
  const [roleFilter, setRoleFilter] = useState("All");
  useEffect(() => {
    fetchWithAssignments();
  }, [fetchWithAssignments]);

  const { stats, weeklyData, staff } = useMemo(() => selectAttendanceMonitorData(employees), [employees]);
  const filteredStaff = roleFilter === "All" ? staff : staff.filter(s => s.role === roleFilter);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3 tracking-tighter">
          <CalendarCheck size={28} className="text-red-500" /> Attendance Monitor
        </h1>
        <p className="text-sm text-white/60 mt-1 uppercase tracking-widest font-bold">Global attendance tracking across all staff</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(s => (
          <div key={s.label} className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">{s.label}</p>
            <h3 className={`text-2xl font-black ${s.color}`}>{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Weekly Trend */}
      <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
        <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
          <CalendarCheck size={18} className="text-red-500" /> Weekly Attendance Trend (%)
        </h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="day" stroke="#475569" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis stroke="#475569" fontSize={11} axisLine={false} tickLine={false} domain={[70, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="trainers" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} name="Trainers" />
              <Bar dataKey="mobilizers" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={16} name="Mobilizers" />
              <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-6 mt-4 justify-center text-[10px] font-black uppercase tracking-widest text-slate-500">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Trainers</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> Mobilizers</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Students</div>
        </div>
      </div>

      {/* Staff Registry — Person-wise */}
      <div className="bg-[#111827]/80 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em] flex items-center gap-3">
            <Users size={18} className="text-blue-500" /> Staff Attendance Registry — Individual Monitoring
          </h3>
          <div className="flex gap-1 bg-transparent/30 p-1 rounded-xl">
            {["All", "Trainer", "Mobilizer", "Placement Officer"].map(tab => (
              <button key={tab} onClick={() => setRoleFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${roleFilter === tab ? "bg-red-500/20 text-red-400" : "text-slate-500 hover:text-white/80"}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="bg-transparent/20 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              <th className="px-6 py-3">Staff</th><th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Center</th><th className="px-6 py-3">This Week</th>
              <th className="px-6 py-3">This Month</th><th className="px-6 py-3">Alerts</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-800">
              {filteredStaff.map((staff) => {
                const isExpanded = expanded === staff.id;
                return (
                  <>
                    <tr key={staff.id} className="hover:bg-transparent/30 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-black text-white/80">
                            {staff.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-white/90">{staff.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{staff.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${ROLE_BADGE[staff.role]}`}>{staff.role}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-white/60">{staff.center}</td>
                      <td className="px-6 py-4 text-xs font-bold text-white/90">{staff.weekPct}</td>
                      <td className="px-6 py-4 text-xs font-bold text-blue-400">{staff.monthPct}</td>
                      <td className="px-6 py-4">
                        {staff.alerts > 0 ? (
                          <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-black rounded-full">{staff.alerts} alerts</span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-bold">Clear</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setExpanded(isExpanded ? null : staff.id)}
                          className="px-3 py-1.5 bg-red-500/10 text-red-500 text-[10px] font-black uppercase rounded-lg hover:bg-red-500/20 transition flex items-center gap-1 ml-auto">
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          {isExpanded ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${staff.id}-detail`}>
                        <td colSpan={7} className="px-6 py-6 bg-transparent/20">
                          <div className="bg-transparent rounded-xl p-5 border border-white/[0.08] max-w-xl">
                            <h4 className="text-xs font-black text-white/60 uppercase tracking-widest mb-4">Daily Attendance — This Week</h4>
                            <div className="flex gap-3">
                              {staff.daily.map((day, i) => (
                                <div key={i} className="flex-1 text-center">
                                  <p className="text-[10px] text-slate-500 font-bold mb-2">{day.d}</p>
                                  <div className={`w-full py-2.5 rounded-xl text-xs font-black ${
                                    day.s === "P" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                                  }`}>
                                    {day.s === "P" ? "✓" : "✗"}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
