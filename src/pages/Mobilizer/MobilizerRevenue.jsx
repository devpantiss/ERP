import { useState, useMemo } from "react";
import SlidePanel from "../../components/common/SlidePanel";
import {
  IndianRupee,
  Users,
  Megaphone,
  TrendingUp,
  FileText,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   CONFIG
═══════════════════════════════════════════════════════════════ */

const PER_ENROLLED   = 500;    // ₹500 per enrolled candidate
const PER_DRIVE      = 1000;   // ₹1,000 per community drive conducted

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/* ── Demo data ───────────────────────────────────────────────── */
const MONTHLY_DATA = {
  "2026-03": {
    candidates: [
      { name: "Rahul Mehra",    date: "2026-03-02", status: "Enrolled" },
      { name: "Priya Sharma",   date: "2026-03-05", status: "Enrolled" },
      { name: "Amit Kumar",     date: "2026-03-07", status: "Enrolled" },
      { name: "Deepa Nayak",    date: "2026-03-10", status: "Enrolled" },
      { name: "Suresh Patel",   date: "2026-03-12", status: "Enrolled" },
      { name: "Kavita Das",     date: "2026-03-14", status: "Enrolled" },
      { name: "Ravi Shukla",    date: "2026-03-15", status: "Pending" },
    ],
    drives: [
      { name: "Angul Mining Colony Outreach",  date: "2026-03-03", location: "Angul" },
      { name: "Jharsuguda Skill Fair",         date: "2026-03-08", location: "Jharsuguda" },
      { name: "Talcher Community Camp",        date: "2026-03-13", location: "Talcher" },
    ],
  },
  "2026-02": {
    candidates: [
      { name: "Sanjay Rath",      date: "2026-02-02", status: "Enrolled" },
      { name: "Manisha Behera",   date: "2026-02-06", status: "Enrolled" },
      { name: "Rajesh Pradhan",   date: "2026-02-10", status: "Enrolled" },
      { name: "Sunita Mohanty",   date: "2026-02-15", status: "Enrolled" },
      { name: "Anil Sahu",        date: "2026-02-19", status: "Enrolled" },
      { name: "Geeta Naik",       date: "2026-02-22", status: "Enrolled" },
      { name: "Biswajit Swain",   date: "2026-02-25", status: "Enrolled" },
      { name: "Pankaj Mishra",    date: "2026-02-27", status: "Enrolled" },
    ],
    drives: [
      { name: "Barbil Rural Drive",             date: "2026-02-05", location: "Barbil" },
      { name: "Rourkela Employment Mela",        date: "2026-02-14", location: "Rourkela" },
      { name: "Sundargarh Block Campaign",       date: "2026-02-20", location: "Sundargarh" },
      { name: "Sambalpur Awareness Rally",       date: "2026-02-26", location: "Sambalpur" },
    ],
  },
  "2026-01": {
    candidates: [
      { name: "Prakash Sahu",    date: "2026-01-05", status: "Enrolled" },
      { name: "Nirmala Jena",    date: "2026-01-12", status: "Enrolled" },
      { name: "Vikram Panda",    date: "2026-01-18", status: "Enrolled" },
      { name: "Laxmi Rout",      date: "2026-01-25", status: "Enrolled" },
    ],
    drives: [
      { name: "Keonjhar Outreach Camp",   date: "2026-01-08",  location: "Keonjhar" },
      { name: "Koraput Skill Drive",       date: "2026-01-20", location: "Koraput" },
    ],
  },
};

const INVOICES = [
  { id: "INV-M-0023", month: "February 2026", amount: 8000,  status: "Paid",     raisedOn: "2026-03-01" },
  { id: "INV-M-0022", month: "January 2026",  amount: 4000,  status: "Approved", raisedOn: "2026-02-01" },
];

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */

const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const calcEarnings = (data) => {
  const enrolled      = data.candidates.filter((c) => c.status === "Enrolled").length;
  const drivesCount   = data.drives.length;
  const enrollAmt     = enrolled * PER_ENROLLED;
  const driveAmt      = drivesCount * PER_DRIVE;
  return { enrolled, drivesCount, enrollAmt, driveAmt, net: enrollAmt + driveAmt };
};

const statusColor = (s) =>
  s === "Paid" ? "text-emerald-400" : s === "Approved" ? "text-amber-400" : "text-yellow-400";
const statusBg = (s) =>
  s === "Paid" ? "bg-emerald-500/10 border-emerald-500/20" : s === "Approved" ? "bg-amber-500/10 border-amber-500/20" : "bg-yellow-500/10 border-yellow-500/20";

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */

export default function MobilizerRevenue() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const [invoiceModal, setInvoiceModal]   = useState(false);
  const [invoiceNotes, setInvoiceNotes]   = useState("");
  const [invoices, setInvoices]           = useState(INVOICES);

  const data     = MONTHLY_DATA[selectedMonth] || { candidates: [], drives: [] };
  const earnings = useMemo(() => calcEarnings(data), [selectedMonth]);

  const monthLabel = (() => {
    const [y, m] = selectedMonth.split("-");
    return `${MONTHS[parseInt(m) - 1]} ${y}`;
  })();

  /* ── raise invoice ─────────────────────────────────────────── */
  const raiseInvoice = () => {
    const inv = {
      id: `INV-M-${String(invoices.length + 24).padStart(4, "0")}`,
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
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* ─── Header ──────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 animate-fade-in-up">
          <div>
            <p className="text-xs tracking-widest text-yellow-400/80 uppercase mb-2 font-medium">Mobilizer Revenue</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-md">Monthly Commission</h1>
          </div>
          <div className="relative w-56 animate-scale-up" style={{ animationDelay: "100ms" }}>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl
                         px-4 py-3 text-sm text-white/90 focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50 focus:outline-none
                         cursor-pointer pr-10 hover:bg-white/[0.06] transition-colors shadow-lg shadow-black/20"
            >
              {Object.keys(MONTHLY_DATA).map((k) => {
                const [y, m] = k.split("-");
                return <option key={k} value={k} className="bg-[#0b1220]">{MONTHS[parseInt(m) - 1]} {y}</option>;
              })}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
          </div>
        </div>

        {/* ─── Overview Cards ──────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card delay="150ms" icon={Users}       label="Enrolled"           value={earnings.enrolled}                                         accent="sky" />
          <Card delay="250ms" icon={IndianRupee} label="Enrollment Earning" value={`₹${earnings.enrollAmt.toLocaleString("en-IN")}`}          sub={`${earnings.enrolled} × ₹${PER_ENROLLED}`} accent="emerald" />
          <Card delay="350ms" icon={Megaphone}   label="Drives Conducted"   value={earnings.drivesCount}                                      sub={`${earnings.drivesCount} × ₹${PER_DRIVE.toLocaleString("en-IN")}`} accent="orange" />
          <Card delay="450ms" icon={TrendingUp}  label="Net Payable"        value={`₹${earnings.net.toLocaleString("en-IN")}`}                accent="yellow" highlight />
        </div>

        {/* ─── Detailed Breakdown ──────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* candidates */}
          <div className="bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/[0.05] p-6 space-y-5 animate-fade-in-up hover:bg-white/[0.03] transition-colors shadow-lg shadow-black/20" style={{ animationDelay: "550ms" }}>
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Users size={18} className="text-emerald-400" />
                </div>
                <h2 className="text-base font-semibold text-white tracking-wide">Enrollment Breakdown</h2>
              </div>
              <span className="text-xs text-emerald-400/80 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">₹{PER_ENROLLED}/candidate</span>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {data.candidates.map((c, i) => (
                <div key={i} className="flex items-center justify-between bg-transparent/20 rounded-xl px-4 py-3 border border-white/5 hover:border-white/10 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-white/90">{c.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{c.date}</p>
                  </div>
                  <div className="text-right">
                    {c.status === "Enrolled" ? (
                      <span className="text-[13px] font-bold text-emerald-400 drop-shadow-sm">+ ₹{PER_ENROLLED}</span>
                    ) : (
                      <span className="text-[11px] text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1"><AlertCircle size={10} /> Pending</span>
                    )}
                  </div>
                </div>
              ))}
              {data.candidates.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No candidates this month.</p>}
            </div>
            <div className="flex justify-between items-center text-sm pt-4 border-t border-white/5">
              <span className="text-white/60 uppercase tracking-wide text-xs">Total ({earnings.enrolled} finalized)</span>
              <span className="font-bold text-emerald-400 text-lg">₹{earnings.enrollAmt.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* drives */}
          <div className="bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/[0.05] p-6 space-y-5 animate-fade-in-up hover:bg-white/[0.03] transition-colors shadow-lg shadow-black/20" style={{ animationDelay: "650ms" }}>
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <Megaphone size={18} className="text-orange-400" />
                </div>
                <h2 className="text-base font-semibold text-white tracking-wide">Community Drives</h2>
              </div>
              <span className="text-xs text-orange-400/80 font-medium bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">₹{PER_DRIVE.toLocaleString("en-IN")}/drive</span>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {data.drives.map((d, i) => (
                <div key={i} className="flex items-center justify-between bg-transparent/20 rounded-xl px-4 py-3 border border-white/5 hover:border-white/10 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-white/90">{d.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{d.date} · {d.location}</p>
                  </div>
                  <span className="text-[13px] font-bold text-orange-400 drop-shadow-sm">+ ₹{PER_DRIVE.toLocaleString("en-IN")}</span>
                </div>
              ))}
              {data.drives.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No drives conducted this month.</p>}
            </div>
            <div className="flex justify-between items-center text-sm pt-4 border-t border-white/5">
              <span className="text-white/60 uppercase tracking-wide text-xs">Total ({earnings.drivesCount} events)</span>
              <span className="font-bold text-orange-400 text-lg">₹{earnings.driveAmt.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* ─── Monthly Trend Visual ───────────────── */}
        <div className="bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/[0.05] p-6 sm:p-8 animate-fade-in-up shadow-xl shadow-black/20" style={{ animationDelay: "750ms" }}>
          <h2 className="text-sm font-semibold text-white mb-6 uppercase tracking-widest text-white/80">Earnings History Visualizer</h2>
          <div className="flex items-end gap-3 sm:gap-6 h-40">
            {Object.entries(MONTHLY_DATA).reverse().map(([key, d]) => {
              const e = calcEarnings(d);
              const maxAmt = Math.max(...Object.values(MONTHLY_DATA).map((x) => calcEarnings(x).net), 100);
              const hPct = (e.net / maxAmt) * 100;
              const [, m] = key.split("-");
              const isCurrent = key === selectedMonth;
              
              return (
                <div key={key} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setSelectedMonth(key)}>
                  <span className={`text-[11px] font-bold transition-colors ${isCurrent ? "text-yellow-400" : "text-white/60 group-hover:text-yellow-400/70"}`}>₹{(e.net / 1000).toFixed(1)}k</span>
                  <div className="w-full bg-transparent/40 rounded-t-xl overflow-hidden border-b border-white/5 relative flex-1">
                    <div
                      className={`absolute bottom-0 w-full rounded-t-xl transition-all duration-700 ease-out 
                                  ${isCurrent ? "bg-gradient-to-t from-yellow-500/80 to-yellow-400/60 shadow-[0_0_15px_rgba(250,204,21,0.5)]" : "bg-gradient-to-t from-slate-600 to-slate-500 outline outline-1 outline-white/5 group-hover:from-yellow-500/40 group-hover:to-yellow-400/20"}`}
                      style={{ height: `${hPct}%` }}
                    />
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isCurrent ? "text-yellow-400" : "text-slate-500 group-hover:text-white/80"}`}>{MONTHS[parseInt(m) - 1]?.slice(0, 3)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Invoice History ─────────────────────────────── */}
        <div className="bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/[0.05] overflow-hidden animate-fade-in-up shadow-xl shadow-black/20" style={{ animationDelay: "850ms" }}>
          <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-white/[0.05] bg-white/[0.01]">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <FileText size={18} className="text-yellow-400" /> Invoice History
            </h2>
            <button
              onClick={() => setInvoiceModal(true)}
              className="group flex items-center gap-2 px-5 py-2.5 text-sm font-semibold
                         bg-yellow-400 text-black rounded-lg
                         hover:bg-yellow-300 hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]
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
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group animate-fade-in" style={{ animationDelay: `${900 + idx * 50}ms` }}>
                    <td className="px-6 py-4 font-mono text-white/80 group-hover:text-yellow-300 transition-colors">{inv.id}</td>
                    <td className="px-6 py-4 text-white/90">{inv.month}</td>
                    <td className="px-6 py-4 font-bold text-yellow-400">₹{inv.amount.toLocaleString("en-IN")}</td>
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

      {/* ─── Invoice Modal ────────────────────────────────── */}
      <SlidePanel open={!!invoiceModal} onClose={() => setInvoiceModal(false)} title="18} className=text-yellow-400 /> Raise I" width="md">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Send size={18} className="text-yellow-400" /> Raise Invoice
              </h3>
              <button onClick={() => setInvoiceModal(false)} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"><X size={18} /></button>
            </div>

            <div className="space-y-5 bg-white/[0.02] rounded-xl p-5 border border-white/5">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <label className="text-xs text-white/60 font-medium">Month</label>
                <p className="text-sm font-semibold text-white">{monthLabel}</p>
              </div>
              
              <div>
                <label className="text-xs text-white/60 font-medium tracking-wide mb-3 block">Breakdown</label>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center bg-transparent/20 p-3 rounded-lg border border-white/5">
                     <span className="text-sm text-white/80 flex items-center gap-2"><Users size={14} className="text-emerald-400"/> Enrollments ({earnings.enrolled})</span>
                     <span className="text-sm font-semibold text-emerald-400">₹{earnings.enrollAmt.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between items-center bg-transparent/20 p-3 rounded-lg border border-white/5">
                     <span className="text-sm text-white/80 flex items-center gap-2"><Megaphone size={14} className="text-orange-400"/> Community Drives ({earnings.drivesCount})</span>
                     <span className="text-sm font-semibold text-orange-400">₹{earnings.driveAmt.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <label className="text-xs text-white/60 font-medium">Net Payable</label>
                <p className="text-2xl font-bold text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]">₹{earnings.net.toLocaleString("en-IN")}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-white/60 font-medium ml-1">Admin Notes (optional)</label>
              <textarea
                value={invoiceNotes}
                onChange={(e) => setInvoiceNotes(e.target.value)}
                rows={3}
                className="w-full bg-transparent/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90
                           focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50 focus:outline-none resize-none transition-all placeholder:text-slate-600"
                placeholder="Mention any specific claim references..."
              />
            </div>

            <button
              onClick={raiseInvoice}
              className="w-full py-3.5 bg-yellow-400 text-black rounded-xl font-bold text-sm
                         hover:bg-yellow-300 hover:shadow-[0_0_25px_rgba(250,204,21,0.4)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Send size={16} /> Submit Invoice For Approval
            </button>
      </SlidePanel>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════ */

function Card({ icon: Icon, label, value, sub, accent = "yellow", highlight, delay }) {
  const accentConfigs = {
    yellow:  { bg: "bg-yellow-500/10",  border: "border-yellow-500/20",  text: "text-yellow-400",  ring: "ring-yellow-400/30 shadow-yellow-500/10" },
    orange:  { bg: "bg-orange-500/10",  border: "border-orange-500/20",  text: "text-orange-400",  ring: "ring-orange-500/30 shadow-orange-500/10" },
    sky:     { bg: "bg-sky-500/10",     border: "border-sky-500/20",     text: "text-sky-400",     ring: "ring-sky-500/30 shadow-sky-500/10" },
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", ring: "ring-emerald-500/30 shadow-emerald-500/10" },
  };
  const c = accentConfigs[accent] || accentConfigs.yellow;
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
