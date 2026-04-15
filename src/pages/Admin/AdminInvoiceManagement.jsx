import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Ban,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  FileText,
  ReceiptText,
  Send,
  TrendingUp,
  Users,
  Utensils,
} from "lucide-react";
import { INVOICES_RAISED } from "./adminPortalData";

const FOOD_RATE_PER_STUDENT = 3000;
const MIN_ATTENDANCE_PCT = 70;
const MONTHS = ["January", "February", "March", "April", "May", "June"];

const FOOD_MONTHLY_DATA = {
  "2026-03": { activeStudents: 0, attendancePct: 0, boardingCapacity: 120 },
  "2026-02": { activeStudents: 115, attendancePct: 65, boardingCapacity: 120 },
  "2026-01": { activeStudents: 110, attendancePct: 78, boardingCapacity: 120 },
};

const FOOD_INVOICES = [
  { id: "INV-AF-0102", month: "January 2026", amount: 330000, status: "Paid", raisedOn: "2026-02-02", students: 110, source: "Food Operations" },
  { id: "INV-AF-0101", month: "December 2025", amount: 285000, status: "Paid", raisedOn: "2026-01-05", students: 95, source: "Food Operations" },
];

const currentMonthKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

export default function AdminInvoiceManagement() {
  const [mounted, setMounted] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [invoices, setInvoices] = useState(FOOD_INVOICES);

  useEffect(() => {
    setMounted(true);
  }, []);

  const monthData = FOOD_MONTHLY_DATA[selectedMonth] || {
    activeStudents: 0,
    attendancePct: 0,
    boardingCapacity: 0,
  };

  const monthLabel = useMemo(() => {
    const [year, month] = selectedMonth.split("-");
    const name = MONTHS[parseInt(month, 10) - 1];
    return name ? `${name} ${year}` : selectedMonth;
  }, [selectedMonth]);

  const invoiceTarget = monthData.activeStudents * FOOD_RATE_PER_STUDENT;
  const isEligible = monthData.attendancePct >= MIN_ATTENDANCE_PCT;
  const utilization = monthData.boardingCapacity
    ? Math.round((monthData.activeStudents / monthData.boardingCapacity) * 100)
    : 0;

  const externalFoodInvoices = useMemo(
    () =>
      INVOICES_RAISED.filter((invoice) => invoice.category === "Food & Boarding").map((invoice) => ({
        id: invoice.id,
        month: invoice.project,
        amount: invoice.amount,
        status: invoice.status,
        raisedOn: invoice.raisedOn,
        students: "Ops",
        source: invoice.center,
      })),
    []
  );

  const allInvoices = useMemo(() => [...invoices, ...externalFoodInvoices], [invoices, externalFoodInvoices]);
  const alreadyRaised = invoices.some((invoice) => invoice.month === monthLabel);

  const summary = useMemo(() => {
    const totalValue = allInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const clearedValue = allInvoices
      .filter((invoice) => invoice.status === "Paid" || invoice.status === "Approved")
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    const pendingCount = allInvoices.filter(
      (invoice) => invoice.status === "Pending" || invoice.status === "Verified"
    ).length;

    return { totalValue, clearedValue, pendingCount };
  }, [allInvoices]);

  const raiseInvoice = () => {
    if (!isEligible || alreadyRaised) return;
    const invoice = {
      id: `INV-AF-${String(invoices.length + 103).padStart(4, "0")}`,
      month: monthLabel,
      amount: invoiceTarget,
      status: "Pending",
      raisedOn: new Date().toISOString().split("T")[0],
      students: monthData.activeStudents,
      source: "Food Operations",
      notes: invoiceNotes,
    };
    setInvoices([invoice, ...invoices]);
    setInvoiceNotes("");
    setInvoiceModal(false);
  };

  return (
    <section
      className={`relative min-h-screen overflow-hidden bg-[#0a1220] text-white transition-opacity duration-500 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.10),transparent_20%)]" />

      <div className="relative z-10 mx-auto max-w-[1440px] space-y-6 px-6 py-6 md:px-8 md:py-8">
        <div className="rounded-[28px] border border-white/10 bg-[rgba(12,20,32,0.86)] p-6 backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-200">
                Finance Workspace
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Invoices Raised</h1>
              <p className="mt-3 text-sm leading-6 text-white/58 md:text-base">
                A streamlined monthly workspace for food and boarding billing, focused on release eligibility, invoice target, and ledger review.
              </p>
            </div>

            <div className="relative w-full max-w-[240px]">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/42">
                Reporting Month
              </label>
              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-10 text-sm text-white outline-none focus:border-sky-400/35"
              >
                {Object.keys(FOOD_MONTHLY_DATA).map((monthKey) => {
                  const [year, month] = monthKey.split("-");
                  return (
                    <option key={monthKey} value={monthKey} className="bg-slate-900">
                      {MONTHS[parseInt(month, 10) - 1]} {year}
                    </option>
                  );
                })}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-4 top-[43px] text-white/45" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Invoice Target" value={`₹${invoiceTarget.toLocaleString("en-IN")}`} helper={monthLabel} icon={ReceiptText} />
          <SummaryCard label="Active Students" value={monthData.activeStudents} helper={`${utilization}% capacity utilized`} icon={Users} />
          <SummaryCard label="Total Ledger Value" value={`₹${summary.totalValue.toLocaleString("en-IN")}`} helper="all food billing records" icon={TrendingUp} />
          <SummaryCard label="Pending Review" value={summary.pendingCount} helper="pending and verified invoices" icon={CalendarDays} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[28px] border border-white/10 bg-[rgba(12,20,32,0.86)] p-6 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/42">Monthly Release Status</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Billing Readiness</h2>
              </div>
              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  isEligible ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200" : "border-red-400/20 bg-red-500/10 text-red-200"
                }`}
              >
                {isEligible ? "Ready" : "Locked"}
              </span>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/38">Attendance</p>
                <div className="mt-3 flex items-end gap-3">
                  <span className={`text-6xl font-black ${isEligible ? "text-emerald-300" : "text-red-300"}`}>
                    {monthData.attendancePct}%
                  </span>
                  <span className="pb-2 text-white/35">/100%</span>
                </div>
                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${isEligible ? "bg-emerald-400" : "bg-red-400"}`}
                    style={{ width: `${Math.min(monthData.attendancePct, 100)}%` }}
                  />
                </div>
              </div>

              <div className={`rounded-[24px] border p-5 ${isEligible ? "border-emerald-400/12 bg-emerald-500/8" : "border-red-400/12 bg-red-500/8"}`}>
                <div className="flex items-start gap-3">
                  {isEligible ? (
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" />
                  ) : (
                    <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-300" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">
                      {isEligible
                        ? `Attendance has crossed the ${MIN_ATTENDANCE_PCT}% threshold for ${monthLabel}.`
                        : `Attendance is below the ${MIN_ATTENDANCE_PCT}% threshold for ${monthLabel}.`}
                    </p>
                    <p className="mt-2 text-sm text-white/55">
                      {isEligible
                        ? "You can proceed with invoice generation and send it for approval."
                        : "Invoice generation should remain locked until attendance improves or an exception is cleared."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <MiniCard label="Students" value={monthData.activeStudents} />
                <MiniCard label="Rate / Student" value={`₹${FOOD_RATE_PER_STUDENT}`} />
                <MiniCard label="Cleared Value" value={`₹${summary.clearedValue.toLocaleString("en-IN")}`} />
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[rgba(12,20,32,0.86)] p-6 backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/42">Invoice Action</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Release Panel</h2>

            <div className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/38">Target Amount</p>
              <p className="mt-3 text-5xl font-black tracking-tight text-white">₹{invoiceTarget.toLocaleString("en-IN")}</p>

              <div className="mt-6 space-y-4 text-sm text-white/58">
                <DetailRow label="Billing month" value={monthLabel} />
                <DetailRow label="Student count" value={monthData.activeStudents} />
                <DetailRow label="Capacity utilization" value={`${utilization}%`} />
                <DetailRow label="Already submitted" value={alreadyRaised ? "Yes" : "No"} />
              </div>

              {alreadyRaised ? (
                <button
                  disabled
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 py-3 text-sm font-semibold text-emerald-200"
                >
                  <CheckCircle2 size={16} />
                  Already Submitted
                </button>
              ) : (
                <button
                  onClick={() => setInvoiceModal(true)}
                  disabled={!isEligible}
                  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition ${
                    isEligible
                      ? "bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-[0_12px_24px_rgba(249,115,22,0.24)] hover:-translate-y-0.5"
                      : "cursor-not-allowed border border-white/10 bg-white/[0.04] text-white/35"
                  }`}
                >
                  {!isEligible ? <Ban size={16} /> : <FileText size={16} />}
                  {isEligible ? "Raise Invoice" : "Locked"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(12,20,32,0.88)] backdrop-blur-xl">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-lg font-semibold text-white">Billing History</h2>
            <p className="mt-1 text-sm text-white/48">
              Food operations submissions and existing food & boarding invoices in one ledger.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-sm">
              <thead className="bg-white/[0.02] text-white/45">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em]">Invoice ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em]">Billing Window</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em]">Source</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em]">Students / Scope</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em]">Raised On</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em]">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {allInvoices.map((invoice) => (
                  <tr key={`${invoice.id}-${invoice.raisedOn}`} className="transition hover:bg-white/[0.03]">
                    <td className="px-6 py-5 font-mono text-white/78">{invoice.id}</td>
                    <td className="px-6 py-5 font-medium text-white/90">{invoice.month}</td>
                    <td className="px-6 py-5 text-white/62">{invoice.source}</td>
                    <td className="px-6 py-5 text-white/62">{invoice.students}</td>
                    <td className="px-6 py-5 text-white/55">{invoice.raisedOn}</td>
                    <td className="px-6 py-5 font-semibold text-orange-300">₹{invoice.amount.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-5">
                      <StatusPill status={invoice.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {invoiceModal && (
        <div
          className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-md"
          onClick={() => setInvoiceModal(false)}
        >
          <div
            className="animate-scale-up relative w-full max-w-lg rounded-[28px] border border-orange-400/15 bg-[linear-gradient(135deg,rgba(10,18,28,0.98),rgba(16,26,34,0.94))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.42)]"
            onClick={(event) => event.stopPropagation()}
            style={{ animationFillMode: "forwards" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10 text-orange-300">
                <Utensils size={20} />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white">Generate Invoice</h3>
                <p className="mt-1 text-sm text-white/45">Submit this month’s billing packet.</p>
              </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <MiniCard label="Billing Month" value={monthLabel} />
              <MiniCard label="Attendance" value={`${monthData.attendancePct}%`} />
              <MiniCard label="Students" value={monthData.activeStudents} />
              <MiniCard label="Invoice Value" value={`₹${invoiceTarget.toLocaleString("en-IN")}`} />
            </div>

            <div className="mt-5 space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Notes</label>
              <textarea
                rows={3}
                value={invoiceNotes}
                onChange={(event) => setInvoiceNotes(event.target.value)}
                placeholder="Add optional internal notes for finance or operations..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-orange-400/35"
              />
            </div>

            <button
              onClick={raiseInvoice}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(249,115,22,0.24)]"
            >
              <Send size={17} />
              Submit to Super Admin
            </button>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleUp { from { opacity: 0; transform: scale(0.97) translateY(6px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            .animate-fade-in { animation: fadeIn 0.22s ease-out forwards; }
            .animate-scale-up { animation: scaleUp 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          `,
        }}
      />
    </section>
  );
}

function SummaryCard({ icon: Icon, label, value, helper }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[rgba(12,20,32,0.84)] p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/42">{label}</span>
        <Icon size={17} className="text-sky-300" />
      </div>
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs text-white/42">{helper}</p>
    </div>
  );
}

function MiniCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/38">{label}</p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-white/8 pb-3 last:border-b-0 last:pb-0">
      <span>{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    Paid: "bg-emerald-500/10 text-emerald-300 border-emerald-400/20",
    Approved: "bg-sky-500/10 text-sky-300 border-sky-400/20",
    Pending: "bg-amber-500/10 text-amber-300 border-amber-400/20",
    Verified: "bg-violet-500/10 text-violet-300 border-violet-400/20",
  };

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${map[status] || "border-white/10 bg-white/[0.04] text-white/70"}`}>
      {status}
    </span>
  );
}
