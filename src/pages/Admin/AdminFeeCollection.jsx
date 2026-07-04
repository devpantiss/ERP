import { useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  IndianRupee,
  Search,
  Upload,
  Download,
  FileText,
  X,
  Plus,
  Clock,
  CreditCard,
  Banknote,
  ChevronDown,
  Trash2,
  Paperclip,
  Hash,
  Save,
} from "lucide-react";
import Pagination from "../../components/common/Pagination";
import SlidePanel from "../../components/common/SlidePanel";
import TableExportActions from "../../components/common/TableExportActions";
import { SA_PROJECTS } from "../SuperAdmin/superAdminData";
import {
  FEE_TARGETS,
  TRAINING_MONTHS,
  getEntriesForBatchMonth,
  getBatchMonthSummary,
} from "./feeCollectionData";

const ITEMS_PER_PAGE = 8;
const EXPORT_COLUMNS = [
  { key: "projectName", header: "Project" },
  { key: "centerName", header: "Center" },
  { key: "batchLabel", header: "Batch" },
  { key: "monthLabel", header: "Month" },
  { key: "studentName", header: "Student" },
  { key: "studentId", header: "Student ID" },
  { key: "amount", header: "Amount", type: "currency", currency: "INR" },
  { key: "paymentMode", header: "Mode" },
  { key: "transactionRef", header: "Transaction Ref" },
  { key: "proofStatus", header: "Proof" },
  { key: "status", header: "Status" },
  { key: "enteredOn", header: "Entered On", type: "date" },
  { key: "enteredBy", header: "Entered By" },
  { key: "remarks", header: "Remarks" },
];

