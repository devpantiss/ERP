import { useState } from "react";
import SlidePanel from "../../components/common/SlidePanel";
import {
  IndianRupee,
  Clock,
  MapPin,
  TrendingUp,
  FileText,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { selectRevenueWorkflows } from "../../stores/selectors/analyticsSelectors";

/* ═══════════════════════════════════════════════════════════════
   CONFIG
═══════════════════════════════════════════════════════════════ */

const BASE_SALARY       = 25000;
const HOURS_COMPONENT   = 0.70;   // 70 %
const VISITS_COMPONENT  = 0.30;   // 30 %
const TARGET_HOURS      = 160;    // per month
const TARGET_VISITS     = 4;      // per month

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */

const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const calcEarnings = (data) => {
  const hoursPct  = Math.min(data.hoursClocked / TARGET_HOURS, 1);
  const visitsPct = Math.min(data.visitsCompleted / TARGET_VISITS, 1);
  const hoursAmt  = Math.round(BASE_SALARY * HOURS_COMPONENT * hoursPct);
  const visitsAmt = Math.round(BASE_SALARY * VISITS_COMPONENT * visitsPct);
  return { hoursPct, visitsPct, hoursAmt, visitsAmt, net: hoursAmt + visitsAmt };
};

const statusColor = (s) =>
  s === "Paid" ? "text-emerald-400" : s === "Approved" ? "text-amber-400" : "text-blue-400";
const statusBg = (s) =>
  s === "Paid" ? "bg-emerald-500/10 border-emerald-500/20" : s === "Approved" ? "bg-amber-500/10 border-amber-500/20" : "bg-blue-500/10 border-blue-500/20";

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */

export default function TrainerRevenue() {
  const workflow = selectRevenueWorkflows().trainer;
  const monthlyData = workflow.monthlyData;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const [invoiceModal, setInvoiceModal]   = useState(false);
  const [invoiceNotes, setInvoiceNotes]   = useState("");
  const [invoices, setInvoices]           = useState(workflow.invoices);

  const data     = monthlyData[selectedMonth] || { hoursClocked: 0, visitsCompleted: 0 };
  const earnings = calcEarnings(data);

  const monthLabel = (() => {
    const [y, m] = selectedMonth.split("-");
    return `${MONTHS[parseInt(m) - 1]} ${y}`;
  })();

  /* ── raise invoice ─────────────────────────────────────────── */
  const raiseInvoice = () => {
    const inv = {
      id: `INV-T-${String(invoices.length + 40).padStart(4, "0")}`,
      month: monthLabel,
      amount: earnings.net,
      status: "Pending",
      raisedOn: new Date().toISOString().split("T")[0],
    };
    setInvoices([inv, ...invoices]);
    setInvoiceModal(false);
    setInvoiceNotes("");
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */
  return (
    <section className="min-h-screen bg-[#060810] text-white/90 p-6 md:p-10 relative overflow-hidden">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* ─── Header ──────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 animate-fade-in-up">
          <div>
            <p className="text-xs tracking-widest text-emerald-400/80 uppercase mb-2 font-medium">Trainer Revenue</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-md">Monthly Earnings</h1>
          </div>

          {/* month selector */}
          <div className="relative w-56 animate-scale-up" style={{ animationDelay: "100ms" }}>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl
                         px-4 py-3 text-sm text-white/90 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 focus:outline-none
                         cursor-pointer pr-10 hover:bg-white/[0.06] transition-colors shadow-lg shadow-black/20"
            >
              {Object.keys(monthlyData).map((k) => {
                const [y, m] = k.split("-");
                return <option key={k} value={k} className="bg-[#0b1220]">{MONTHS[parseInt(m) - 1]} {y}</option>;
              })}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
          </div>
        </div>

        {/* ─── Overview Cards ──────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card delay="150ms" icon={IndianRupee} label="Base Salary"        value={`₹${BASE_SALARY.toLocaleString("en-IN")}`}          accent="emerald" />
          <Card delay="250ms" icon={Clock}       label="Hours Component"    value={`₹${earnings.hoursAmt.toLocaleString("en-IN")}`}    sub={`${(earnings.hoursPct * 100).toFixed(0)}% of ₹${(BASE_SALARY * HOURS_COMPONENT).toLocaleString("en-IN")}`} accent="blue" />
          <Card delay="350ms" icon={MapPin}      label="Visits Component"   value={`₹${earnings.visitsAmt.toLocaleString("en-IN")}`}   sub={`${(earnings.visitsPct * 100).toFixed(0)}% of ₹${(BASE_SALARY * VISITS_COMPONENT).toLocaleString("en-IN")}`} accent="violet" />
          <Card delay="450ms" icon={TrendingUp}  label="Net Payable"        value={`₹${earnings.net.toLocaleString("en-IN")}`}         accent="emerald" highlight />
        </div>

        {/* ─── Detailed Breakdown ──────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* hours */}
          <div className="bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/[0.05] p-6 sm:p-8 space-y-6 animate-fade-in-up hover:bg-white/[0.03] transition-colors shadow-lg shadow-black/20" style={{ animationDelay: "550ms" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Clock size={18} className="text-blue-400" />
              </div>
              <h2 className="text-base font-semibold text-white tracking-wide">Hours Component <span className="text-slate-500 font-normal">— 70%</span></h2>
            </div>
            
            <div className="space-y-4">
              <ProgressRow label="Target Hours"  value={TARGET_HOURS}          unit="h"  />
              <ProgressRow label="Hours Clocked" value={data.hoursClocked}     unit="h" highlight />
              <ProgressBar pct={earnings.hoursPct} color="blue" />
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Achievement</span>
                <span className="font-semibold text-blue-400">{(earnings.hoursPct * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-t border-white/5">
                <span className="text-white/60">Amount Earned</span>
                <span className="font-bold text-blue-400 text-base">₹{earnings.hoursAmt.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {earnings.hoursPct < 1 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-2 text-sm text-amber-200 mr-2 shadow-inner">
                 <AlertCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                 <p className="leading-snug">
                   Shortfall of <strong>{TARGET_HOURS - data.hoursClocked}h</strong>. Deduction: <span className="font-semibold text-amber-400">₹{((BASE_SALARY * HOURS_COMPONENT) - earnings.hoursAmt).toLocaleString("en-IN")}</span>
                 </p>
              </div>
            )}
          </div>

          {/* visits */}
          <div className="bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/[0.05] p-6 sm:p-8 space-y-6 animate-fade-in-up hover:bg-white/[0.03] transition-colors shadow-lg shadow-black/20" style={{ animationDelay: "650ms" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                <MapPin size={18} className="text-violet-400" />
              </div>
              <h2 className="text-base font-semibold text-white tracking-wide">Exposure Visits <span className="text-slate-500 font-normal">— 30%</span></h2>
            </div>
            
            <div className="space-y-4">
              <ProgressRow label="Target Visits"     value={TARGET_VISITS}          unit="" />
              <ProgressRow label="Visits Completed"  value={data.visitsCompleted}   unit="" highlight />
              <ProgressBar pct={earnings.visitsPct} color="violet" />
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Achievement</span>
                <span className="font-semibold text-violet-400">{(earnings.visitsPct * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-t border-white/5">
                <span className="text-white/60">Amount Earned</span>
                <span className="font-bold text-violet-400 text-base">₹{earnings.visitsAmt.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {earnings.visitsPct < 1 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-2 text-sm text-amber-200 mr-2 shadow-inner">
                 <AlertCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                 <p className="leading-snug">
                   Shortfall of <strong>{TARGET_VISITS - data.visitsCompleted}</strong> visit(s). Deduction: <span className="font-semibold text-amber-400">₹{((BASE_SALARY * VISITS_COMPONENT) - earnings.visitsAmt).toLocaleString("en-IN")}</span>
                 </p>
              </div>
            )}
          </div>
        </div>

        {/* ─── Deduction Summary ───────────────────────────── */}
        {earnings.net < BASE_SALARY && (
          <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 backdrop-blur-md rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4 animate-fade-in-up" style={{ animationDelay: "700ms" }}>
            <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center shrink-0 border border-amber-500/30">
              <AlertCircle size={24} className="text-amber-400" />
            </div>
            <div className="text-sm text-white/80 leading-relaxed">
              <div className="font-semibold text-amber-400 text-base mb-1">Total Deduction: ₹{(BASE_SALARY - earnings.net).toLocaleString("en-IN")}</div>
              Targets were not fully met this month. Net payable is <span className="font-semibold text-emerald-400 text-base">₹{earnings.net.toLocaleString("en-IN")}</span> out of the ₹{BASE_SALARY.toLocaleString("en-IN")} base.
            </div>
          </div>
        )}

        {/* ─── Invoice History ─────────────────────────────── */}
        <div className="bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/[0.05] overflow-hidden animate-fade-in-up shadow-xl shadow-black/20" style={{ animationDelay: "800ms" }}>
          <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-white/[0.05] bg-white/[0.01]">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <FileText size={18} className="text-emerald-400" /> Invoice History
            </h2>
            <button
              onClick={() => setInvoiceModal(true)}
              className="group flex items-center gap-2 px-5 py-2.5 text-sm font-semibold
                         bg-emerald-500 text-black rounded-lg
                         hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]
                         transition-all active:scale-95"
            >
              <Send size={15} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" /> Raise Invoice
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-transparent/20 text-white/60">
                <tr>
                  <th className="px-6 py-4 text-left font-medium">Invoice ID</th>
                  <th className="px-6 py-4 text-left font-medium">Month</th>
                  <th className="px-6 py-4 text-left font-medium">Amount</th>
                  <th className="px-6 py-4 text-left font-medium">Raised On</th>
                  <th className="px-6 py-4 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {invoices.map((inv, idx) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group animate-fade-in" style={{ animationDelay: `${850 + idx * 50}ms` }}>
                    <td className="px-6 py-4 font-mono text-white/80 group-hover:text-emerald-300 transition-colors">{inv.id}</td>
                    <td className="px-6 py-4 text-white/90">{inv.month}</td>
                    <td className="px-6 py-4 font-bold text-emerald-400">₹{inv.amount.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4 text-white/60">{inv.raisedOn}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusBg(inv.status)} ${statusColor(inv.status)}`}>
                        {inv.status === "Paid" && <CheckCircle2 size={12} />}
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-white/60">No invoices raised yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <SlidePanel open={invoiceModal} onClose={() => setInvoiceModal(false)} title="Raise Invoice" width="md">
          <div className="space-y-6">
            <div className="space-y-5 bg-white/[0.02] rounded-xl p-5 border border-white/5">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <label className="text-xs text-white/60 font-medium">Month</label>
                <p className="text-sm font-semibold text-white">{monthLabel}</p>
              </div>
              
              <div>
                <label className="text-xs text-white/60 font-medium tracking-wide mb-3 block">Breakdown</label>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center bg-transparent/20 p-3 rounded-lg border border-white/5">
                     <span className="text-sm text-white/80 flex items-center gap-2"><Clock size={14} className="text-blue-400"/> Hours ({(earnings.hoursPct * 100).toFixed(0)}%)</span>
                     <span className="text-sm font-semibold text-blue-400">₹{earnings.hoursAmt.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between items-center bg-transparent/20 p-3 rounded-lg border border-white/5">
                     <span className="text-sm text-white/80 flex items-center gap-2"><MapPin size={14} className="text-violet-400"/> Visits ({(earnings.visitsPct * 100).toFixed(0)}%)</span>
                     <span className="text-sm font-semibold text-violet-400">₹{earnings.visitsAmt.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <label className="text-xs text-white/60 font-medium">Net Payable</label>
                <p className="text-2xl font-bold text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">₹{earnings.net.toLocaleString("en-IN")}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-white/60 font-medium ml-1">Admin Notes (optional)</label>
              <textarea
                value={invoiceNotes}
                onChange={(e) => setInvoiceNotes(e.target.value)}
                rows={3}
                className="w-full bg-transparent/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90
                           focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 focus:outline-none resize-none transition-all placeholder:text-slate-600"
                placeholder="Mention any specific claim references..."
              />
            </div>

            <button
              onClick={raiseInvoice}
              className="w-full py-3.5 bg-emerald-500 text-black rounded-xl font-bold text-sm
                         hover:bg-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Send size={16} /> Submit Invoice For Approval
            </button>
          </div>
      </SlidePanel>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════ */

function Card({ icon: Icon, label, value, sub, accent = "emerald", highlight, delay }) {
  const accentConfigs = {
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", ring: "ring-emerald-500/30 shadow-emerald-500/10" },
    blue:    { bg: "bg-blue-500/10",    border: "border-blue-500/20",    text: "text-blue-400",    ring: "ring-blue-500/30 shadow-blue-500/10" },
    violet:  { bg: "bg-violet-500/10",  border: "border-violet-500/20",  text: "text-violet-400",  ring: "ring-violet-500/30 shadow-violet-500/10" },
  };
  const c = accentConfigs[accent];
  const ring = highlight ? `ring-1 ${c.ring} shadow-xl bg-white/[0.04] scale-[1.02]` : "shadow-lg shadow-black/20 hover:bg-white/[0.04]";
  
  return (
    <div className={`bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/[0.05] p-6 transition-all duration-300 animate-scale-up ${ring}`} style={{ animationDelay: delay }}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center border ${c.border}`}>
          <Icon size={18} className={c.text} />
        </div>
        <span className="text-xs text-white/60 uppercase tracking-widest font-medium">{label}</span>
      </div>
      <p className={`text-2xl sm:text-3xl font-bold ${highlight ? c.text : "text-white"} drop-shadow-sm`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-2 font-medium">{sub}</p>}
    </div>
  );
}

function ProgressRow({ label, value, unit, highlight }) {
  return (
    <div className="flex justify-between items-center text-sm py-1">
      <span className="text-white/60">{label}</span>
      <span className={`font-semibold ${highlight ? "text-white text-base" : "text-white/90"}`}>{value}{unit}</span>
    </div>
  );
}

function ProgressBar({ pct, color = "emerald" }) {
  const colorMap = {
    emerald: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
    blue: "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]",
    violet: "bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]",
  };
  return (
    <div className="w-full h-2.5 bg-transparent/40 rounded-full overflow-hidden border border-white/5 my-4">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out relative ${colorMap[color] || colorMap.emerald}`}
        style={{ width: `${Math.min(pct * 100, 100)}%` }}
      >
        <div className="absolute inset-0 bg-white/20 w-full animate-pulse" />
      </div>
    </div>
  );
}
