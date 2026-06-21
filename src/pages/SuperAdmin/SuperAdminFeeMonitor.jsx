import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  IndianRupee,
  Search,
  Filter,
  ArrowLeft,
  ArrowRight,
  Eye,
  Download,
  FileText,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  AlertTriangle,
  Target,
  CreditCard,
  Banknote,
  BarChart3,
  Building2,
  Layers,
} from "lucide-react";
import { SA_PROJECTS } from "./superAdminData";
import {
  FEE_TARGETS,
  TRAINING_MONTHS,
  getEntriesForBatchMonth,
  getBatchMonthSummary,
  getOverallMonthStats,
  getProjectSummary,
} from "../Admin/feeCollectionData";

/* ═══════════════════════════════════════════════════════════════
   SUPER ADMIN — FEE COLLECTION MONITOR (Read-Only)
   ═══════════════════════════════════════════════════════════════ */

function formatCurrency(value) {
  if (!value && value !== 0) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMonth(monthStr) {
  const found = TRAINING_MONTHS.find((m) => m.value === monthStr);
  return found ? found.label : monthStr;
}

/* ── Status pill ── */
function StatusPill({ status }) {
  const styles = {
    Verified: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    Pending: "border-amber-500/25 bg-amber-500/10 text-amber-300",
    Rejected: "border-red-500/25 bg-red-500/10 text-red-300",
  };
  const icons = {
    Verified: <CheckCircle2 size={12} />,
    Pending: <Clock size={12} />,
    Rejected: <XCircle size={12} />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${styles[status] || styles.Pending}`}
    >
      {icons[status]}
      {status}
    </span>
  );
}

/* ── Payment mode badge ── */
function ModeBadge({ mode }) {
  const isOnline = mode === "Online";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold ${
        isOnline
          ? "border-sky-500/25 bg-sky-500/10 text-sky-300"
          : "border-orange-500/25 bg-orange-500/10 text-orange-300"
      }`}
    >
      {isOnline ? <CreditCard size={12} /> : <Banknote size={12} />}
      {mode}
    </span>
  );
}

/* ── Stat card ── */
function StatCard({ label, value, icon: Icon, tone = "text-white" }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-[#111827] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/40">
          {label}
        </p>
        <Icon size={17} className={tone} />
      </div>
      <p className={`mt-2 text-2xl font-black ${tone}`}>{value}</p>
    </div>
  );
}

