import { createElement, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Ban,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  Filter,
  FolderKanban,
  Search,
  ShieldCheck,
  UserCheck,
  Wallet,
} from "lucide-react";
import { buildSalaryWorkEvidence, SalaryWorkEvidence } from "../shared/salaryWorkEvidence";
import { Breadcrumb, PageHeader } from "./SuperAdminSharedComponents";
import { useSalaryStore } from "../../stores/salaryStore";
import { selectSalaryRows } from "../../stores/selectors/salarySelectors";

const ADMIN_SALARY_LINK = {
  label: "Admin Salary Approvals",
  path: "/admin/financial-management/salary-approvals",
};

function formatCurrency(value) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function toSalaryStatusLabel(status) {
  const map = {
    PAID: "Paid",
    APPROVED: "Approved",
    SUBMITTED: "Pending",
    REJECTED: "Rejected",
  };

  return map[status] || status;
}

function buildSalaryRecords(salaries) {
  return selectSalaryRows(salaries).map((salary, index) => {
    const target2 = salary.role === "Placement Officer" ? 40 + index * 2 : 80 + index * 4;
    const achievement2 = Math.max(Math.round(target2 * (salary.attendance / 100)) - (index % 3), 0);
    const adminApproved = ["Approved", "Paid"].includes(salary.status);
    const superAdminStatus =
      salary.status === "Paid"
        ? "Paid"
        : salary.status === "Rejected"
          ? "Returned"
          : adminApproved
            ? "Pending Review"
            : "Waiting Admin";

    return {
      ...salary,
      target1: salary.target1 || salary.targetKPI,
      target2,
      achievement1: salary.achievement1 || salary.achievedKPI,
      achievement2,
      evidence: buildSalaryWorkEvidence(salary, index),
      adminApproved,
      superAdminStatus,
    };
  });
}

function getStatusClass(status) {
  const map = {
    Approved: "border-sky-400/25 bg-sky-500/10 text-sky-300",
    Paid: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
    Pending: "border-amber-400/25 bg-amber-500/10 text-amber-300",
    "Pending Review": "border-amber-400/25 bg-amber-500/10 text-amber-300",
    "Waiting Admin": "border-slate-500/25 bg-slate-500/10 text-slate-300",
    Returned: "border-red-400/25 bg-red-500/10 text-red-300",
  };

  return map[status] || "border-slate-500/25 bg-slate-500/10 text-slate-300";
}

function summarizeProjects(records) {
  return Array.from(
    records
      .reduce((projectMap, record) => {
        const current = projectMap.get(record.project) || {
          name: record.project,
          employeeCount: 0,
          totalSalary: 0,
          adminApproved: 0,
          pendingReview: 0,
          superApproved: 0,
          returned: 0,
          avgAttendance: 0,
        };

        projectMap.set(record.project, {
          ...current,
          employeeCount: current.employeeCount + 1,
          totalSalary: current.totalSalary + record.amount,
          adminApproved: current.adminApproved + (record.adminApproved ? 1 : 0),
          pendingReview: current.pendingReview + (record.superAdminStatus === "Pending Review" ? 1 : 0),
          superApproved: current.superApproved + (record.superAdminStatus === "Paid" ? 1 : 0),
          returned: current.returned + (record.superAdminStatus === "Returned" ? 1 : 0),
          avgAttendance: current.avgAttendance + record.attendance,
        });

        return projectMap;
      }, new Map())
      .values()
  ).map((project) => ({
    ...project,
    avgAttendance: Math.round(project.avgAttendance / project.employeeCount),
  }));
}