/* ═══════════════════════════════════════════════════════════════
   ADMIN FEE COLLECTION — Zoho Projects Style
   Spreadsheet list with overlay entry forms for focused data entry
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

/* ── Zoho Projects-style New Entry Overlay Modal ── */
function NewEntryOverlay({ batch, month, onAdd, onClose, batchOption }) {
  const candidates = batch?.candidates || [];
  const target = FEE_TARGETS.find((t) => t.batchId === batch?.id);
  const feeAmount = target?.feePerStudent || 1200;

  const [studentId, setStudentId] = useState(candidates[0]?.id || "");
  const [amount, setAmount] = useState(feeAmount);
  const [paymentMode, setPaymentMode] = useState("Online");
  const [transactionRef, setTransactionRef] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [remarks, setRemarks] = useState("");

  const selectedStudent = candidates.find((c) => c.id === studentId);
  const canSave = Boolean(studentId && amount && transactionRef.trim());

  function handleSave() {
    if (!canSave) return;
    onAdd({
      studentId,
      studentName: selectedStudent?.name || "Unknown",
      amount: Number(amount),
      paymentMode,
      transactionRef: transactionRef.trim(),
      proofFile: proofFile
        ? {
            name: proofFile.name,
            type: proofFile.type || "application/octet-stream",
            url: URL.createObjectURL(proofFile),
            uploadedOn: new Date().toISOString().split("T")[0],
          }
        : null,
      month,
      remarks: remarks.trim(),
    });
  }

  return (
    <SlidePanel open onClose={onClose} title="New Fee Entry" width="xl">
      <div className="flex min-h-full flex-col">
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-slate-700/60 bg-[#111827] px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
            <Plus size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white">Record a student fee payment</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="max-w-[12rem] truncate text-[10px] font-bold text-violet-300/80">
                {batchOption?.project?.name}
              </span>
              <ChevronDown size={9} className="rotate-[-90deg] text-white/15" />
              <span className="max-w-[10rem] truncate text-[10px] font-bold text-white/40">
                {batchOption?.center?.name}
              </span>
              <ChevronDown size={9} className="rotate-[-90deg] text-white/15" />
              <span className="max-w-[10rem] truncate text-[10px] font-bold text-white/40">
                {batch?.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-5">
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
              Student <span className="text-red-400">*</span>
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-[#111827] px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-violet-400/60"
              autoFocus
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id})
                </option>
              ))}
            </select>
            {selectedStudent && (
              <p className="mt-1.5 text-[10px] text-white/25">
                ID: <span className="font-mono text-white/40">{selectedStudent.id}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                Amount (₹) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <IndianRupee size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-[#111827] py-3 pl-9 pr-4 text-sm font-bold text-white outline-none transition focus:border-violet-400/60"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                Payment Mode
              </label>
              <div className="flex h-[46px] items-stretch overflow-hidden rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => setPaymentMode("Online")}
                  className={`flex flex-1 items-center justify-center gap-1.5 text-xs font-bold transition ${
                    paymentMode === "Online"
                      ? "border-r border-sky-500/30 bg-sky-500/20 text-sky-300"
                      : "border-r border-slate-700 bg-[#111827] text-white/30 hover:text-white/50"
                  }`}
                >
                  <CreditCard size={13} />
                  Online
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode("Offline")}
                  className={`flex flex-1 items-center justify-center gap-1.5 text-xs font-bold transition ${
                    paymentMode === "Offline"
                      ? "bg-orange-500/20 text-orange-300"
                      : "bg-[#111827] text-white/30 hover:text-white/50"
                  }`}
                >
                  <Banknote size={13} />
                  Offline
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
              Transaction Reference <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Hash size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder={paymentMode === "Online" ? "e.g. UPI-987654321" : "e.g. RCP-12345"}
                className="w-full rounded-lg border border-slate-700 bg-[#111827] py-3 pl-9 pr-4 text-sm font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/60"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canSave) handleSave();
                }}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
              Payment Proof
            </label>
            {proofFile ? (
              <div className="flex items-center justify-between rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] px-4 py-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                    <Paperclip size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="max-w-[14rem] truncate text-xs font-bold text-emerald-200 sm:max-w-[22rem]">
                      {proofFile.name}
                    </p>
                    <p className="text-[10px] text-emerald-300/50">
                      {(proofFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setProofFile(null)}
                  className="rounded-lg p-1.5 text-emerald-300/40 transition hover:bg-emerald-500/15 hover:text-emerald-200"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="group flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-slate-700 bg-[#111827]/50 px-4 py-5 transition hover:border-violet-400/40 hover:bg-violet-500/[0.03]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white/25 transition group-hover:bg-violet-500/15 group-hover:text-violet-300">
                  <Upload size={18} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-white/40 transition group-hover:text-violet-300">
                    Upload proof
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/20">PDF, JPG, PNG</p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                />
              </label>
            )}
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
              Remarks <span className="text-white/15">(optional)</span>
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-700 bg-[#111827] px-4 py-3 text-sm text-white/70 outline-none transition placeholder:text-slate-600 focus:border-violet-400/60"
            />
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-[#111827] px-4 py-3">
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-amber-400" />
              <span className="text-xs font-bold text-amber-300">Pending</span>
            </div>
            <span className="text-[10px] text-white/20">Initial status</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-700/60 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-5 py-2.5 text-xs font-bold text-white/50 transition hover:bg-slate-800 hover:text-white/70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
          >
            <Save size={13} />
            Save Entry
          </button>
        </div>
      </div>
    </SlidePanel>
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
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const selectedOption = batchOptions.find((o) => o.value === selectedBatchId);
  const selectedBatch = selectedOption?.batch;
  const target = FEE_TARGETS.find((t) => t.batchId === selectedBatchId);

  /* ── Load entries when batch or month changes ── */
  const refreshEntries = useCallback((batchId, month) => {
    setEntries([...getEntriesForBatchMonth(batchId, month)]);
    setSearch("");
    setStatusFilter("All");
    setShowNewEntryModal(false);
    setCurrentPage(1);
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

  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
  const activePage = Math.min(currentPage, Math.max(totalPages, 1));
  const pageStartIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const pageEndIndex = Math.min(pageStartIndex + ITEMS_PER_PAGE, filteredEntries.length);
  const paginatedEntries = useMemo(
    () => filteredEntries.slice(pageStartIndex, pageStartIndex + ITEMS_PER_PAGE),
    [filteredEntries, pageStartIndex]
  );
  const exportRows = useMemo(
    () =>
      filteredEntries.map((entry) => ({
        ...entry,
        monthLabel: formatMonth(entry.month || selectedMonth),
        proofStatus: entry.proofFile?.name || "Not attached",
        remarks: entry.remarks || "",
      })),
    [filteredEntries, selectedMonth]
  );
  const exportContextName = `${selectedOption?.project?.name || "Project"} - ${selectedBatch?.label || "Batch"} - ${formatMonth(selectedMonth)}`;

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

  /* ── Add new entry (from overlay modal) ── */
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
      remarks: data.remarks,
      status: "Pending",
      enteredBy: "Admin",
      enteredOn: new Date().toISOString().split("T")[0],
    };
    setEntries((prev) => [...prev, newEntry]);
    setSearch("");
    setStatusFilter("All");
    setCurrentPage(Math.max(1, Math.ceil((entries.length + 1) / ITEMS_PER_PAGE)));
    setShowNewEntryModal(false);
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
              onClick={() => {
                setStatusFilter(s);
                setCurrentPage(1);
              }}
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
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search..."
            className="w-44 rounded-md border border-slate-700 bg-[#111827] py-1.5 pl-7 pr-2.5 text-xs text-white/70 outline-none transition placeholder:text-slate-600 focus:border-violet-400/50 focus:w-56"
          />
        </div>

        {/* Record count */}
        <span className="rounded-md bg-slate-800/60 px-2 py-1 text-[10px] font-bold text-white/30">
          {filteredEntries.length > 0
            ? `${pageStartIndex + 1}-${pageEndIndex} of ${filteredEntries.length} records`
            : "0 records"}
        </span>

        <TableExportActions
          moduleName={`Fee Collection | ${exportContextName}`}
          fileName={`fee_collection_${exportContextName}`}
          columns={EXPORT_COLUMNS}
          rows={exportRows}
          company={{ name: "Pantiss ERP", logo: "/activity.png" }}
        />

        <button
          type="button"
          onClick={() => setShowNewEntryModal(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500"
        >
          <Plus size={13} />
          Add Entry
        </button>
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
              {paginatedEntries.map((entry, idx) => (
                <tr
                  key={entry.id}
                  className="group border-b border-slate-700/30 transition-colors hover:bg-white/[0.02]"
                >
                  {/* Row # */}
                  <td className="px-3 py-2 text-center text-[10px] font-bold text-white/15">
                    {pageStartIndex + idx + 1}
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


              {/* Empty state */}
              {filteredEntries.length === 0 && (
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

        <Pagination
          currentPage={activePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Proof preview panel */}
      {previewEntry && (
        <ProofPreviewOverlay
          entry={previewEntry}
          onClose={() => setPreviewEntry(null)}
        />
      )}

      {/* New entry overlay modal */}
      {showNewEntryModal && selectedBatch && (
        <NewEntryOverlay
          batch={selectedBatch}
          month={selectedMonth}
          onAdd={handleAddEntry}
          onClose={() => setShowNewEntryModal(false)}
          batchOption={selectedOption}
        />
      )}
    </section>
  );
}
