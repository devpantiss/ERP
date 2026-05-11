import Pagination from "../../components/common/Pagination";
import ExportPDFButton from "../../components/common/ExportPDFButton";
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const TRAINERS = [
  { id: 1, name: "Aditya Sahu", center: "Angul", avatar: "https://i.pravatar.cc/40?img=12", presentDays: 24, totalDays: 26, lateDays: 2 },
  { id: 2, name: "Deepak Kumar", center: "Sundargarh", avatar: "https://i.pravatar.cc/40?img=14", presentDays: 25, totalDays: 26, lateDays: 1 },
  { id: 3, name: "Suresh Naik", center: "Kalahandi", avatar: "https://i.pravatar.cc/40?img=15", presentDays: 22, totalDays: 26, lateDays: 3 },
  { id: 4, name: "Rahul Sharma", center: "Angul", avatar: "https://i.pravatar.cc/40?img=8", presentDays: 26, totalDays: 26, lateDays: 0 },
  { id: 5, name: "Amit Panda", center: "Keonjhar", avatar: "https://i.pravatar.cc/40?img=18", presentDays: 20, totalDays: 26, lateDays: 4 },
  { id: 6, name: "Sneha Das", center: "Jharsuguda", avatar: "https://i.pravatar.cc/40?img=9", presentDays: 18, totalDays: 26, lateDays: 2 },
];

const WEEKLY = [
  { day: "Mon", present: 6, absent: 0 }, { day: "Tue", present: 5, absent: 1 },
  { day: "Wed", present: 6, absent: 0 }, { day: "Thu", present: 4, absent: 2 },
  { day: "Fri", present: 5, absent: 1 }, { day: "Sat", present: 3, absent: 3 },
];

const tooltipStyle = {  border: "1px solid #334155", borderRadius: "8px", color: "#e2e8f0" };

export default function AdminTrainerAttendance() {
  const [centerFilter, setCenterFilter] = useState("All");
  const centers = ["All", ...new Set(TRAINERS.map((t) => t.center))];

  const filtered = useMemo(() => {
    return TRAINERS.filter((t) => centerFilter === "All" || t.center === centerFilter);
  }, [centerFilter]);

  const avgRate = Math.round(filtered.reduce((s, t) => s + (t.presentDays / t.totalDays) * 100, 0) / (filtered.length || 1));

  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered?.slice(start, start + itemsPerPage) || [];
  }, [filtered, currentPage]);
  const totalPages = Math.ceil((filtered?.length || 0) / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Trainer Attendance</h1>
          <p className="text-sm text-white/60 mt-1">Monitor attendance across all trainers</p>
        </div>
        <ExportPDFButton
          title="Trainer Attendance"
          columns={["Name","Center","Present","Absent","Late","Rate"]}
          data={filtered.map(t=>[t.name,t.center,t.presentDays,t.totalDays-t.presentDays,t.lateDays,`${Math.round((t.presentDays/t.totalDays)*100)}%`])}
          fileName="trainer_attendance"
          accent="violet"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-white/60">Total Trainers</p>
          <p className="text-xl font-semibold text-violet-400 mt-1">{filtered.length}</p>
        </div>
        <div className="bg-[#111827] border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-white/60">Average Attendance</p>
          <p className="text-xl font-semibold text-emerald-400 mt-1">{avgRate}%</p>
        </div>
        <div className="bg-[#111827] border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-white/60">Working Days This Month</p>
          <p className="text-xl font-semibold text-cyan-400 mt-1">26</p>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-[#111827] border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-medium text-violet-400 mb-4">Weekly Attendance Overview</h3>
        <div className="h-52">
          <ResponsiveContainer>
            <BarChart data={WEEKLY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="present" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Present" />
              <Bar dataKey="absent" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {centers.map((c) => (
          <button key={c} onClick={() => setCenterFilter(c)}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${centerFilter === c ? "bg-violet-500 text-white" : "bg-[#111827] text-white/60 border border-slate-700"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#111827] border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0b1220] text-white/60">
            <tr>
              <th className="p-4 text-left">Trainer</th>
              <th className="p-4 text-left">Center</th>
              <th className="p-4 text-center">Present</th>
              <th className="p-4 text-center">Absent</th>
              <th className="p-4 text-center">Late</th>
              <th className="p-4 text-center">Rate</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((t) => {
              const rate = Math.round((t.presentDays / t.totalDays) * 100);
              return (
                <tr key={t.id} className="border-t border-slate-700/50 hover:bg-transparent/30 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={t.avatar} className="w-8 h-8 rounded-lg border border-slate-700" />
                      <span className="font-medium text-white/90">{t.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-white/60">{t.center}</td>
                  <td className="p-4 text-center text-emerald-400">{t.presentDays}</td>
                  <td className="p-4 text-center text-red-400">{t.totalDays - t.presentDays}</td>
                  <td className="p-4 text-center text-yellow-400">{t.lateDays}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-16 h-2 bg-slate-700 rounded-full"><div className={`h-full rounded-full ${rate >= 90 ? "bg-emerald-500" : rate >= 80 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${rate}%` }} /></div>
                      <span className="text-xs text-white/60">{rate}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
