import { useMemo, useState } from "react";
import { Briefcase, Filter, Phone, Search, ShieldCheck, Users } from "lucide-react";
import Pagination from "../../components/common/Pagination";
import { EMPLOYEES } from "./adminPortalData";

const ROLE_STYLES = {
  Trainer: "bg-violet-500/10 text-violet-300 border-violet-400/20",
  "Placement Officer": "bg-sky-500/10 text-sky-300 border-sky-400/20",
  Mobilizer: "bg-amber-500/10 text-amber-300 border-amber-400/20",
};

export default function AdminTrainerList() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredEmployees = useMemo(() => {
    return EMPLOYEES.filter((employee) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        employee.name.toLowerCase().includes(query) ||
        employee.center.toLowerCase().includes(query) ||
        employee.project.toLowerCase().includes(query);
      const matchesRole = roleFilter === "All" || employee.role === roleFilter;
      const matchesStatus = statusFilter === "All" || employee.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [search, roleFilter, statusFilter]);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const roleOptions = ["All", ...new Set(EMPLOYEES.map((employee) => employee.role))];
  const statusOptions = ["All", ...new Set(EMPLOYEES.map((employee) => employee.status))];

  const summary = [
    { label: "Total Employees", value: EMPLOYEES.length, icon: Users },
    {
      label: "Active Workforce",
      value: EMPLOYEES.filter((employee) => employee.status === "Active").length,
      icon: ShieldCheck,
    },
    {
      label: "Projects Covered",
      value: new Set(EMPLOYEES.map((employee) => employee.project)).size,
      icon: Briefcase,
    },
    {
      label: "Avg Performance",
      value: `${Math.round(
        EMPLOYEES.reduce((sum, employee) => sum + employee.performance, 0) / EMPLOYEES.length
      )}%`,
      icon: Filter,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Employee List</h1>
        <p className="mt-1 text-sm text-white/60">
          Unified employee directory for trainers, placement officers, and mobilizers.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-700 bg-[#111827] p-4">
            <div className="mb-2 flex items-center gap-2 text-white/60">
              <item.icon size={15} className="text-violet-400" />
              <span className="text-xs">{item.label}</span>
            </div>
            <p className="text-2xl font-semibold text-slate-100">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-700 bg-[#111827] p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search employee, center, or project"
            className="w-full rounded-xl border border-slate-700 bg-[#0b1220] py-2.5 pl-10 pr-4 text-sm text-white/90 outline-none transition focus:border-violet-400"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(event) => {
            setRoleFilter(event.target.value);
            setCurrentPage(1);
          }}
          className="rounded-xl border border-slate-700 bg-[#0b1220] px-4 py-2.5 text-sm text-white/80 outline-none"
        >
          {roleOptions.map((option) => (
            <option key={option} value={option}>
              {option === "All" ? "All Roles" : option}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setCurrentPage(1);
          }}
          className="rounded-xl border border-slate-700 bg-[#0b1220] px-4 py-2.5 text-sm text-white/80 outline-none"
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option === "All" ? "All Statuses" : option}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-[#111827]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-[#0b1220] text-white/60">
              <tr>
                <th className="p-4 text-left">Employee</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-left">Center</th>
                <th className="p-4 text-left">Project</th>
                <th className="p-4 text-left">Contact</th>
                <th className="p-4 text-left">Performance</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.map((employee) => (
                <tr key={employee.id} className="border-t border-slate-700/60">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-white/90">{employee.name}</p>
                      <p className="text-xs text-slate-500">{employee.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${
                        ROLE_STYLES[employee.role] || "bg-slate-700/50 text-white/70 border-slate-600"
                      }`}
                    >
                      {employee.role}
                    </span>
                  </td>
                  <td className="p-4 text-white/75">{employee.center}</td>
                  <td className="p-4 text-white/75">{employee.project}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-2 text-white/70">
                      <Phone size={13} className="text-violet-400" />
                      {employee.phone}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-700">
                        <div
                          className="h-full rounded-full bg-violet-500"
                          style={{ width: `${employee.performance}%` }}
                        />
                      </div>
                      <span className="text-xs text-white/70">{employee.performance}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300">
                      {employee.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
