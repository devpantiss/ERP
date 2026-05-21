import Pagination from "../../components/common/Pagination";
import TableExportActions from "../../components/common/TableExportActions";
import { useEffect, useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAttendanceStore } from "../../stores/attendanceStore";
import { useEmployeeStore } from "../../stores/employeeStore";
import {
  selectTrainerAttendanceRows,
  selectTrainerWeeklyAttendance,
} from "../../stores/selectors/trainingSelectors";

const tooltipStyle = {  border: "1px solid #334155", borderRadius: "8px", color: "#e2e8f0" };

export default function AdminTrainerAttendance() {
  const employeeRecords = useEmployeeStore((state) => state.records);
  const fetchEmployees = useEmployeeStore((state) => state.fetchAll);
  const attendanceRecords = useAttendanceStore((state) => state.records);
  const fetchAttendance = useAttendanceStore((state) => state.fetchAll);
  const [centerFilter, setCenterFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState([]);
  const [exportScope, setExportScope] = useState("all");

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
  }, [fetchAttendance, fetchEmployees]);

  const trainers = useMemo(
    () => selectTrainerAttendanceRows(employeeRecords, attendanceRecords),
    [attendanceRecords, employeeRecords]
  );
  const weekly = useMemo(() => selectTrainerWeeklyAttendance(trainers), [trainers]);
  const centers = ["All", ...new Set(trainers.map((t) => t.center))];

  const filtered = useMemo(() => {
    return trainers.filter((t) => centerFilter === "All" || t.center === centerFilter);
  }, [centerFilter, trainers]);

  const avgRate = Math.round(filtered.reduce((s, t) => s + (t.presentDays / t.totalDays) * 100, 0) / (filtered.length || 1));

  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered?.slice(start, start + itemsPerPage) || [];
  }, [filtered, currentPage]);
  const totalPages = Math.ceil((filtered?.length || 0) / itemsPerPage);
  const selectedRows = useMemo(
    () => filtered.filter((trainer) => selectedIds.includes(trainer.id)),
    [filtered, selectedIds]
  );
  const exportColumns = useMemo(
    () => [
      { key: "name", header: "Name" },
      { key: "center", header: "Center" },
      { key: "presentDays", header: "Present", type: "number" },
      {
        key: "absent",
        header: "Absent",
        type: "number",
        exportValue: (trainer) => trainer.totalDays - trainer.presentDays,
      },
      { key: "lateDays", header: "Late", type: "number" },
      {
        key: "attendanceRate",
        header: "Rate",
        exportValue: (trainer) => `${Math.round((trainer.presentDays / trainer.totalDays) * 100)}%`,
      },
    ],
    []
  );
  const allCurrentPageSelected = paginatedData.length > 0 && paginatedData.every((trainer) => selectedIds.includes(trainer.id));

  function toggleTrainerSelection(id) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]
    );
  }

  function toggleCurrentPageSelection() {
    const pageIds = paginatedData.map((trainer) => trainer.id);
    setSelectedIds((current) => {
      if (pageIds.every((id) => current.includes(id))) {
        return current.filter((id) => !pageIds.includes(id));
      }

      return [...new Set([...current, ...pageIds])];
    });
  }

  const canExport = true;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Trainer Attendance</h1>
          <p className="text-sm text-white/60 mt-1">Monitor attendance across all trainers</p>
        </div>
        <TableExportActions
          moduleName="Trainer Attendance"
          fileName="trainer_attendance"
          columns={exportColumns}
          rows={filtered}
          selectedRows={selectedRows}
          exportScope={exportScope}
          onScopeChange={setExportScope}
          showSelectedToggle
          canExport={canExport}
          company={{
            name: "Pantiss ERP",
            logo: "/activity.png",
          }}
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
            <BarChart data={weekly}>
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
              <th className="p-4 text-left">
                <input
                  type="checkbox"
                  checked={allCurrentPageSelected}
                  onChange={toggleCurrentPageSelection}
                  className="h-4 w-4 rounded border-slate-600 bg-transparent accent-violet-500"
                  aria-label="Select current page"
                />
              </th>
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
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(t.id)}
                      onChange={() => toggleTrainerSelection(t.id)}
                      className="h-4 w-4 rounded border-slate-600 bg-transparent accent-violet-500"
                      aria-label={`Select ${t.name}`}
                    />
                  </td>
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
