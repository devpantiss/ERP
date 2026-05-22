import { useEffect, useState } from "react";
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileImage,
  FolderKanban,
  Paperclip,
  ReceiptText,
  StickyNote,
  User,
  X,
} from "lucide-react";
import SlidePanel from "../../components/common/SlidePanel";

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function fileLabel(file, fallback) {
  if (!file) return fallback;
  if (typeof file === "string") return file;
  return file.name || fallback;
}

function isImageFile(fileName) {
  return /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(String(fileName || ""));
}

function normalizeBills(claim) {
  const bills = claim?.bills?.length
    ? claim.bills
    : [{ date: claim?.submittedOn || "-", desc: claim?.category || "Claim", amount: claim?.amount || 0, mode: "Online" }];

  return bills.map((bill, index) => ({
    id: `${claim?.id || "claim"}-${index}`,
    date: bill.date || "-",
    desc: bill.desc || bill.description || claim?.category || "Reimbursement expense",
    amount: Number(bill.amount || 0),
    mode: bill.mode || "Online",
    billFile: bill.billFile || bill.receiptFile || bill.receiptName,
    billFilePreview: bill.billFilePreview || bill.receiptPreview || null,
    paymentScreenshot: bill.paymentScreenshot || bill.screenshotFile || bill.screenshotName,
    paymentScreenshotPreview: bill.paymentScreenshotPreview || bill.screenshotPreview || null,
  }));
}

