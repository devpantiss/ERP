import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  FileText,
  Search,
  ShieldCheck,
} from "lucide-react";
import TableExportActions from "../../components/common/TableExportActions";

const STUDENTS = Array.from({ length: 20 }, (_, i) => {
  const statuses = ["Active", "Expiring Soon", "Pending", "Expired"];
  const status = statuses[i % statuses.length];

  return {
    id: `INS-${String(i + 1).padStart(3, "0")}`,
    name: `Student ${i + 1}`,
    enrollmentId: `ENR-2026-${1500 + i}`,
    project: ["PMKVY 4.0", "CSR - Tata Steel", "DDUGKY", "DMF Keonjhar"][i % 4],
    center: ["Angul", "Jajpur", "Kalahandi", "Keonjhar"][i % 4],
    batch: `BATCH-${101 + (i % 5)}`,
    policyNo: status === "Pending" ? "-" : `POL-OD-${88300 + i}`,
    provider: ["LIC Group Cover", "ICICI Lombard", "New India Assurance", "HDFC ERGO"][i % 4],
    coverage: status === "Pending" ? 0 : 200000 + (i % 4) * 50000,
    startDate: status === "Pending" ? "-" : `2026-04-${String((i % 20) + 1).padStart(2, "0")}`,
    endDate: status === "Expired" ? "2026-05-10" : status === "Expiring Soon" ? "2026-05-29" : "2027-04-30",
    nominee: ["Mother", "Father", "Spouse", "Guardian"][i % 4],
    status,
  };
});