export default function SuperAdminFinanceManagement() {
  const { salaries, fetchSalaries, updateSalary } = useSalaryStore();
  useEffect(() => {
    fetchSalaries();
  }, [fetchSalaries]);

  const normalizedSalaryRows = useMemo(() => buildSalaryRecords(salaries), [salaries]);
  const [salaryRows, setSalaryRows] = useState([]);
  useEffect(() => {
    setSalaryRows((current) => (current.length ? current : normalizedSalaryRows));
  }, [normalizedSalaryRows]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const projectSummaries = useMemo(() => summarizeProjects(salaryRows), [salaryRows]);
  const selectedProjectSummary = useMemo(
    () => projectSummaries.find((project) => project.name === selectedProject),
    [projectSummaries, selectedProject]
  );

  const projectRows = useMemo(() => {
    if (!selectedProject) return [];

    const query = search.trim().toLowerCase();
    return salaryRows.filter((row) => {
      if (row.project !== selectedProject) return false;
      if (statusFilter !== "All" && row.superAdminStatus !== statusFilter) return false;
      if (!query) return true;

      return (
        row.id.toLowerCase().includes(query) ||
        row.employee.toLowerCase().includes(query) ||
        row.role.toLowerCase().includes(query) ||
        row.center.toLowerCase().includes(query)
      );
    });
  }, [salaryRows, search, selectedProject, statusFilter]);

  const totals = useMemo(
    () =>
      salaryRows.reduce(
        (summary, row) => ({
          totalSalary: summary.totalSalary + row.amount,
          adminApproved: summary.adminApproved + (row.adminApproved ? 1 : 0),
          pendingReview: summary.pendingReview + (row.superAdminStatus === "Pending Review" ? 1 : 0),
          superApproved: summary.superApproved + (row.superAdminStatus === "Paid" ? 1 : 0),
        }),
        { totalSalary: 0, adminApproved: 0, pendingReview: 0, superApproved: 0 }
      ),
    [salaryRows]
  );

  const updateSuperAdminStatus = (id, status, salaryStatus) => {
    const decidedOn = new Date().toISOString().split("T")[0];
    setSalaryRows((current) =>
      current.map((row) =>
        row.id === id
          ? {
              ...row,
              ...(salaryStatus ? { status: toSalaryStatusLabel(salaryStatus) } : {}),
              superAdminStatus: status,
              decidedOn,
            }
          : row
      )
    );
    if (salaryStatus) {
      updateSalary(id, { status: salaryStatus, decidedOn });
    }
  };

  const approveProjectSalaries = () => {
    if (!selectedProject) return;

    const decidedOn = new Date().toISOString().split("T")[0];
    setSalaryRows((current) =>
      current.map((row) =>
        row.project === selectedProject && row.superAdminStatus === "Pending Review"
          ? { ...row, superAdminStatus: "Paid", status: "Paid", decidedOn }
          : row
      )
    );
    salaryRows
      .filter((row) => row.project === selectedProject && row.superAdminStatus === "Pending Review")
      .forEach((row) => updateSalary(row.id, { status: "PAID", decidedOn }));
  };

  const clearProjectSelection = () => {
    setSelectedProject(null);
    setSearch("");
    setStatusFilter("All");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Wallet}
        title={selectedProject ? `${selectedProject} Salaries` : "Salaries"}
        subtitle={
          selectedProject
            ? "Review employee salary records for this project and complete Super Admin approval."
            : "Select a project to view employee salary details and approval status."
        }
      />
      <Breadcrumb items={selectedProject ? ["Super Admin", "Salaries", selectedProject] : ["Super Admin", "Salaries"]} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Wallet} label="Total Salary Value" value={formatCurrency(totals.totalSalary)} tone="red" />
        <MetricCard icon={UserCheck} label="Admin Approved" value={totals.adminApproved} tone="sky" />
        <MetricCard icon={Clock} label="Pending Review" value={totals.pendingReview} tone="amber" />
        <MetricCard icon={ShieldCheck} label="Paid Salaries" value={totals.superApproved} tone="emerald" />
      </div>

      {!selectedProject ? (
        <section className="space-y-5">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.16em] text-white/85">
                Select Project
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Project cards open the salary details of employees associated with that project.
              </p>
            </div>
            <Link
              to={ADMIN_SALARY_LINK.path}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2 text-xs font-bold text-white/70 transition hover:border-red-400/40 hover:text-white"
            >
              {ADMIN_SALARY_LINK.label}
              <ExternalLink size={13} />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projectSummaries.map((project) => (
              <ProjectSalaryCard
                key={project.name}
                project={project}
                onSelect={() => setSelectedProject(project.name)}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="space-y-5">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 backdrop-blur-sm xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={clearProjectSelection}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2 text-xs font-black text-white/70 transition hover:border-red-400/40 hover:text-white"
              >
                <ArrowLeft size={14} />
                Projects
              </button>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-red-300">Selected Project</p>
                <h2 className="mt-1 text-xl font-black text-white">{selectedProject}</h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {selectedProjectSummary && (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <MiniStat label="Employees" value={selectedProjectSummary.employeeCount} />
                  <MiniStat label="Admin OK" value={selectedProjectSummary.adminApproved} tone="text-sky-300" />
                  <MiniStat label="Pending" value={selectedProjectSummary.pendingReview} tone="text-amber-300" />
                </div>
              )}

              <button
                type="button"
                onClick={approveProjectSalaries}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-red-500/20 transition hover:opacity-90"
              >
                <CheckCircle2 size={15} />
                Mark Cleared as Paid
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80 backdrop-blur-sm">
            <div className="border-b border-white/[0.08] p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-[0.16em] text-white/85">
                    Employee Salary Details
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {projectRows.length} employee salary records in current view
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2 text-xs font-bold text-white/60">
                    <Filter size={14} className="text-red-400" />
                    Filters
                  </div>

                  <div className="relative min-w-[230px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search employee, center, role"
                      className="w-full rounded-xl border border-slate-700 bg-[#0b1220] py-2.5 pl-9 pr-3 text-xs text-white/85 outline-none transition placeholder:text-slate-600 focus:border-red-400/45"
                    />
                  </div>

                  <FilterSelect
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={["All", "Pending Review", "Paid", "Returned", "Waiting Admin"]}
                  />

                  <Link
                    to={ADMIN_SALARY_LINK.path}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2.5 text-xs font-bold text-white/70 transition hover:border-red-400/40 hover:text-white"
                  >
                    Admin Salary Page
                    <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm" style={{ minWidth: 1580 }}>
                <thead className="bg-[#0b1220] text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Employee</th>
                    <th className="px-5 py-4">Center</th>
                    <th className="px-5 py-4">Month</th>
                    <th className="px-5 py-4">Attendance</th>
                    <th className="px-5 py-4">Targets</th>
                    <th className="px-5 py-4">Salary</th>
                    <th className="px-5 py-4">Admin Approval</th>
                    <th className="px-5 py-4">Super Admin</th>
                    <th className="px-5 py-4">Work Done / Proof</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {projectRows.length ? (
                    projectRows.map((row) => (
                      <SalaryRow
                        key={row.id}
                        row={row}
                        onApprove={() => updateSuperAdminStatus(row.id, "Paid", "PAID")}
                        onReturn={() => updateSuperAdminStatus(row.id, "Returned", "REJECTED")}
                        onReopen={() => updateSuperAdminStatus(row.id, row.adminApproved ? "Pending Review" : "Waiting Admin", row.adminApproved ? "APPROVED" : "SUBMITTED")}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="px-5 py-12 text-center text-sm text-slate-500">
                        No salary records match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function ProjectSalaryCard({ project, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 text-left backdrop-blur-sm transition hover:-translate-y-1 hover:border-red-500/35 hover:bg-[#151e2f] focus:outline-none focus:ring-2 focus:ring-red-400/35"
    >
      <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-red-500/10 blur-3xl transition group-hover:bg-red-500/20" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-300">
            <FolderKanban size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-black text-white">{project.name}</p>
            <p className="mt-1 text-xs text-slate-500">{project.employeeCount} employees linked</p>
          </div>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-red-200 transition group-hover:border-red-400/40 group-hover:text-red-100">
          <ArrowUpRight size={15} />
        </span>
      </div>

      <div className="relative mt-6 grid grid-cols-3 gap-2 text-center">
        <MiniStat label="Admin OK" value={project.adminApproved} tone="text-sky-300" />
        <MiniStat label="Pending" value={project.pendingReview} tone="text-amber-300" />
        <MiniStat label="Paid" value={project.superApproved} tone="text-emerald-300" />
      </div>

      <div className="relative mt-5 rounded-xl border border-slate-700/50 bg-[#0b1220] p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Salary Value</span>
          <span className="text-sm font-black text-emerald-300">{formatCurrency(project.totalSalary)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-4">
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Avg Attendance</span>
          <span className="text-sm font-black text-white">{project.avgAttendance}%</span>
        </div>
      </div>
    </button>
  );
}

function SalaryRow({ row, onApprove, onReturn, onReopen }) {
  const cumulative = Math.min(row.achievement1 + row.achievement2, 100);

  return (
    <tr className="transition hover:bg-white/[0.025]">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-xs font-black text-red-200">
            {row.employee.split(" ").map((part) => part[0]).join("")}
          </div>
          <div>
            <p className="font-bold text-white">{row.employee}</p>
            <p className="mt-1 text-xs text-slate-500">{row.role}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 text-white/70">{row.center}</td>
      <td className="px-5 py-4 text-white/70">{row.month}</td>
      <td className="px-5 py-4">
        <p className="font-black text-white">{row.attendance}%</p>
        <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-slate-700">
          <div
            className={`h-full rounded-full ${row.attendance >= 90 ? "bg-emerald-400" : row.attendance >= 80 ? "bg-sky-400" : "bg-amber-400"}`}
            style={{ width: `${Math.min(row.attendance, 100)}%` }}
          />
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="grid min-w-[230px] grid-cols-3 gap-2">
          <MiniStat label="T1/A1" value={`${row.achievement1}/${row.target1}`} />
          <MiniStat label="T2/A2" value={`${row.achievement2}/${row.target2}`} />
          <MiniStat label="Cum." value={`${cumulative}%`} tone={cumulative >= 90 ? "text-emerald-300" : "text-amber-300"} />
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="text-base font-black text-emerald-300">{formatCurrency(row.amount)}</p>
        <p className="mt-1 font-mono text-xs text-slate-500">{row.id}</p>
      </td>
      <td className="px-5 py-4">
        <StatusPill status={row.status} />
        <p className="mt-2 text-xs font-semibold text-slate-500">
          {row.adminApproved ? "Admin approval given" : "Admin approval pending"}
        </p>
      </td>
      <td className="px-5 py-4">
        <StatusPill status={row.superAdminStatus} />
        <p className="mt-2 text-xs font-semibold text-slate-500">
          {row.decidedOn ? `Updated ${row.decidedOn}` : row.adminApproved ? "Ready for decision" : "Locked until Admin clears"}
        </p>
      </td>
      <td className="px-5 py-4 align-top">
        <SalaryWorkEvidence evidence={row.evidence} tone="red" />
      </td>
      <td className="px-5 py-4 text-right align-top">
        {row.superAdminStatus === "Pending Review" ? (
          <div className="flex min-w-[230px] justify-end gap-3">
            <button
              type="button"
              onClick={onApprove}
              className="inline-flex min-w-[104px] items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-emerald-500/15 px-4 py-2.5 text-xs font-black text-emerald-200 transition hover:bg-emerald-500/25"
            >
              <CheckCircle2 size={14} />
              Mark Paid
            </button>
            <button
              type="button"
              onClick={onReturn}
              className="inline-flex min-w-[104px] items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-black text-red-200 transition hover:bg-red-500/20"
            >
              <Ban size={14} />
              Return
            </button>
          </div>
        ) : row.adminApproved ? (
          <button
            type="button"
            onClick={onReopen}
            className="inline-flex min-w-[112px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-700 bg-[#0b1220] px-4 py-2.5 text-xs font-black text-white/65 transition hover:border-red-400/35 hover:text-white"
          >
            <Clock size={14} />
            Reopen
          </button>
        ) : (
          <span className="inline-flex min-w-[142px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-700 bg-[#0b1220] px-4 py-2.5 text-xs font-black text-slate-500">
            <Clock size={14} />
            Awaiting Admin
          </span>
        )}
      </td>
    </tr>
  );
}

function MetricCard({ icon: Icon, label, value, tone }) {
  const toneClass = {
    red: "border-red-400/20 bg-red-500/10 text-red-300",
    sky: "border-sky-400/20 bg-sky-500/10 text-sky-300",
    amber: "border-amber-400/20 bg-amber-500/10 text-amber-300",
    emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${toneClass}`}>
          {createElement(Icon, { size: 18 })}
        </div>
      </div>
      <p className="mt-4 text-2xl font-black tracking-tight text-white">{value}</p>
    </div>
  );
}

function MiniStat({ label, value, tone = "text-white" }) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-[#0b1220] px-2.5 py-2">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-1 text-sm font-black ${tone}`}>{value}</p>
    </div>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <div className="relative min-w-[160px]">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2.5 pr-8 text-xs font-semibold text-white/75 outline-none transition focus:border-red-400/45"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-slate-950">
            {option}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
    </div>
  );
}

function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-black ${getStatusClass(status)}`}>
      {status}
    </span>
  );
}