export default function ReimbursementClaimOverlay({
  claim,
  open,
  onClose,
  onApprove,
  onReject,
  approveLabel = "Approve",
  rejectLabel = "Reject",
  canDecide = false,
  tone = "violet",
}) {
  const [selectedProof, setSelectedProof] = useState(null);
  const bills = normalizeBills(claim);
  const total = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const accent = tone === "red" ? "text-red-300" : "text-violet-300";
  const accentBorder = tone === "red" ? "border-red-400/20 bg-red-500/10" : "border-violet-400/20 bg-violet-500/10";

  useEffect(() => {
    setSelectedProof(null);
  }, [claim?.id, open]);

  return (
    <SlidePanel open={open} onClose={onClose} title={claim ? `${claim.id} Details` : "Claim Details"} width="4xl">
      {claim && (
        <div className="space-y-6">
          <div className={`rounded-2xl border ${accentBorder} p-5`}>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/45">
                  <ReceiptText size={14} className={accent} />
                  Reimbursement Claim
                </p>
                <h2 className="text-2xl font-black text-white">
                  {claim.claimTitle || claim.category || "Reimbursement"}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                  {claim.claimNote || "No additional claim note was provided."}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300/75">Total Claim</p>
                <p className="mt-1 text-2xl font-black text-emerald-300">{formatCurrency(claim.amount || claim.totalAmount || total)}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard icon={User} label="Employee" value={claim.employee || "Employee"} sub={claim.role} />
            <InfoCard icon={FolderKanban} label="Project" value={claim.project || "Project"} sub={claim.fundingAgency} />
            <InfoCard icon={CalendarDays} label="Submitted" value={claim.submittedOn || "-"} sub={claim.dateRange} />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-white/80">Bill Items</p>
                <p className="mt-1 text-xs text-white/45">
                  {bills.length} bill{bills.length === 1 ? "" : "s"} attached to this reimbursement claim.
                </p>
              </div>
              <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-black text-white/60">
                {formatCurrency(total)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm">
                <thead className="bg-white/[0.02] text-xs uppercase tracking-[0.14em] text-white/40">
                  <tr>
                    {["#", "Date", "Description", "Mode", "Receipt", "Payment Proof", "Amount"].map((header) => (
                      <th key={header} className="px-5 py-3 text-left font-black">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {bills.map((bill, index) => (
                    <tr key={bill.id} className="hover:bg-white/[0.03]">
                      <td className="px-5 py-4 text-white/40">{index + 1}</td>
                      <td className="px-5 py-4 text-white/65">{bill.date}</td>
                      <td className="max-w-[260px] px-5 py-4 text-white/85">{bill.desc}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                          bill.mode === "Cash"
                            ? "border-amber-400/20 bg-amber-500/10 text-amber-300"
                            : "border-sky-400/20 bg-sky-500/10 text-sky-300"
                        }`}>
                          {bill.mode === "Cash" ? <Banknote size={12} /> : <CreditCard size={12} />}
                          {bill.mode}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-white/55">
                        <ProofPreview
                          icon={Paperclip}
                          label={fileLabel(bill.billFile, "Not attached")}
                          preview={bill.billFilePreview}
                          onPreview={(proof) => setSelectedProof(proof)}
                        />
                      </td>
                      <td className="px-5 py-4 text-white/55">
                        <ProofPreview
                          icon={FileImage}
                          label={bill.mode === "Online" ? fileLabel(bill.paymentScreenshot, "Not attached") : "Not required"}
                          preview={bill.mode === "Online" ? bill.paymentScreenshotPreview : null}
                          onPreview={(proof) => setSelectedProof(proof)}
                        />
                      </td>
                      <td className="px-5 py-4 font-black text-emerald-300">{formatCurrency(bill.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedProof && (
              <div className="border-t border-white/10 p-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.16em] text-white/80">Image Preview</p>
                    <p className="mt-1 text-xs text-white/45">{selectedProof.label}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedProof(null)}
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-white/55 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    <X size={13} />
                    Close Preview
                  </button>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#050a13]">
                  <img
                    src={selectedProof.src}
                    alt={selectedProof.label}
                    className="max-h-[520px] w-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-white/45">
              <StickyNote size={13} className={accent} />
              Approval Trail
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <TrailItem label="Current Status" value={claim.statusLabel || claim.status || "-"} />
              <TrailItem label="Admin Approved On" value={claim.adminApprovedOn || "-"} />
              <TrailItem label="Super Admin Decision On" value={claim.superAdminDecidedOn || "-"} />
              <TrailItem label="Claim ID" value={claim.id} />
            </div>
          </div>

          {canDecide && (
            <div className="sticky bottom-0 -mx-6 -mb-6 flex justify-end gap-3 border-t border-white/10 bg-[#0b1220]/95 px-6 py-4 backdrop-blur">
              <button
                type="button"
                onClick={onReject}
                className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-500/20"
              >
                {rejectLabel}
              </button>
              <button
                type="button"
                onClick={onApprove}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/15 px-4 py-2.5 text-sm font-bold text-emerald-300 transition hover:bg-emerald-500/25"
              >
                <CheckCircle2 size={16} />
                {approveLabel}
              </button>
            </div>
          )}
        </div>
      )}
    </SlidePanel>
  );
}

function InfoCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
        <Icon size={13} className="text-white/45" />
        {label}
      </p>
      <p className="truncate text-sm font-black text-white">{value}</p>
      {sub && <p className="mt-1 truncate text-xs text-white/45">{sub}</p>}
    </div>
  );
}

function ProofPreview({ icon: Icon, label, preview, onPreview }) {
  const canPreview = preview || isImageFile(label);
  const hasPreview = Boolean(preview);

  return (
    <div className="flex min-w-[160px] max-w-[210px] items-center gap-3">
      {canPreview ? (
        <button
          type="button"
          onClick={() => hasPreview && onPreview?.({ src: preview, label })}
          disabled={!hasPreview}
          className="group h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] disabled:cursor-default"
          title={hasPreview ? "Preview image" : label}
        >
          {hasPreview ? (
            <img src={preview} alt={label} className="h-full w-full object-cover transition group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <FileImage size={18} className="text-white/35" />
            </div>
          )}
        </button>
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
          <Icon size={18} className="text-white/35" />
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-white/70">{label}</p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
          {hasPreview ? "Click to Preview" : canPreview ? "Image File" : label === "Not required" ? "Optional" : "File"}
        </p>
      </div>
    </div>
  );
}

function TrailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white/80">{value}</p>
    </div>
  );
}