function StatusPill({ status }) {
  const styles = {
    Active: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    "Expiring Soon": "border-amber-500/25 bg-amber-500/10 text-amber-300",
    Pending: "border-slate-500/25 bg-slate-500/10 text-slate-300",
    Expired: "border-red-500/25 bg-red-500/10 text-red-300",
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

function formatCurrency(value) {
  if (!value) return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminStudentInsuranceDetails() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const projectCards = useMemo(() => {
    const projectNames = [...new Set(STUDENTS.map((student) => student.project))];

    return projectNames.map((project) => {
      const records = STUDENTS.filter((student) => student.project === project);
      return {
        project,
        total: records.length,
        active: records.filter((student) => student.status === "Active").length,
        expiring: records.filter((student) => student.status === "Expiring Soon").length,
        pending: records.filter((student) => student.status === "Pending").length,
        centers: [...new Set(records.map((student) => student.center))].join(", "),
        batches: [...new Set(records.map((student) => student.batch))].length,
        coverage: records.reduce((sum, student) => sum + student.coverage, 0),
      };
    });
  }, []);

  const selectedProjectStudents = useMemo(
    () => STUDENTS.filter((student) => student.project === selectedProject),
    [selectedProject]
  );

  const batches = useMemo(
    () => ["All", ...new Set(selectedProjectStudents.map((student) => student.batch))],
    [selectedProjectStudents]
  );

  const filteredStudents = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return selectedProjectStudents.filter((student) => {
      const searchable = [
        student.name,
        student.enrollmentId,
        student.center,
        student.batch,
        student.policyNo,
        student.provider,
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!needle || searchable.includes(needle)) &&
        (batchFilter === "All" || student.batch === batchFilter) &&
        (statusFilter === "All" || student.status === statusFilter)
      );
    });
  }, [batchFilter, search, selectedProjectStudents, statusFilter]);

  const stats = useMemo(() => ({
    total: STUDENTS.length,
    active: STUDENTS.filter((student) => student.status === "Active").length,
    expiring: STUDENTS.filter((student) => student.status === "Expiring Soon").length,
    pending: STUDENTS.filter((student) => student.status === "Pending").length,
  }), []);

  const exportColumns = useMemo(
    () => [
      { key: "name", header: "Student" },
      { key: "enrollmentId", header: "Enrollment ID" },
      { key: "project", header: "Project" },
      { key: "center", header: "Center" },
      { key: "batch", header: "Batch" },
      { key: "policyNo", header: "Policy No." },
      { key: "provider", header: "Provider" },
      {
        key: "coverage",
        header: "Coverage",
        exportValue: (student) => formatCurrency(student.coverage),
      },
      { key: "startDate", header: "Start Date" },
      { key: "endDate", header: "End Date" },
      { key: "nominee", header: "Nominee" },
      { key: "status", header: "Status" },
    ],
    []
  );

  function openProject(project) {
    setSelectedProject(project);
    setSearch("");
    setBatchFilter("All");
    setStatusFilter("All");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Student Insurance Details</h1>
          <p className="mt-1 text-sm text-white/60">
            Monitor insurance policy coverage, validity, nominees, and pending student records.
          </p>
        </div>
        {selectedProject && (
          <TableExportActions
            columns={exportColumns}
            rows={filteredStudents}
            moduleName={`${selectedProject} Insurance Details`}
            fileName={`${selectedProject.toLowerCase().replaceAll(" ", "_").replaceAll(".", "")}_insurance_details`}
            canExport
            company={{
              name: "Pantiss ERP",
              logo: "/activity.png",
            }}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Records", value: stats.total, icon: FileText, cls: "text-slate-100" },
          { label: "Active Policies", value: stats.active, icon: ShieldCheck, cls: "text-emerald-300" },
          { label: "Expiring Soon", value: stats.expiring, icon: CalendarClock, cls: "text-amber-300" },
          { label: "Pending", value: stats.pending, icon: AlertTriangle, cls: "text-slate-300" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-slate-700 bg-[#111827] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-white/60">{stat.label}</p>
                <Icon size={17} className={stat.cls} />
              </div>
              <p className={`mt-2 text-2xl font-semibold ${stat.cls}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {!selectedProject && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {projectCards.map((project) => (
            <button
              key={project.project}
              type="button"
              onClick={() => openProject(project.project)}
              className="group rounded-xl border border-slate-700 bg-[#111827] p-5 text-left transition hover:border-violet-400/60 hover:bg-white/[0.03]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-white/90">{project.project}</h2>
                  <p className="mt-1 text-xs text-slate-500">{project.centers}</p>
                </div>
                <span className="rounded-lg bg-violet-500/10 p-2 text-violet-300 transition group-hover:bg-violet-500/20">
                  <ArrowRight size={17} />
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-white/40">Students</p>
                  <p className="mt-1 text-xl font-semibold text-slate-100">{project.total}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-white/40">Batches</p>
                  <p className="mt-1 text-xl font-semibold text-slate-100">{project.batches}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-white/40">Active</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-300">{project.active}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-white/40">Pending</p>
                  <p className="mt-1 text-lg font-semibold text-amber-300">{project.pending + project.expiring}</p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-slate-700/70 bg-[#0b1220] px-3 py-2">
                <p className="text-[11px] uppercase tracking-wider text-white/40">Coverage Value</p>
                <p className="mt-1 text-sm font-medium text-white/80">{formatCurrency(project.coverage)}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedProject && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700 bg-[#111827] p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-violet-300">Selected Project</p>
              <h2 className="mt-1 text-lg font-semibold text-white/90">{selectedProject}</h2>
            </div>
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-white/70 transition hover:border-violet-400/50 hover:text-white"
            >
              <ArrowLeft size={15} />
              Project Catalogue
            </button>
          </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-[260px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search student, policy no., provider..."
            className="w-full rounded-lg border border-slate-700 bg-[#111827] py-2 pl-10 pr-3 text-sm text-white/90 outline-none transition focus:border-violet-400"
          />
        </label>
        <select
          value={batchFilter}
          onChange={(event) => setBatchFilter(event.target.value)}
          className="rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-sm text-white/90 outline-none"
        >
          {batches.map((batch) => (
            <option key={batch} value={batch}>
              {batch === "All" ? "All Batches" : batch}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-sm text-white/90 outline-none"
        >
          <option>All</option>
          <option>Active</option>
          <option>Expiring Soon</option>
          <option>Pending</option>
          <option>Expired</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-700 bg-[#111827]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-sm">
            <thead className="bg-[#0b1220] text-white/60">
              <tr>
                <th className="p-4 text-left">Student</th>
                <th className="p-4 text-left">Center / Batch</th>
                <th className="p-4 text-left">Policy Details</th>
                <th className="p-4 text-left">Coverage</th>
                <th className="p-4 text-left">Validity</th>
                <th className="p-4 text-left">Nominee</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-t border-slate-700/50 transition hover:bg-white/[0.02]">
                  <td className="p-4">
                    <p className="font-medium text-white/90">{student.name}</p>
                    <p className="text-xs text-slate-500">{student.enrollmentId}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-white/80">{student.center}</p>
                    <p className="text-xs text-slate-500">{student.batch}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-white/80">{student.policyNo}</p>
                    <p className="text-xs text-slate-500">{student.provider}</p>
                  </td>
                  <td className="p-4 text-white/70">{formatCurrency(student.coverage)}</td>
                  <td className="p-4">
                    <p className="text-white/80">{student.startDate}</p>
                    <p className="text-xs text-slate-500">to {student.endDate}</p>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 text-white/70">
                      <BadgeCheck size={15} className="text-violet-300" />
                      {student.nominee}
                    </span>
                  </td>
                  <td className="p-4"><StatusPill status={student.status} /></td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-slate-500">
                    No insurance records match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
