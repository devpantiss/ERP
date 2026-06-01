import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Ban, CheckCircle2, Clock, FolderKanban, History, Search, ShieldCheck, Wallet } from "lucide-react";
import { buildSalaryWorkEvidence, SalaryWorkEvidence } from "../shared/salaryWorkEvidence";
import { Breadcrumb, PageHeader } from "./SuperAdminSharedComponents";
import { useSalaryStore } from "../../stores/salaryStore";
import { selectSalaryRows } from "../../stores/selectors/salarySelectors";
import SlidePanel from "../../components/common/SlidePanel";
import AuditTrail from "../../components/common/AuditTrail";
import { buildSalaryAuditTrail } from "../../utils/auditTrailHelpers";

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function buildRows(salaries) {
  return selectSalaryRows(salaries)
    .filter((salary) => ["Approved", "Paid", "Rejected"].includes(salary.status))
    .map((salary, index) => ({
      ...salary,
      evidence: buildSalaryWorkEvidence(salary, index),
      superStatus: salary.status === "Paid" ? "Paid" : salary.status === "Rejected" ? "Returned" : "Pending Review",
      adminApprovedOn: salary.decidedOn || "2026-05-20",
    }));
}

export default function SuperAdminSalaryApprovals() {
  const { salaries, fetchSalaries, updateSalary } = useSalaryStore();
  const [selectedProject, setSelectedProject] = useState(null);
  const [search, setSearch] = useState("");
  const [auditRow, setAuditRow] = useState(null);

  useEffect(() => {
    fetchSalaries();
  }, [fetchSalaries]);

  const rows = useMemo(() => buildRows(salaries), [salaries]);
  const projects = useMemo(() => summarizeProjects(rows), [rows]);
  const projectRows = useMemo(() => {
    if (!selectedProject) return [];
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (row.project !== selectedProject) return false;
      if (!query) return true;
      return `${row.id} ${row.employee} ${row.role} ${row.center}`.toLowerCase().includes(query);
    });
  }, [rows, search, selectedProject]);
  const totals = useMemo(() => summarizeTotals(rows), [rows]);

  const decide = (id, status) => {
    updateSalary(id, {
      status,
      superAdminDecidedOn: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Wallet}
        title={selectedProject ? `${selectedProject} Salary Approvals` : "Salary Approvals"}
        subtitle={
          selectedProject
            ? "Final review of salary records already approved by Admin."
            : "Project-wise salary records appear here only after Admin approval."
        }
      />
      <Breadcrumb items={selectedProject ? ["Super Admin", "Salary Approvals", selectedProject] : ["Super Admin", "Salary Approvals"]} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={ShieldCheck} label="Admin Approved" value={totals.total} />
        <Metric icon={Clock} label="Pending Final Review" value={totals.pending} />
        <Metric icon={CheckCircle2} label="Paid" value={totals.paid} />
      </div>

      {!selectedProject ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <button key={project.name} type="button" onClick={() => setSelectedProject(project.name)} className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 text-left transition hover:border-red-400/35 hover:bg-[#151e2f]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-300"><FolderKanban size={20} /></div>
                <div className="min-w-0">
                  <p className="truncate text-base font-black text-white">{project.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{project.count} admin-approved records</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <MiniStat label="Pending" value={project.pending} accent="amber" />
                <MiniStat label="Paid" value={project.paid} accent="emerald" />
                <MiniStat label="Value" value={formatCurrency(project.value)} accent="emerald" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <section className="space-y-5">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={() => { setSelectedProject(null); setSearch(""); }} className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2 text-xs font-black text-white/70 transition hover:border-red-400/40 hover:text-white">
              <ArrowLeft size={14} />
              Back to Projects
            </button>
            <label className="relative w-full sm:max-w-sm">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employees..." className="w-full rounded-xl border border-slate-700 bg-[#0b1220] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-red-400/60" />
            </label>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1760px] table-fixed text-left text-sm">
                <colgroup>
                  <col className="w-[240px]" />
                  <col className="w-[280px]" />
                  <col className="w-[130px]" />
                  <col className="w-[140px]" />
                  <col className="w-[170px]" />
                  <col className="w-[210px]" />
                  <col className="w-[400px]" />
                  <col className="w-[180px]" />
                  <col className="w-[210px]" />
                </colgroup>
                <thead className="bg-[#0b1220] text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    {["Employee", "Center", "Month", "Attendance", "Salary", "Admin Clearance", "Work Done / Proof", "Super Admin", "Action"].map((header) => (
                      <th key={header} className="px-6 py-4">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {projectRows.map((row) => (
                    <tr key={row.id} className="hover:bg-white/[0.03]">
                      <td className="px-6 py-5 align-top">
                        <p className="font-black text-white">{row.employee}</p>
                        <p className="text-xs text-slate-500">{row.role}</p>
                      </td>
                      <td className="px-6 py-5 align-top leading-6 text-slate-400">{row.center}</td>
                      <td className="px-6 py-5 align-top text-slate-400">{row.month}</td>
                      <td className="px-6 py-5 align-top text-white">{row.attendance}%</td>
                      <td className="px-6 py-5 align-top">
                        <p className="font-black text-emerald-300">{formatCurrency(row.amount)}</p>
                        <p className="mt-1 font-mono text-xs text-slate-500">{row.id}</p>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <Status status="Admin Approved" tone="sky" />
                        <p className="mt-2 text-xs text-slate-500">{row.adminApprovedOn}</p>
                      </td>
                      <td className="px-6 py-5 align-top"><SalaryWorkEvidence evidence={row.evidence} tone="red" /></td>
                      <td className="px-6 py-5 align-top"><Status status={row.superStatus} /></td>
                      <td className="px-6 py-5 align-top">
                        {row.superStatus === "Pending Review" ? (
                          <div className="inline-flex min-w-[145px] flex-col gap-2">
                            <button type="button" onClick={() => decide(row.id, "PAID")} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/15 px-4 py-2.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/25"><CheckCircle2 size={13} />Mark Paid</button>
                            <button type="button" onClick={() => decide(row.id, "REJECTED")} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-500/15 px-4 py-2.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/25"><Ban size={13} />Return</button>
                            <button type="button" onClick={() => setAuditRow(row)} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/20">
                              <History size={13} /> Audit Trail
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <span className="text-xs text-slate-500">Closed</span>
                            <button type="button" onClick={() => setAuditRow(row)} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/20">
                              <History size={13} /> Audit Trail
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <SlidePanel
        open={Boolean(auditRow)}
        onClose={() => setAuditRow(null)}
        title="Salary — Audit Trail"
        width="md"
      >
        {auditRow && (
          <div className="space-y-5">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-white">{auditRow.employee}</p>
              <p className="mt-1 text-xs text-white/45">{auditRow.id} • {auditRow.center} • {auditRow.month}</p>
            </div>
            <AuditTrail entries={buildSalaryAuditTrail(auditRow)} tone="red" />
          </div>
        )}
      </SlidePanel>
    </div>
  );
}

function summarizeProjects(rows) {
  return Array.from(
    rows.reduce((map, row) => {
      const current = map.get(row.project) || { name: row.project, count: 0, pending: 0, paid: 0, value: 0 };
      map.set(row.project, {
        ...current,
        count: current.count + 1,
        pending: current.pending + (row.superStatus === "Pending Review" ? 1 : 0),
        paid: current.paid + (row.superStatus === "Paid" ? 1 : 0),
        value: current.value + row.amount,
      });
      return map;
    }, new Map()).values()
  );
}

function summarizeTotals(rows) {
  return {
    total: rows.length,
    pending: rows.filter((row) => row.superStatus === "Pending Review").length,
    paid: rows.filter((row) => row.superStatus === "Paid").length,
  };
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-300"><Icon size={20} /></div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

function MiniStat({ label, value, accent = "slate" }) {
  const cls = accent === "amber" ? "text-amber-300" : accent === "emerald" ? "text-emerald-300" : "text-white";
  return <div className="rounded-xl border border-slate-700/50 bg-[#0b1220] px-3 py-2"><p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p><p className={`mt-1 truncate text-sm font-black ${cls}`}>{value}</p></div>;
}

function Status({ status, tone }) {
  const cls = tone === "sky"
    ? "border-sky-400/25 bg-sky-500/10 text-sky-300"
    : status === "Paid"
      ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-300"
      : status === "Returned"
        ? "border-red-400/25 bg-red-500/10 text-red-300"
        : "border-amber-400/25 bg-amber-500/10 text-amber-300";
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${cls}`}>{status}</span>;
}
