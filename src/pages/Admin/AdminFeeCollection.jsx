import { useMemo, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  IndianRupee,
  Search,
  Upload,
  Eye,
  Download,
  FileText,
  X,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Target,
  CreditCard,
  Banknote,
  ChevronDown,
  Trash2,
  Paperclip,
  Check,
  Hash,
  Save,
} from "lucide-react";
import { SA_PROJECTS } from "../SuperAdmin/superAdminData";
import {
  FEE_TARGETS,
  TRAINING_MONTHS,
  PAYMENT_MODES,
  getEntriesForBatchMonth,
  getBatchMonthSummary,
} from "./feeCollectionData";

/* ═══════════════════════════════════════════════════════════════
   ADMIN FEE COLLECTION — Zoho Projects Style
   Inline spreadsheet editing, no modals, clean productivity UI
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

/* ── Inline status dropdown ── */
function InlineStatusSelect({ value, onChange }) {
  const colors = {
    Verified: { bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-500/30" },
    Pending: { bg: "bg-amber-500/15", text: "text-amber-300", border: "border-amber-500/30" },
    Rejected: { bg: "bg-red-500/15", text: "text-red-300", border: "border-red-500/30" },
  };
  const c = colors[value] || colors.Pending;
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-md border ${c.border} ${c.bg} ${c.text} px-2 py-1 text-[11px] font-bold outline-none cursor-pointer transition hover:brightness-110`}
    >
      <option value="Pending">Pending</option>
      <option value="Verified">Verified</option>
      <option value="Rejected">Rejected</option>
    </select>
  );
}

/* ── Inline payment mode toggle ── */
function InlineModeToggle({ value, onChange }) {
  return (
    <div className="inline-flex rounded-md border border-slate-700 overflow-hidden">
      <button
        type="button"
        onClick={() => onChange("Online")}
        className={`flex items-center gap-1 px-2 py-1 text-[11px] font-bold transition ${
          value === "Online"
            ? "bg-sky-500/20 text-sky-300"
            : "bg-transparent text-white/30 hover:text-white/50"
        }`}
      >
        <CreditCard size={10} />
        Online
      </button>
      <button
        type="button"
        onClick={() => onChange("Offline")}
        className={`flex items-center gap-1 px-2 py-1 text-[11px] font-bold border-l border-slate-700 transition ${
          value === "Offline"
            ? "bg-orange-500/20 text-orange-300"
            : "bg-transparent text-white/30 hover:text-white/50"
        }`}
      >
        <Banknote size={10} />
        Offline
      </button>
    </div>
  );
}

/* ── Compact proof cell ── */
function InlineProofCell({ entry, onUpload, onPreview }) {
  if (entry.proofFile) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPreview(entry)}
          className="inline-flex items-center gap-1 rounded border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 transition hover:bg-emerald-500/20"
          title={entry.proofFile.name}
        >
          <Paperclip size={9} />
          <span className="max-w-[60px] truncate">{entry.proofFile.name.split('.')[0]}</span>
        </button>
        <label className="cursor-pointer rounded border border-slate-600 p-0.5 text-white/30 transition hover:border-white/30 hover:text-white/50" title="Replace">
          <Upload size={10} />
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => onUpload(entry.id, e.target.files?.[0])}
          />
        </label>
      </div>
    );
  }

  return (
    <label className="inline-flex cursor-pointer items-center gap-1 rounded border border-dashed border-slate-600 px-2 py-1 text-[10px] font-bold text-white/30 transition hover:border-violet-400/40 hover:text-violet-300">
      <Upload size={10} />
      Attach
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => onUpload(entry.id, e.target.files?.[0])}
      />
    </label>
  );
}

/* ── Progress bar ── */
function ProgressBar({ percent, height = "h-1.5" }) {
  const tone = percent >= 80 ? "bg-emerald-400" : percent >= 50 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className={`${height} w-full overflow-hidden rounded-full bg-slate-700/60`}>
      <div
        className={`${height} rounded-full transition-all duration-500 ${tone}`}
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
}

/* ── Proof preview overlay (kept as side panel for detail view) ── */
function ProofPreviewOverlay({ entry, onClose }) {
  if (!entry?.proofFile) return null;
  const isImage = entry.proofFile.type?.startsWith("image/");

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex justify-end bg-black/50 backdrop-blur-[2px]"
      onMouseDown={onClose}
    >
      <aside
        className="h-full w-full max-w-2xl overflow-y-auto border-l border-slate-700/80 bg-[#0f1623] shadow-2xl shadow-black/70"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Panel header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700/60 bg-[#0f1623] px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
              <FileText size={15} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{entry.studentName}</p>
              <p className="text-[11px] text-white/40">{entry.proofFile.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/30 transition hover:bg-slate-800 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Preview body */}
        <div className="p-5">
          <div className="rounded-xl border border-slate-700/50 bg-[#080d17] p-3">
            {isImage ? (
              <img
                src={entry.proofFile.url}
                alt={entry.proofFile.name}
                className="max-h-[60vh] w-full rounded-lg object-contain"
              />
            ) : (
              <div className="flex h-[50vh] flex-col items-center justify-center gap-3 rounded-lg border border-slate-700/40 bg-slate-800/30">
                <FileText size={40} className="text-slate-600" />
                <p className="text-sm text-white/40">{entry.proofFile.name}</p>
                <a
                  href={entry.proofFile.url}
                  download={entry.proofFile.name}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-2 text-xs font-bold text-violet-200 transition hover:bg-violet-500/20"
                >
                  <Download size={13} />
                  Download
                </a>
              </div>
            )}
          </div>

          {/* Details grid */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: "Amount", val: formatCurrency(entry.amount) },
              { label: "Mode", val: entry.paymentMode },
              { label: "Ref", val: entry.transactionRef },
              { label: "Status", val: entry.status },
              { label: "Date", val: entry.enteredOn },
              { label: "Uploaded", val: entry.proofFile.uploadedOn },
            ].map((d) => (
              <div
                key={d.label}
                className="rounded-lg border border-slate-700/40 bg-[#111827] px-3 py-2"
              >
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/30">
                  {d.label}
                </p>
                <p className="mt-0.5 text-xs font-bold text-white/80">{d.val}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>,
    document.body
  );
}

/* ── Inline new row ── */
function InlineNewRow({ batch, month, onAdd, onCancel, colSpan }) {
  const candidates = batch?.candidates || [];
  const target = FEE_TARGETS.find((t) => t.batchId === batch?.id);
  const feeAmount = target?.feePerStudent || 1200;

  const [studentId, setStudentId] = useState(candidates[0]?.id || "");
  const [amount, setAmount] = useState(feeAmount);
  const [paymentMode, setPaymentMode] = useState("Online");
  const [transactionRef, setTransactionRef] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const refInput = useRef(null);

  const selectedStudent = candidates.find((c) => c.id === studentId);

  function handleSave() {
    if (!studentId || !amount || !transactionRef) return;
    onAdd({
      studentId,
      studentName: selectedStudent?.name || "Unknown",
      amount: Number(amount),
      paymentMode,
      transactionRef,
      proofFile: proofFile
        ? {
            name: proofFile.name,
            type: proofFile.type,
            url: URL.createObjectURL(proofFile),
            uploadedOn: new Date().toISOString().split("T")[0],
          }
        : null,
      month,
    });
  }

  const canSave = studentId && amount && transactionRef;

  return (
    <tr className="bg-violet-500/[0.04] border-t-2 border-violet-500/30">
      {/* # */}
      <td className="px-3 py-2.5 text-center">
        <div className="flex h-5 w-5 items-center justify-center rounded bg-violet-500/20 text-[10px] font-bold text-violet-300 mx-auto">
          <Plus size={10} />
        </div>
      </td>
      {/* Student */}
      <td className="px-3 py-2.5">
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-full min-w-[140px] rounded-md border border-violet-400/30 bg-[#0b1220] px-2 py-1.5 text-xs font-bold text-white outline-none transition focus:border-violet-400/60"
          autoFocus
        >
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </td>
      {/* Amount */}
      <td className="px-3 py-2.5">
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-white/25">₹</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full min-w-[70px] rounded-md border border-violet-400/30 bg-[#0b1220] py-1.5 pl-5 pr-2 text-xs font-bold text-white outline-none transition focus:border-violet-400/60"
          />
        </div>
      </td>
      {/* Mode */}
      <td className="px-3 py-2.5">
        <InlineModeToggle value={paymentMode} onChange={setPaymentMode} />
      </td>
      {/* Ref */}
      <td className="px-3 py-2.5">
        <input
          ref={refInput}
          value={transactionRef}
          onChange={(e) => setTransactionRef(e.target.value)}
          placeholder={paymentMode === "Online" ? "UPI/NEFT ref" : "Receipt no."}
          className="w-full min-w-[100px] rounded-md border border-violet-400/30 bg-[#0b1220] px-2 py-1.5 text-xs font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/60"
          onKeyDown={(e) => {
            if (e.key === "Enter" && canSave) handleSave();
            if (e.key === "Escape") onCancel();
          }}
        />
      </td>
      {/* Proof */}
      <td className="px-3 py-2.5">
        {proofFile ? (
          <div className="flex items-center gap-1">
            <span className="flex items-center gap-1 rounded border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
              <Paperclip size={9} />
              <span className="max-w-[50px] truncate">{proofFile.name.split('.')[0]}</span>
            </span>
            <button type="button" onClick={() => setProofFile(null)} className="text-white/25 hover:text-white/60">
              <X size={10} />
            </button>
          </div>
        ) : (
          <label className="inline-flex cursor-pointer items-center gap-1 rounded border border-dashed border-violet-400/30 px-2 py-1 text-[10px] font-bold text-violet-300/60 transition hover:border-violet-400/50 hover:text-violet-300">
            <Paperclip size={9} />
            Attach
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
            />
          </label>
        )}
      </td>
      {/* Status */}
      <td className="px-3 py-2.5">
        <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
          <Clock size={9} />
          Pending
        </span>
      </td>
      {/* Date */}
      <td className="px-3 py-2.5 text-[11px] text-white/40">
        Today
      </td>
      {/* Actions */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="rounded-md bg-violet-600 p-1.5 text-white transition hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Save (Enter)"
          >
            <Check size={12} />
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-700 p-1.5 text-white/30 transition hover:bg-slate-800 hover:text-white/60"
            title="Cancel (Esc)"
          >
            <X size={12} />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function AdminFeeCollection() {
  /* ── Build batch options ── */
  const batchOptions = useMemo(() => {
    return SA_PROJECTS.flatMap((p) =>
      p.centers.flatMap((c) =>
        c.batches.map((b) => ({
          value: b.id,
          label: `${p.name} / ${c.name} / ${b.label}`,
          batch: b,
          project: p,
          center: c,
        }))
      )
    );
  }, []);

  const [selectedBatchId, setSelectedBatchId] = useState(batchOptions[0]?.value || "");
  const [selectedMonth, setSelectedMonth] = useState("2026-04");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(() => [...getEntriesForBatchMonth(batchOptions[0]?.value || "", "2026-04")]);
  const [previewEntry, setPreviewEntry] = useState(null);
  const [showNewRow, setShowNewRow] = useState(false);

  const selectedOption = batchOptions.find((o) => o.value === selectedBatchId);
  const selectedBatch = selectedOption?.batch;
  const target = FEE_TARGETS.find((t) => t.batchId === selectedBatchId);

  /* ── Load entries when batch or month changes ── */
  const refreshEntries = useCallback((batchId, month) => {
    setEntries([...getEntriesForBatchMonth(batchId, month)]);
    setSearch("");
    setStatusFilter("All");
    setShowNewRow(false);
  }, []);

  function handleBatchChange(val) {
    setSelectedBatchId(val);
    refreshEntries(val, selectedMonth);
  }

  function handleMonthChange(val) {
    setSelectedMonth(val);
    refreshEntries(selectedBatchId, val);
  }

  /* ── Summary ── */
  const summary = useMemo(() => {
    return getBatchMonthSummary(selectedBatchId, selectedMonth) || {
      monthlyTarget: 0,
      totalCollected: 0,
      pendingAmount: 0,
      studentsPaid: 0,
      studentsVerified: 0,
      totalStudents: 0,
      collectionRate: 0,
    };
  }, [selectedBatchId, selectedMonth]);

  /* ── Filtered entries ── */
  const filteredEntries = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return entries.filter((e) => {
      const matchesStatus = statusFilter === "All" || e.status === statusFilter;
      const matchesSearch =
        !needle ||
        e.studentName.toLowerCase().includes(needle) ||
        e.studentId.toLowerCase().includes(needle) ||
        e.transactionRef.toLowerCase().includes(needle);
      return matchesStatus && matchesSearch;
    });
  }, [entries, search, statusFilter]);

  /* ── Upload proof ── */
  function handleUploadProof(entryId, file) {
    if (!file) return;
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? {
              ...e,
              proofFile: {
                name: file.name,
                type: file.type || "application/octet-stream",
                url: URL.createObjectURL(file),
                uploadedOn: new Date().toISOString().split("T")[0],
              },
            }
          : e
      )
    );
  }

  /* ── Inline status change ── */
  function handleStatusChange(entryId, status) {
    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, status } : e))
    );
  }

  /* ── Delete entry ── */
  function handleDeleteEntry(entryId) {
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  }

  /* ── Add new entry (from inline row) ── */
  function handleAddEntry(data) {
    const newEntry = {
      id: `FEE-NEW-${Date.now()}`,
      batchId: selectedBatchId,
      projectName: selectedOption?.project?.name || "",
      centerName: selectedOption?.center?.name || "",
      batchLabel: selectedBatch?.label || "",
      month: data.month,
      studentName: data.studentName,
      studentId: data.studentId,
      amount: data.amount,
      paymentMode: data.paymentMode,
      transactionRef: data.transactionRef,
      proofFile: data.proofFile,
      status: "Pending",
      enteredBy: "Admin",
      enteredOn: new Date().toISOString().split("T")[0],
    };
    setEntries((prev) => [...prev, newEntry]);
    setShowNewRow(false);
  }

  /* ── Inline mode change ── */
  function handleModeChange(entryId, mode) {
    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, paymentMode: mode } : e))
    );
  }

  const rateTone =
    summary.collectionRate >= 80
      ? "text-emerald-400"
      : summary.collectionRate >= 50
        ? "text-amber-400"
        : "text-red-400";

  return (
    <section className="space-y-0 text-white">
      {/* ─── Zoho-style Top Bar ─── */}
      <div className="rounded-t-2xl border border-slate-700/60 bg-[#111827] px-5 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: title + context */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
              <IndianRupee size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Fee Collection</h1>
              <p className="text-[11px] text-white/40">
                Record & track student fee payments · batch-wise, monthly
              </p>
            </div>
          </div>

          {/* Right: quick stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-5 rounded-lg border border-slate-700/50 bg-[#0b1220] px-4 py-2">
              <div className="text-center">
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/30">Target</p>
                <p className="text-sm font-bold text-white">{formatCurrency(summary.monthlyTarget)}</p>
              </div>
              <div className="h-6 w-px bg-slate-700/60" />
              <div className="text-center">
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/30">Collected</p>
                <p className="text-sm font-bold text-emerald-400">{formatCurrency(summary.totalCollected)}</p>
              </div>
              <div className="h-6 w-px bg-slate-700/60" />
              <div className="text-center">
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/30">Pending</p>
                <p className="text-sm font-bold text-amber-400">{formatCurrency(summary.pendingAmount)}</p>
              </div>
              <div className="h-6 w-px bg-slate-700/60" />
              <div className="text-center">
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/30">Rate</p>
                <p className={`text-sm font-bold ${rateTone}`}>{summary.collectionRate}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Toolbar (Zoho-style filter bar) ─── */}
      <div className="flex flex-wrap items-center gap-2 border-x border-slate-700/60 bg-[#0d1420] px-5 py-2.5">
        {/* Batch selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/25">Batch</span>
          <select
            value={selectedBatchId}
            onChange={(e) => handleBatchChange(e.target.value)}
            className="rounded-md border border-slate-700 bg-[#111827] px-2.5 py-1.5 text-xs font-bold text-white/80 outline-none transition focus:border-violet-400/50"
          >
            {batchOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="h-5 w-px bg-slate-700/40" />

        {/* Month */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/25">Month</span>
          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="rounded-md border border-slate-700 bg-[#111827] px-2.5 py-1.5 text-xs font-bold text-white/80 outline-none transition focus:border-violet-400/50"
          >
            {TRAINING_MONTHS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        <div className="h-5 w-px bg-slate-700/40" />

        {/* Status filter pills */}
        <div className="flex items-center gap-1">
          {["All", "Verified", "Pending", "Rejected"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-md px-2.5 py-1 text-[10px] font-bold transition ${
                statusFilter === s
                  ? "bg-violet-500/20 text-violet-300"
                  : "text-white/30 hover:text-white/50"
              }`}
            >
              {s}
              {s !== "All" && (
                <span className="ml-1 text-white/20">
                  {entries.filter((e) => e.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-44 rounded-md border border-slate-700 bg-[#111827] py-1.5 pl-7 pr-2.5 text-xs text-white/70 outline-none transition placeholder:text-slate-600 focus:border-violet-400/50 focus:w-56"
          />
        </div>

        {/* Record count */}
        <span className="rounded-md bg-slate-800/60 px-2 py-1 text-[10px] font-bold text-white/30">
          {filteredEntries.length} records
        </span>
      </div>

      {/* ─── Batch context bar ─── */}
      {target && (
        <div className="flex items-center gap-4 border-x border-slate-700/60 bg-[#0a0f1a] px-5 py-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-violet-300/80">
              {selectedOption?.project?.name}
            </span>
            <ChevronDown size={10} className="rotate-[-90deg] text-white/15" />
            <span className="text-[10px] font-bold text-white/50">
              {selectedOption?.center?.name}
            </span>
            <ChevronDown size={10} className="rotate-[-90deg] text-white/15" />
            <span className="text-[10px] font-bold text-white/50">
              {selectedBatch?.label}
            </span>
          </div>
          <div className="h-3 w-px bg-slate-700/40" />
          <span className="text-[10px] text-white/30">
            {target.jobRole} · {target.trainer} · {formatMonth(selectedMonth)}
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/30">
              <span className="font-bold text-emerald-400">{summary.studentsVerified}</span>/{summary.totalStudents} paid
            </span>
            <div className="w-20">
              <ProgressBar percent={summary.collectionRate} />
            </div>
          </div>
        </div>
      )}

      {/* ─── Spreadsheet Table ─── */}
      <div className="overflow-hidden rounded-b-2xl border border-t-0 border-slate-700/60 bg-[#111827]">
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ minWidth: 1100 }}>
            <thead>
              <tr className="border-b border-slate-700/50 bg-[#0b1220]">
                <th className="w-10 px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-white/25">
                  <Hash size={10} className="mx-auto" />
                </th>
                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white/35">Student</th>
                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white/35">Amount</th>
                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white/35">Mode</th>
                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white/35">
                  Transaction Ref
                </th>
                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white/35">Proof</th>
                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white/35">Status</th>
                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white/35">Date</th>
                <th className="w-16 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white/35"></th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry, idx) => (
                <tr
                  key={entry.id}
                  className="group border-b border-slate-700/30 transition-colors hover:bg-white/[0.02]"
                >
                  {/* Row # */}
                  <td className="px-3 py-2 text-center text-[10px] font-bold text-white/15">
                    {idx + 1}
                  </td>
                  {/* Student */}
                  <td className="px-3 py-2">
                    <p className="text-xs font-bold text-white/85">{entry.studentName}</p>
                    <p className="font-mono text-[10px] text-white/25">{entry.studentId}</p>
                  </td>
                  {/* Amount */}
                  <td className="px-3 py-2 text-xs font-bold text-white/80">
                    {formatCurrency(entry.amount)}
                  </td>
                  {/* Mode — inline toggle */}
                  <td className="px-3 py-2">
                    <InlineModeToggle
                      value={entry.paymentMode}
                      onChange={(mode) => handleModeChange(entry.id, mode)}
                    />
                  </td>
                  {/* Ref */}
                  <td className="px-3 py-2">
                    <span className="font-mono text-[11px] text-white/50">{entry.transactionRef}</span>
                  </td>
                  {/* Proof */}
                  <td className="px-3 py-2">
                    <InlineProofCell
                      entry={entry}
                      onUpload={handleUploadProof}
                      onPreview={setPreviewEntry}
                    />
                  </td>
                  {/* Status — inline dropdown */}
                  <td className="px-3 py-2">
                    <InlineStatusSelect
                      value={entry.status}
                      onChange={(s) => handleStatusChange(entry.id, s)}
                    />
                  </td>
                  {/* Date */}
                  <td className="px-3 py-2 text-[11px] text-white/35">
                    {entry.enteredOn}
                  </td>
                  {/* Actions */}
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="rounded p-1 text-white/0 transition group-hover:text-white/20 hover:!bg-red-500/15 hover:!text-red-400"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Inline new row */}
              {showNewRow && selectedBatch && (
                <InlineNewRow
                  batch={selectedBatch}
                  month={selectedMonth}
                  onAdd={handleAddEntry}
                  onCancel={() => setShowNewRow(false)}
                  colSpan={9}
                />
              )}

              {/* Empty state */}
              {filteredEntries.length === 0 && !showNewRow && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-12 text-center text-xs text-white/25"
                  >
                    No fee entries for this batch and month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Add row footer (Zoho style) ─── */}
        <div className="border-t border-slate-700/40 bg-[#0b1220]">
          {!showNewRow ? (
            <button
              type="button"
              onClick={() => setShowNewRow(true)}
              className="flex w-full items-center gap-2 px-5 py-2.5 text-xs font-bold text-violet-300/60 transition hover:bg-violet-500/[0.05] hover:text-violet-300"
            >
              <Plus size={13} />
              Add a fee entry...
            </button>
          ) : (
            <div className="px-5 py-2 text-[10px] text-white/20">
              Press <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 font-mono text-[9px]">Enter</kbd> to save
              · <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 font-mono text-[9px]">Esc</kbd> to cancel
            </div>
          )}
        </div>
      </div>

      {/* Proof preview panel */}
      {previewEntry && (
        <ProofPreviewOverlay
          entry={previewEntry}
          onClose={() => setPreviewEntry(null)}
        />
      )}
    </section>
  );
}