/* ── Progress bar ── */
function ProgressBar({ percent, height = "h-2" }) {
  const tone =
    percent >= 80
      ? "bg-emerald-400"
      : percent >= 50
        ? "bg-amber-400"
        : "bg-red-400";
  return (
    <div className={`${height} w-full overflow-hidden rounded-full bg-slate-700`}>
      <div
        className={`${height} rounded-full transition-all duration-500 ${tone}`}
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
}

/* ── Collection rate badge ── */
function RateBadge({ percent }) {
  const cls =
    percent >= 80
      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
      : percent >= 50
        ? "border-amber-500/25 bg-amber-500/10 text-amber-300"
        : "border-red-500/25 bg-red-500/10 text-red-300";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-black ${cls}`}
    >
      <TrendingUp size={14} />
      {percent}%
    </span>
  );
}

/* ── Select field ── */
function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-700 bg-[#0b1220] px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-red-400/60"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ── Proof preview overlay (read-only) ── */
function ProofPreviewOverlay({ entry, onClose }) {
  if (!entry?.proofFile) return null;
  const isImage = entry.proofFile.type?.startsWith("image/");

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex justify-end bg-black/60"
      onMouseDown={onClose}
    >
      <aside
        className="h-full w-full max-w-3xl overflow-y-auto border-l border-slate-700 bg-[#111827] p-6 shadow-2xl shadow-black/70"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-700/70 pb-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-400">
              Payment Proof
            </p>
            <h2 className="mt-1 text-2xl font-black text-white">
              {entry.studentName}
            </h2>
            <p className="mt-1 text-sm font-bold text-slate-500">
              {entry.proofFile.name} · {entry.paymentMode} ·{" "}
              {entry.transactionRef}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close preview"
          >
            <X size={18} />
          </button>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-[#0b1220] p-4">
          {isImage ? (
            <img
              src={entry.proofFile.url}
              alt={entry.proofFile.name}
              className="max-h-[72vh] w-full rounded-xl object-contain"
            />
          ) : (
            <div className="flex h-[72vh] flex-col items-center justify-center gap-4 rounded-xl border border-slate-700 bg-slate-800/40">
              <FileText size={48} className="text-slate-500" />
              <p className="text-sm font-bold text-white/50">
                PDF Document: {entry.proofFile.name}
              </p>
              <a
                href={entry.proofFile.url}
                download={entry.proofFile.name}
                className="inline-flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-200 transition hover:bg-red-500/20"
              >
                <Download size={15} />
                Download PDF
              </a>
            </div>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl border border-slate-700 bg-[#0b1220] p-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/40">
              Amount
            </p>
            <p className="mt-1 text-lg font-black text-white">
              {formatCurrency(entry.amount)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/40">
              Payment Mode
            </p>
            <p className="mt-1">
              <ModeBadge mode={entry.paymentMode} />
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/40">
              Transaction Ref
            </p>
            <p className="mt-1 font-mono text-sm font-bold text-white/70">
              {entry.transactionRef}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/40">
              Status
            </p>
            <p className="mt-1">
              <StatusPill status={entry.status} />
            </p>
          </div>
        </div>
      </aside>
    </div>,
    document.body
  );
}

/* ── Student entries detail drawer ── */
function BatchDetailDrawer({ batchId, batchLabel, month, onClose }) {
  const entries = useMemo(
    () => getEntriesForBatchMonth(batchId, month),
    [batchId, month]
  );
  const [search, setSearch] = useState("");
  const [previewEntry, setPreviewEntry] = useState(null);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return entries;
    return entries.filter(
      (e) =>
        e.studentName.toLowerCase().includes(needle) ||
        e.studentId.toLowerCase().includes(needle) ||
        e.transactionRef.toLowerCase().includes(needle)
    );
  }, [entries, search]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9998] flex justify-end bg-black/60"
      onMouseDown={onClose}
    >
      <aside
        className="h-full w-full max-w-5xl overflow-y-auto border-l border-slate-700 bg-[#0f172a] shadow-2xl shadow-black/70"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Drawer header */}
        <div className="sticky top-0 z-10 border-b border-slate-700/70 bg-[#0f172a] px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-400">
                Student Fee Entries
              </p>
              <h2 className="mt-1 text-xl font-black text-white">
                {batchLabel} · {formatMonth(month)}
              </h2>
              <p className="mt-1 text-sm font-bold text-white/45">
                {entries.length} total records
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-4">
            <div className="relative max-w-sm">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student, ID, or ref..."
                className="w-full rounded-xl border border-slate-700 bg-[#111827] py-2.5 pl-10 pr-4 text-sm font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/60"
              />
            </div>
          </div>
        </div>

        {/* Entries table */}
        <div className="p-6">
          <div className="overflow-hidden rounded-2xl border border-slate-700 bg-[#111827]">
            <div className="overflow-x-auto">
              <table
                className="w-full text-left text-sm"
                style={{ minWidth: 900 }}
              >
                <thead className="bg-[#0b1220] text-xs font-black uppercase tracking-[0.14em] text-white/45">
                  <tr>
                    <th className="px-5 py-3.5">Student</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Mode</th>
                    <th className="px-5 py-3.5">Transaction Ref</th>
                    <th className="px-5 py-3.5">Proof</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {filtered.map((entry) => (
                    <tr
                      key={entry.id}
                      className="transition hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-white">
                          {entry.studentName}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-white/35">
                          {entry.studentId}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-white/80">
                        {formatCurrency(entry.amount)}
                      </td>
                      <td className="px-5 py-3.5">
                        <ModeBadge mode={entry.paymentMode} />
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-white/50">
                        {entry.transactionRef}
                      </td>
                      <td className="px-5 py-3.5">
                        {entry.proofFile ? (
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreviewEntry(entry)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-[11px] font-bold text-white/60 transition hover:border-red-400/40 hover:text-red-300"
                            >
                              <Eye size={11} />
                              View
                            </button>
                            <a
                              href={entry.proofFile.url}
                              download={entry.proofFile.name}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-[11px] font-bold text-white/60 transition hover:border-white/30 hover:text-white"
                            >
                              <Download size={11} />
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-white/25">
                            Not uploaded
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusPill status={entry.status} />
                      </td>
                      <td className="px-5 py-3.5 text-xs text-white/40">
                        {entry.enteredOn}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-sm font-bold text-white/35"
                      >
                        No entries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </aside>

      {previewEntry && (
        <ProofPreviewOverlay
          entry={previewEntry}
          onClose={() => setPreviewEntry(null)}
        />
      )}
    </div>,
    document.body
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function SuperAdminFeeMonitor() {
  const [selectedMonth, setSelectedMonth] = useState("2026-04");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [search, setSearch] = useState("");
  const [detailDrawer, setDetailDrawer] = useState(null); // { batchId, batchLabel }

  /* ── Overall stats ── */
  const overallStats = useMemo(
    () => getOverallMonthStats(selectedMonth),
    [selectedMonth]
  );

  /* ── Project cards ── */
  const projectCards = useMemo(() => {
    return SA_PROJECTS.map((project) => {
      const summary = getProjectSummary(project.id, selectedMonth);
      return {
        ...project,
        ...summary,
        fundingAgency: project.fundingAgency,
      };
    });
  }, [selectedMonth]);

  /* ── Selected project's batch rows ── */
  const selectedProject = SA_PROJECTS.find((p) => p.id === selectedProjectId);

  const batchRows = useMemo(() => {
    if (!selectedProject) return [];

    const rows = [];
    selectedProject.centers.forEach((center) => {
      center.batches.forEach((batch) => {
        const summary = getBatchMonthSummary(batch.id, selectedMonth);
        const target = FEE_TARGETS.find((t) => t.batchId === batch.id);
        if (!summary || !target) return;

        rows.push({
          batchId: batch.id,
          batchLabel: batch.label,
          centerName: center.name,
          jobRole: batch.jobRole,
          trainer: batch.trainer,
          totalStudents: target.totalStudents,
          feePerStudent: target.feePerStudent,
          monthlyTarget: summary.monthlyTarget,
          totalCollected: summary.totalCollected,
          pendingAmount: summary.pendingAmount,
          studentsPaid: summary.studentsPaid,
          studentsVerified: summary.studentsVerified,
          collectionRate: summary.collectionRate,
        });
      });
    });

    return rows;
  }, [selectedProject, selectedMonth]);

  const filteredBatchRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return batchRows;
    return batchRows.filter(
      (r) =>
        r.batchLabel.toLowerCase().includes(needle) ||
        r.centerName.toLowerCase().includes(needle) ||
        r.trainer.toLowerCase().includes(needle) ||
        r.jobRole.toLowerCase().includes(needle)
    );
  }, [batchRows, search]);

  const projectSummary = useMemo(() => {
    if (!selectedProjectId) return null;
    return getProjectSummary(selectedProjectId, selectedMonth);
  }, [selectedProjectId, selectedMonth]);

  return (
    <section className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/25 bg-red-500/10 text-red-400">
              <BarChart3 size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-100">
                Fee Collection Monitor
              </h1>
              <p className="mt-1 text-sm text-white/55">
                Track and monitor fee collection progress across all projects
                and batches.
              </p>
            </div>
          </div>
        </div>

        {/* Month selector */}
        <div className="w-48">
          <SelectField
            label="Month"
            value={selectedMonth}
            onChange={(m) => {
              setSelectedMonth(m);
              setSearch("");
            }}
            options={TRAINING_MONTHS}
          />
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total Target"
          value={formatCurrency(overallStats.totalTarget)}
          icon={Target}
          tone="text-white"
        />
        <StatCard
          label="Total Collected"
          value={formatCurrency(overallStats.totalCollected)}
          icon={IndianRupee}
          tone="text-emerald-300"
        />
        <StatCard
          label="Collection Rate"
          value={`${overallStats.collectionRate}%`}
          icon={TrendingUp}
          tone={
            overallStats.collectionRate >= 80
              ? "text-emerald-300"
              : overallStats.collectionRate >= 50
                ? "text-amber-300"
                : "text-red-300"
          }
        />
        <StatCard
          label="Overdue Batches"
          value={overallStats.overdueBatches}
          icon={AlertTriangle}
          tone={overallStats.overdueBatches > 0 ? "text-red-300" : "text-slate-400"}
        />
      </div>

      {/* ─── Project Cards View ─── */}
      {!selectedProjectId && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projectCards.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => {
                setSelectedProjectId(project.id);
                setSearch("");
              }}
              className="group rounded-2xl border border-slate-700 bg-[#111827] p-5 text-left transition hover:border-red-400/40 hover:bg-white/[0.02]"
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-white/90">
                    {project.name}
                  </h2>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {project.fundingAgency}
                  </p>
                </div>
                <span className="rounded-lg bg-red-500/10 p-2 text-red-400 transition group-hover:bg-red-500/20">
                  <ArrowRight size={17} />
                </span>
              </div>

              {/* Progress */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-bold text-white/45">
                  <span>Collection Progress</span>
                  <RateBadge percent={project.collectionRate} />
                </div>
                <div className="mt-2">
                  <ProgressBar percent={project.collectionRate} height="h-2.5" />
                </div>
              </div>

              {/* Metrics */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-700/60 bg-[#0b1220] px-3 py-2.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
                    Target
                  </p>
                  <p className="mt-1 text-sm font-black text-white/80">
                    {formatCurrency(project.totalTarget)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-700/60 bg-[#0b1220] px-3 py-2.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
                    Collected
                  </p>
                  <p className="mt-1 text-sm font-black text-emerald-300">
                    {formatCurrency(project.totalCollected)}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 flex items-center gap-4 text-xs font-bold text-white/40">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 size={12} />
                  {project.centerCount} Centers
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Layers size={12} />
                  {project.batchCount} Batches
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ─── Project Detail View ─── */}
      {selectedProjectId && selectedProject && (
        <>
          {/* Breadcrumb / back */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-[#111827] p-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-red-400">
                {selectedProject.name}
              </p>
              <h2 className="mt-1 text-lg font-black text-white">
                {selectedProject.fundingAgency} ·{" "}
                {formatMonth(selectedMonth)}
              </h2>
              {projectSummary && (
                <p className="mt-1 text-xs font-bold text-white/45">
                  {projectSummary.centers} · {projectSummary.batchCount} batches
                  · Collection:{" "}
                  <span
                    className={
                      projectSummary.collectionRate >= 80
                        ? "text-emerald-300"
                        : projectSummary.collectionRate >= 50
                          ? "text-amber-300"
                          : "text-red-300"
                    }
                  >
                    {projectSummary.collectionRate}%
                  </span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {projectSummary && (
                <RateBadge percent={projectSummary.collectionRate} />
              )}
              <button
                type="button"
                onClick={() => {
                  setSelectedProjectId(null);
                  setSearch("");
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-bold text-white/70 transition hover:border-red-400/40 hover:text-white"
              >
                <ArrowLeft size={15} />
                All Projects
              </button>
            </div>
          </div>

          {/* Project summary cards */}
          {projectSummary && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard
                label="Monthly Target"
                value={formatCurrency(projectSummary.totalTarget)}
                icon={Target}
                tone="text-white"
              />
              <StatCard
                label="Collected"
                value={formatCurrency(projectSummary.totalCollected)}
                icon={IndianRupee}
                tone="text-emerald-300"
              />
              <StatCard
                label="Pending"
                value={formatCurrency(
                  projectSummary.totalTarget - projectSummary.totalCollected
                )}
                icon={Clock}
                tone="text-amber-300"
              />
              <StatCard
                label="Rate"
                value={`${projectSummary.collectionRate}%`}
                icon={TrendingUp}
                tone={
                  projectSummary.collectionRate >= 80
                    ? "text-emerald-300"
                    : projectSummary.collectionRate >= 50
                      ? "text-amber-300"
                      : "text-red-300"
                }
              />
            </div>
          )}

          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative min-w-[280px] flex-1 max-w-md">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search batch, center, trainer..."
                className="w-full rounded-xl border border-slate-700 bg-[#111827] py-2.5 pl-10 pr-4 text-sm font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/60"
              />
            </div>
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2.5 text-xs font-black text-white/50">
              <Filter size={14} className="text-red-400" />
              {filteredBatchRows.length} batches
            </span>
          </div>

          {/* Batch table */}
          <section className="overflow-hidden rounded-2xl border border-slate-700 bg-[#111827]">
            <div className="overflow-x-auto">
              <table
                className="w-full text-left text-sm"
                style={{ minWidth: 1100 }}
              >
                <thead className="bg-[#0b1220] text-xs font-black uppercase tracking-[0.14em] text-white/45">
                  <tr>
                    <th className="px-5 py-4">Batch</th>
                    <th className="px-5 py-4">Center</th>
                    <th className="px-5 py-4">Job Role</th>
                    <th className="px-5 py-4">Trainer</th>
                    <th className="px-5 py-4">Target (₹)</th>
                    <th className="px-5 py-4">Collected (₹)</th>
                    <th className="px-5 py-4">Collection %</th>
                    <th className="px-5 py-4">Students Paid</th>
                    <th className="px-5 py-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {filteredBatchRows.map((row) => (
                    <tr
                      key={row.batchId}
                      className="transition hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <p className="font-black text-white">{row.batchLabel}</p>
                        <p className="mt-0.5 font-mono text-[11px] text-white/30">
                          {row.batchId}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-bold text-white/70">
                        {row.centerName}
                      </td>
                      <td className="px-5 py-4 text-white/60">{row.jobRole}</td>
                      <td className="px-5 py-4 text-white/60">{row.trainer}</td>
                      <td className="px-5 py-4 font-bold text-white/80">
                        {formatCurrency(row.monthlyTarget)}
                      </td>
                      <td className="px-5 py-4 font-bold text-emerald-300">
                        {formatCurrency(row.totalCollected)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="min-w-24">
                          <div className="flex items-center justify-between text-xs font-black">
                            <span
                              className={
                                row.collectionRate >= 80
                                  ? "text-emerald-300"
                                  : row.collectionRate >= 50
                                    ? "text-amber-300"
                                    : "text-red-300"
                              }
                            >
                              {row.collectionRate}%
                            </span>
                          </div>
                          <div className="mt-1.5">
                            <ProgressBar
                              percent={row.collectionRate}
                              height="h-1.5"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-bold text-white/50">
                          <span className="text-white">
                            {row.studentsVerified}
                          </span>{" "}
                          / {row.totalStudents}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            setDetailDrawer({
                              batchId: row.batchId,
                              batchLabel: row.batchLabel,
                            })
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-white/50 transition hover:border-red-400/40 hover:text-red-300"
                        >
                          <Eye size={13} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredBatchRows.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-5 py-12 text-center text-sm font-bold text-white/35"
                      >
                        No batches match the search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* Detail drawer */}
      {detailDrawer && (
        <BatchDetailDrawer
          batchId={detailDrawer.batchId}
          batchLabel={detailDrawer.batchLabel}
          month={selectedMonth}
          onClose={() => setDetailDrawer(null)}
        />
      )}
    </section>
  );
}
