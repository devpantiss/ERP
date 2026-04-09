import Pagination from "../../components/common/Pagination";
import { useState, useMemo } from "react";
import { Calendar, Filter, Download, Building2, Users, ClipboardCheck, TrendingUp } from "lucide-react";

const ATTENDANCE_DATA = [
  { center: "Pantiss Skill Resort, Angul", trainers: { present: 7, total: 8 }, mobilizers: { present: 5, total: 6 }, students: { present: 145, total: 160 }, avgAttendance: 92 },
  { center: "Jajpur Training Center", trainers: { present: 4, total: 5 }, mobilizers: { present: 4, total: 4 }, students: { present: 108, total: 120 }, avgAttendance: 88 },
  { center: "Kalahandi Center", trainers: { present: 7, total: 10 }, mobilizers: { present: 6, total: 8 }, students: { present: 172, total: 220 }, avgAttendance: 72 },
  { center: "Jharsuguda Campus", trainers: { present: 4, total: 4 }, mobilizers: { present: 3, total: 3 }, students: { present: 78, total: 85 }, avgAttendance: 95 },
  { center: "Keonjhar Training Hub", trainers: { present: 5, total: 6 }, mobilizers: { present: 4, total: 5 }, students: { present: 121, total: 140 }, avgAttendance: 84 },
  { center: "Sundargarh Skill Center", trainers: { present: 6, total: 7 }, mobilizers: { present: 5, total: 6 }, students: { present: 168, total: 195 }, avgAttendance: 86 },
];

const WEEKLY_TREND = [
  { day: "Mon", rate: 91 }, { day: "Tue", rate: 88 }, { day: "Wed", rate: 85 },
  { day: "Thu", rate: 90 }, { day: "Fri", rate: 87 }, { day: "Sat", rate: 78 },
];

function SummaryCard({ icon, label, value, highlight }) {
  return (
    <div className={`bg-[#111827] border rounded-xl p-4 ${highlight ? "border-violet-500 shadow-lg shadow-violet-500/10" : "border-slate-700"}`}>
      <div className="flex items-center gap-2 text-violet-400 mb-2">
        {icon}
        <span className="text-xs text-white/60">{label}</span>
      </div>
      <p className="text-xl font-semibold text-slate-100">{value}</p>
    </div>
  );
}

export default function AdminAttendanceOverview() {
  const [dateRange, setDateRange] = useState("today");
  const tTP = ATTENDANCE_DATA.reduce((a, c) => a + c.trainers.present, 0);
  const tT = ATTENDANCE_DATA.reduce((a, c) => a + c.trainers.total, 0);
  const tMP = ATTENDANCE_DATA.reduce((a, c) => a + c.mobilizers.present, 0);
  const tM = ATTENDANCE_DATA.reduce((a, c) => a + c.mobilizers.total, 0);
  const tSP = ATTENDANCE_DATA.reduce((a, c) => a + c.students.present, 0);
  const tS = ATTENDANCE_DATA.reduce((a, c) => a + c.students.total, 0);
  const overallRate = Math.round(((tTP + tMP + tSP) / (tT + tM + tS)) * 100);

  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return ATTENDANCE_DATA?.slice(start, start + itemsPerPage) || [];
  }, [ATTENDANCE_DATA, currentPage]);
  const totalPages = Math.ceil((ATTENDANCE_DATA?.length || 0) / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Attendance Overview</h1>
          <p className="text-sm text-white/60 mt-1">Cross-role attendance monitoring across all centers</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-md border border-slate-600 overflow-hidden text-sm">
            {["today", "week", "month"].map((v) => (
              <button key={v} onClick={() => setDateRange(v)}
                className={`px-4 py-1.5 capitalize transition ${dateRange === v ? "bg-violet-500 text-white" : "bg-transparent text-white/80 hover:bg-slate-700"}`}>
                {v}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111827] border border-slate-700 text-sm text-white/80 hover:border-violet-500/30 transition">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard icon={<TrendingUp size={18} />} label="Overall Attendance" value={`${overallRate}%`} highlight />
        <SummaryCard icon={<ClipboardCheck size={18} />} label="Trainers Present" value={`${tTP}/${tT}`} />
        <SummaryCard icon={<Users size={18} />} label="Mobilizers Present" value={`${tMP}/${tM}`} />
        <SummaryCard icon={<Users size={18} />} label="Students Present" value={`${tSP}/${tS}`} />
      </div>

      <div className="bg-[#111827] border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-medium text-violet-400 mb-4">Weekly Attendance Trend</h3>
        <div className="flex items-end gap-3 h-40">
          {WEEKLY_TREND.map((day) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-white/80 font-medium">{day.rate}%</span>
              <div className="w-full bg-slate-700 rounded-t-md relative" style={{ height: "100%" }}>
                <div className={`absolute bottom-0 w-full rounded-t-md transition-all duration-500 ${day.rate >= 90 ? "bg-emerald-500" : day.rate >= 80 ? "bg-violet-500" : "bg-amber-500"}`}
                  style={{ height: `${day.rate}%` }} />
              </div>
              <span className="text-xs text-slate-500">{day.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#111827] border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <h3 className="text-sm font-medium text-violet-400">Center-wise Attendance Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0b1220] text-white/60">
              <tr>
                <th className="p-4 text-left">Center</th>
                <th className="p-4 text-left">Trainers</th>
                <th className="p-4 text-left">Mobilizers</th>
                <th className="p-4 text-left">Students</th>
                <th className="p-4 text-left">Avg Rate</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
            {paginatedData.map((row) => (
                <tr key={row.center} className="border-t border-slate-700/50 hover:bg-transparent/30 transition">
                  <td className="p-4"><div className="flex items-center gap-2"><Building2 size={14} className="text-violet-400" /><span className="text-white/90">{row.center}</span></div></td>
                  <td className="p-4 text-white/80">{row.trainers.present}/{row.trainers.total}</td>
                  <td className="p-4 text-white/80">{row.mobilizers.present}/{row.mobilizers.total}</td>
                  <td className="p-4 text-white/80">{row.students.present}/{row.students.total}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${row.avgAttendance >= 90 ? "bg-emerald-500" : row.avgAttendance >= 80 ? "bg-violet-500" : "bg-amber-500"}`} style={{ width: `${row.avgAttendance}%` }} />
                      </div>
                      <span className="text-white/80 text-xs">{row.avgAttendance}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${row.avgAttendance >= 85 ? "bg-emerald-500/10 text-emerald-400" : row.avgAttendance >= 75 ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"}`}>
                      {row.avgAttendance >= 85 ? "Good" : row.avgAttendance >= 75 ? "Average" : "Low"}
                    </span>
                  </td>
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
