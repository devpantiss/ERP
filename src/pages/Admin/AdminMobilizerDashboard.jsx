import Pagination from "../../components/common/Pagination";
import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, CalendarCheck, MapPin, TrendingUp, CheckCircle2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const MOBILIZER_DATA = {
  1: { name: "Priya Mishra", center: "Jajpur", avatar: "https://i.pravatar.cc/80?img=5" },
  2: { name: "Vikram Singh", center: "Keonjhar", avatar: "https://i.pravatar.cc/80?img=11" },
  3: { name: "Kavita Behera", center: "Jajpur", avatar: "https://i.pravatar.cc/80?img=20" },
  4: { name: "Rajan Nayak", center: "Angul", avatar: "https://i.pravatar.cc/80?img=33" },
  5: { name: "Sunita Patra", center: "Kalahandi", avatar: "https://i.pravatar.cc/80?img=23" },
  6: { name: "Manoj Sahu", center: "Sundargarh", avatar: "https://i.pravatar.cc/80?img=14" },
};

const ENROLLMENT_STATUS = [
  { name: "Enrolled", value: 52, color: "#8b5cf6" },
  { name: "Pending", value: 18, color: "#facc15" },
  { name: "Rejected", value: 5, color: "#f43f5e" },
];

const WEEKLY_ACTIVITY = [
  { day: "Mon", candidates: 4 }, { day: "Tue", candidates: 7 }, { day: "Wed", candidates: 3 },
  { day: "Thu", candidates: 8 }, { day: "Fri", candidates: 6 }, { day: "Sat", candidates: 2 },
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

const tooltipStyle = {  border: "1px solid #334155", borderRadius: "8px", color: "#e2e8f0" };

export default function AdminMobilizerDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mobilizer = MOBILIZER_DATA[id] || MOBILIZER_DATA[1];

  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return RECENT_EVENTS?.slice(start, start + itemsPerPage) || [];
  }, [RECENT_EVENTS, currentPage]);
  const totalPages = Math.ceil((RECENT_EVENTS?.length || 0) / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/admin/mobilizer-list")} className="p-2 rounded-lg bg-transparent hover:bg-slate-700 transition">
          <ArrowLeft size={18} className="text-white/80" />
        </button>
        <div className="flex items-center gap-4">
          <img src={mobilizer.avatar} className="w-14 h-14 rounded-xl border border-slate-700" />
          <div>
            <h1 className="text-xl font-semibold text-slate-100">{mobilizer.name}</h1>
            <p className="text-sm text-white/60 flex items-center gap-1"><MapPin size={12} /> {mobilizer.center} Center</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Candidates Mobilized", value: "75", icon: Users, color: "text-violet-400" },
          { label: "Events Completed", value: "12", icon: CalendarCheck, color: "text-emerald-400" },
          { label: "Attendance Rate", value: "94%", icon: TrendingUp, color: "text-cyan-400" },
          { label: "Enrollment Rate", value: "69%", icon: CheckCircle2, color: "text-yellow-400" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#111827] border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <kpi.icon size={14} className={kpi.color} />
              <span className="text-xs text-white/60">{kpi.label}</span>
            </div>
            <p className="text-2xl font-semibold text-slate-100">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Enrollment Status */}
        <div className="bg-[#111827] border border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-medium text-violet-400 mb-4">Enrollment Status</h3>
          <div className="h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={ENROLLMENT_STATUS} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3} strokeWidth={0}>
                  {ENROLLMENT_STATUS.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {ENROLLMENT_STATUS.map((e) => (
              <div key={e.name} className="flex items-center gap-1.5 text-xs text-white/60">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: e.color }} />
                {e.name}: {e.value}
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="bg-[#111827] border border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-medium text-violet-400 mb-4">Weekly Candidate Activity</h3>
          <div className="h-48">
            <ResponsiveContainer>
              <BarChart data={WEEKLY_ACTIVITY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="candidates" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-[#111827] border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-medium text-violet-400 mb-4">Recent Community Events</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/60 text-xs">
              <tr>
                <th className="p-3 text-left">Event</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-center">Participants</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
            {paginatedData.map((e, i) => (
                <tr key={i} className="border-t border-slate-700/50">
                  <td className="p-3 text-white/90 font-medium">{e.name}</td>
                  <td className="p-3 text-white/60">{e.location}</td>
                  <td className="p-3 text-white/60">{e.date}</td>
                  <td className="p-3 text-center text-violet-400">{e.participants}</td>
                  <td className="p-3"><span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-400">{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance */}
      <div className="bg-[#111827] border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-medium text-violet-400 mb-4">Attendance Record</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/60 text-xs">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-center">Session 1 (9–11)</th>
                <th className="p-3 text-center">Session 2 (11:30–1:30)</th>
                <th className="p-3 text-center">Session 3 (2:30–4:30)</th>
              </tr>
            </thead>
            <tbody>
              {ATTENDANCE.map((a, i) => (
                <tr key={i} className="border-t border-slate-700/50">
                  <td className="p-3 text-white/80">{a.date}</td>
                  {["s1", "s2", "s3"].map((s) => (
                    <td key={s} className="p-3 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${a[s] === "P" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
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
    </div>
  );
}
