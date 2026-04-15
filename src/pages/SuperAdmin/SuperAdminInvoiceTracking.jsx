import React, { useState, useMemo, useEffect } from "react";
import SlidePanel from "../../components/common/SlidePanel";
import {
  FileText, Search, CheckCircle2, XCircle, Clock, Eye, ChevronDown,
  Building2, Filter, X, Check, Ban, CreditCard, ScrollText,
  FolderKanban, Utensils, GraduationCap, Megaphone, Briefcase, FileBadge, TrendingUp
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   DEMO DATA
═══════════════════════════════════════════════════════════════ */

const ALL_INVOICES = [
  { 
    id: "INV-AF-0102", type: "Food Billing", project: "L&T Skill India", center: "Bhubaneswar Hub", adminName: "Ananya Mishra", 
    month: "January 2026", amount: 330000, status: "Pending", raisedOn: "2026-02-02", 
    details: { students: 110, rate: 3000, attendance: 78 }, notes: "",
    evidence: { label: "Attendance Log", value: "78% (Threshold: 70%)", icon: CheckSquare, color: "emerald" }
  },
  { 
    id: "INV-AF-0099", type: "Food Billing", project: "NALCO CSR Skilling", center: "Angul Training Center", adminName: "Priyadarshini Sahu", 
    month: "March 2026", amount: 480000, status: "Approved", raisedOn: "2026-04-01", 
    details: { students: 160, rate: 3000, attendance: 88 }, notes: "Includes extra provision for medical camp day.",
    evidence: { label: "Attendance Log", value: "88% (Threshold: 70%)", icon: CheckSquare, color: "emerald" }
  },
  { 
    id: "INV-T-0041", type: "Trainer Salary", project: "L&T Skill India", center: "Bhubaneswar Hub", adminName: "Suresh Kumar", 
    month: "February 2026", amount: 25000, status: "Approved", raisedOn: "2026-03-01", 
    details: { base: 25000, hoursPct: 100, visitsPct: 100 }, notes: "Verified by Center Admin.",
    evidence: { label: "Training Log", value: "160/160h logged, 4/4 visits", icon: GraduationCap, color: "purple" }
  },
  { 
    id: "INV-T-0039", type: "Trainer Salary", project: "NALCO CSR Skilling", center: "Angul Training Center", adminName: "Anita Mohanty", 
    month: "March 2026", amount: 23125, status: "Pending", raisedOn: "2026-03-15", 
    details: { base: 25000, hoursPct: 94, visitsPct: 100 }, notes: "Early submission verified by Admin.",
    evidence: { label: "Training Log", value: "150/160h logged, 4/4 visits", icon: GraduationCap, color: "purple" }
  },
  { 
    id: "INV-M-0020", type: "Mobilizer Comm.", project: "OMC Mining Ops", center: "Keonjhar Tech", adminName: "Sunita Hembram", 
    month: "February 2026", amount: 5500, status: "Approved", raisedOn: "2026-03-01", 
    details: { enrolled: 7, drives: 2 }, notes: "Admin signed off on candidate enrollments.",
    evidence: { label: "Mobilization Proof", value: "7 Enrolled, 2 Drives", icon: Megaphone, color: "yellow" }
  },
  { 
    id: "INV-P-0017", type: "Placement Salary", project: "L&T Skill India", center: "Bhubaneswar Hub", adminName: "Vikram Das", 
    month: "February 2026", amount: 30000, status: "Paid", raisedOn: "2026-03-01", 
    details: { base: 30000, placedPct: 100, drivesPct: 100 }, notes: "Placements confirmed with HRs.", paidOn: "2026-03-04", txnRef: "TXN-20260304-8812",
    evidence: { label: "Offer Letters", value: "20/20 Placed, 3/3 Drives", icon: Briefcase, color: "cyan" }
  },
];

/* ═══════════════════════════════════════════════════════════════
   HELPERS & STYLING META
═══════════════════════════════════════════════════════════════ */

const STATUS_META = {
  Pending:  { icon: Clock,        bg: "bg-amber-500/15",    text: "text-amber-400",   border: "border-amber-400/30", dot: "bg-amber-400" },
  Approved: { icon: CheckCircle2, bg: "bg-blue-500/15",     text: "text-blue-400",    border: "border-blue-400/30",  dot: "bg-blue-400" },
  Paid:     { icon: CheckCircle2, bg: "bg-emerald-500/15",  text: "text-emerald-400", border: "border-emerald-400/30", dot: "bg-emerald-400" },
  Rejected: { icon: XCircle,      bg: "bg-red-500/15",      text: "text-red-400",     border: "border-red-400/30", dot: "bg-red-400" },
};

const TYPE_META = {
  "Food Billing":     { icon: Utensils,      color: "text-orange-400", bg: "bg-orange-500/10" },
  "Trainer Salary":   { icon: GraduationCap, color: "text-purple-400", bg: "bg-purple-500/10" },
  "Mobilizer Comm.":  { icon: Megaphone,     color: "text-yellow-400", bg: "bg-yellow-500/10" },
  "Placement Salary": { icon: Briefcase,     color: "text-cyan-400",   bg: "bg-cyan-500/10" },
};

function CheckSquare(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="9 11 12 14 22 4"></polyline>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */

export default function SuperAdminInvoiceTracking() {
  const [invoices, setInvoices]           = useState(ALL_INVOICES);
  const [search, setSearch]               = useState("");
  const [projectFilter, setProjectFilter] = useState("All");
  const [monthFilter, setMonthFilter]     = useState("All");
  const [typeFilter, setTypeFilter]       = useState("All");
  const [statusFilter, setStatusFilter]   = useState("All");
  
  const [detailInv, setDetailInv]         = useState(null);
  const [payModal, setPayModal]           = useState(null);
  const [txnRef, setTxnRef]               = useState("");

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const uniqueProjects = useMemo(() => ["All", ...new Set(ALL_INVOICES.map(i => i.project))], []);
  const uniqueMonths   = useMemo(() => ["All", ...new Set(ALL_INVOICES.map(i => i.month))], []);
  const types          = ["All", "Food Billing", "Trainer Salary", "Mobilizer Comm.", "Placement Salary"];
  const statuses       = ["All", "Pending", "Approved", "Paid", "Rejected"];

  /* ── FILTERING ── */
  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      if (projectFilter !== "All" && inv.project !== projectFilter) return false;
      if (monthFilter !== "All" && inv.month !== monthFilter) return false;
      if (typeFilter !== "All" && inv.type !== typeFilter) return false;
      if (statusFilter !== "All" && inv.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          inv.id.toLowerCase().includes(q) ||
          inv.center.toLowerCase().includes(q) ||
          inv.adminName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [invoices, search, projectFilter, monthFilter, typeFilter, statusFilter]);

  const summary = useMemo(() => {
    const pending  = invoices.filter((i) => i.status === "Pending");
    const approved = invoices.filter((i) => i.status === "Approved");
    const paid     = invoices.filter((i) => i.status === "Paid");
    return {
      totalPending:  pending.reduce((s, i) => s + i.amount, 0),
      countPending:  pending.length,
      totalApproved: approved.reduce((s, i) => s + i.amount, 0),
      countApproved: approved.length,
      totalPaid:     paid.reduce((s, i) => s + i.amount, 0),
      countPaid:     paid.length,
      totalAll:      invoices.reduce((s, i) => s + i.amount, 0),
    };
  }, [invoices]);

  /* ── ACTIONS ── */
  const updateStatus = (id, newStatus, extra = {}) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: newStatus, ...extra } : inv))
    );
    setDetailInv(null);
    setPayModal(null);
    setTxnRef("");
  };

  const approveInvoice = (id) => updateStatus(id, "Approved");
  const rejectInvoice  = (id) => updateStatus(id, "Rejected");
  const markPaid       = (id) => {
    const today = new Date().toISOString().split("T")[0];
    updateStatus(id, "Paid", { paidOn: today, txnRef: txnRef || `TXN-${Date.now()}` });
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */
  return (
    <section className={`min-h-screen text-white/90 p-6 md:p-10 relative overflow-hidden bg-gradient-to-br from-[#0a0f18] to-[#121824] transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Background Orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-red-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* ─── Header ──────────────────────────────────────── */}
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Global Finance Center
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight">
            Project Invoice Tracking
          </h1>
          <p className="text-sm md:text-base text-white/60 mt-2 max-w-2xl font-medium">
            Monitor, verify, and disburse Center Food Billing & Field Staff Invoices across all projects from a single authoritative dashboard.
          </p>
        </div>

        {/* ─── Summary Cards ───────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <SummaryCard icon={Clock}        label="Pending Sign-off" count={summary.countPending}  amount={summary.totalPending}  accent="amber" delay="delay-100" />
          <SummaryCard icon={CheckCircle2} label="Approved for Pay" count={summary.countApproved} amount={summary.totalApproved} accent="blue" delay="delay-200" />
          <SummaryCard icon={CreditCard}   label="Disbursed Funds"  count={summary.countPaid}     amount={summary.totalPaid}     accent="emerald" delay="delay-300" />
          <SummaryCard icon={ScrollText}   label="Total Billed"     count={invoices.length}       amount={summary.totalAll}      accent="red" highlight delay="delay-400" />
        </div>

        {/* ─── Controls & Filters ──────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 bg-white/[0.02] backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-fade-in-up delay-500">
          <div className="flex items-center gap-2 px-2 border-r border-slate-700/50 pr-5">
            <Filter size={16} className="text-red-400" />
            <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest">Filters</span>
          </div>

          <div className="relative flex-1 min-w-[200px] group">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-red-400 transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search center, ID, or user..."
              className="w-full bg-[#0b1220]/50 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 
                         text-sm text-white/90 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all placeholder:text-slate-500"
            />
          </div>

          {[
            { icon: FolderKanban, value: projectFilter, setValue: setProjectFilter, options: uniqueProjects, width: "w-[160px]" },
            { value: monthFilter, setValue: setMonthFilter, options: uniqueMonths, width: "w-[140px]" },
            { value: typeFilter, setValue: setTypeFilter, options: types, width: "w-[160px]" },
            { value: statusFilter, setValue: setStatusFilter, options: statuses, width: "w-[140px]" }
          ].map((filter, idx) => (
            <div key={idx} className={`relative ${filter.width}`}>
              {filter.icon && <filter.icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />}
              <select
                value={filter.value}
                onChange={(e) => filter.setValue(e.target.value)}
                className={`appearance-none w-full bg-[#0b1220]/50 border border-slate-700/80 rounded-xl ${filter.icon ? 'pl-10' : 'pl-4'} pr-9 py-2.5 
                           text-[13px] text-white/80 focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all cursor-pointer`}
              >
                {filter.options.map(opt => <option key={opt} value={opt} className="bg-transparent">{opt}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* ─── Invoice Table ───────────────────────────────── */}
        <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-fade-in-up delay-600">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-transparent/20 text-white/60 uppercase tracking-wider text-[10px] border-b border-white/5">
                <tr>
                  <th className="px-6 py-5 text-left font-semibold">Invoice & Date</th>
                  <th className="px-6 py-5 text-left font-semibold">Project & Center</th>
                  <th className="px-6 py-5 text-left font-semibold">Type & Target Month</th>
                  <th className="px-6 py-5 text-left font-semibold">Amount</th>
                  <th className="px-6 py-5 text-left font-semibold">Status</th>
                  <th className="px-6 py-5 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center animate-fade-in">
                      <div className="flex flex-col items-center justify-center opacity-40">
                        <ScrollText size={48} className="mb-4 text-slate-500" />
                        <p className="text-sm text-white/60">No invoices match your filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((inv) => {
                    const sm = STATUS_META[inv.status] || STATUS_META.Pending;
                    const tm = TYPE_META[inv.type];
                    return (
                      <tr 
                        key={inv.id} 
                        className="hover:bg-white/[0.02] transition-colors group animate-fade-in"
                      >
                        <td className="px-6 py-5">
                          <div className="font-mono text-white/90 text-xs font-medium mb-1.5">{inv.id}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                            <Clock size={10} /> {inv.raisedOn}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-white/90 font-semibold text-[13px] flex items-center gap-2 mb-1.5">
                            <Building2 size={14} className="text-white/60" /> {inv.center}
                          </div>
                          <div className="text-[11px] text-white/60 flex items-center gap-1.5 bg-transparent/50 w-fit px-2 py-0.5 rounded">
                            <FolderKanban size={10} className="text-red-400" /> {inv.project}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase mb-2 border border-white/5 ${tm.bg} ${tm.color}`}>
                            <tm.icon size={12} /> {inv.type}
                          </span>
                          <div className="text-[11px] text-white/60 font-medium">Billed by {inv.adminName}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">
                            ₹{inv.amount.toLocaleString("en-IN")}
                          </div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{inv.month}</div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border ${sm.bg} ${sm.border} ${sm.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sm.dot} shadow-[0_0_8px_currentColor]`} />
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                            <button onClick={() => setDetailInv(inv)} className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-slate-700/50 transition-all shadow-sm" title="View Detail">
                              <Eye size={16} />
                            </button>
                            {inv.status === "Pending" && (
                              <button onClick={() => approveInvoice(inv.id)} className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-all shadow-sm" title="Approve for Payment">
                                <Check size={16} />
                              </button>
                            )}
                            {inv.status === "Pending" && (
                              <button onClick={() => rejectInvoice(inv.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all shadow-sm" title="Reject">
                                <Ban size={16} />
                              </button>
                            )}
                            {inv.status === "Approved" && (
                              <button onClick={() => setPayModal(inv)} className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-all shadow-sm" title="Disburse Funds">
                                <CreditCard size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
         DETAIL \& EVIDENCE MODAL
      ═══════════════════════════════════════════════════════ */}
      <SlidePanel open={!!detailInv} onClose={() => setDetailInv(null)} title="Invoice Details" width="xl">
          <div>
            {(() => {
              const inv = detailInv;
              const sm  = STATUS_META[inv.status];
              const tm  = TYPE_META[inv.type];
              const EviIcon = inv.evidence.icon;
              return (
                <>
                  {/* Modal Header */}
                  <div className="relative p-7 border-b border-white/10 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[80px] rounded-full pointer-events-none" />
                    
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-xl bg-transparent/80 border border-slate-700 flex items-center justify-center">
                            <FileText size={20} className="text-red-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-100 tracking-tight">Invoice {inv.id}</h3>
                            <p className="text-[11px] text-white/60 font-medium">Raised on {inv.raisedOn}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider mt-2 border border-white/5 ${tm.bg} ${tm.color}`}>
                          <tm.icon size={14} /> {inv.type}
                        </span>
                      </div>
                      <button onClick={() => setDetailInv(null)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="p-7 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Grid Data */}
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="bg-white/5 rounded-2xl p-5 border border-white/5 backdrop-blur-sm space-y-4">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Project Context</p>
                          <p className="font-semibold text-red-400 text-[15px] mt-1">{inv.project}</p>
                          <p className="text-[13px] text-white/80 flex items-center gap-2 mt-1.5"><Building2 size={14} className="text-slate-500" /> {inv.center}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Billed By</p>
                            <p className="text-[13px] text-white/90 mt-1 font-medium">{inv.adminName}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Target Month</p>
                            <p className="text-[13px] text-white/90 mt-1 font-medium">{inv.month}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-white/5 to-transparent rounded-2xl p-5 border border-white/10 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none" />
                        <div className="relative z-10">
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Status Overview</p>
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${sm.bg} ${sm.border} ${sm.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} /> {inv.status}
                          </span>
                        </div>
                        <div className="relative z-10 mt-6 pt-4 border-t border-white/5">
                          <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Net Payable Value</p>
                          <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200 mt-1">
                            ₹{inv.amount.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Evidence Tracker */}
                    <div className="bg-[#151b29] border border-blue-500/10 rounded-2xl overflow-hidden shadow-lg relative">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[50px] rounded-full" />
                      <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between relative z-10">
                        <h4 className="text-[15px] font-semibold flex items-center gap-2 text-white/90">
                          <FileBadge size={18} className="text-blue-400" /> Source Evidence & Justification
                        </h4>
                        <span className="text-[9px] text-blue-400/80 font-bold uppercase tracking-widest bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                          Super Admin Verification required
                        </span>
                      </div>
                      
                      <div className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner
                          ${inv.evidence.color === 'emerald' ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-emerald-400 border border-emerald-500/20' : 
                            inv.evidence.color === 'yellow'  ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 text-yellow-400 border border-yellow-500/20' :
                            inv.evidence.color === 'cyan'    ? 'bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 text-cyan-400 border border-cyan-500/20' : 
                            'bg-gradient-to-br from-purple-500/20 to-purple-500/5 text-purple-400 border border-purple-500/20'}`}>
                          <EviIcon size={32} />
                        </div>
                        <div className="space-y-1.5 w-full text-center sm:text-left">
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{inv.evidence.label}</p>
                          <p className="text-xl font-black text-slate-100">{inv.evidence.value}</p>
                          
                          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-4 border-t border-white/5 gap-3">
                            <p className="text-[13px] text-white/60 flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                              <CheckCircle2 size={16} className="text-emerald-400" /> 
                              <span className="line-clamp-1">{inv.notes || "Admin has verified and signed off on this achievement log."}</span>
                            </p>
                            <button className="whitespace-nowrap px-4 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold rounded-lg transition-colors border border-blue-500/20">
                              View Source Document
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {inv.status === "Paid" && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 animate-fade-in">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 size={20} className="text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-[10px] text-emerald-400/80 uppercase tracking-widest font-bold">Funds Disbursed</p>
                            <p className="text-[15px] font-semibold text-emerald-100 mt-0.5">Paid on {inv.paidOn}</p>
                          </div>
                        </div>
                        <div className="text-right bg-transparent/20 px-4 py-2 rounded-xl border border-white/5">
                          <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Transaction Conf. Ref</p>
                          <p className="text-[13px] font-mono font-bold text-emerald-300 mt-1 tracking-wider">{inv.txnRef}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Footer */}
                  <div className="p-6 border-t border-white/10 bg-transparent/20 flex flex-wrap gap-3">
                    {inv.status === "Pending" && (
                      <>
                        <button onClick={() => approveInvoice(inv.id)} className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold text-sm hover:from-blue-500 hover:to-blue-400 flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] transition-all transform hover:-translate-y-0.5">
                          <Check size={18} /> Finalize Approval
                        </button>
                        <button onClick={() => rejectInvoice(inv.id)} className="px-6 py-3.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl font-bold text-sm hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 mt-2 sm:mt-0">
                          <Ban size={18} /> Return
                        </button>
                      </>
                    )}
                    {inv.status === "Approved" && (
                      <button onClick={() => { setDetailInv(null); setPayModal(inv); }} className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-bold text-sm hover:from-emerald-500 hover:to-emerald-400 flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] transition-all transform hover:-translate-y-0.5">
                        <CreditCard size={18} /> Record Funds Disbursement
                      </button>
                    )}
                    {inv.status === "Paid" && (
                      <button onClick={() => setDetailInv(null)} className="w-full py-3.5 bg-white/5 text-white/80 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors">
                        Close Viewer
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
      </SlidePanel>

      {/* ═══════════════════════════════════════════════════════
         PAY MODAL
      ═══════════════════════════════════════════════════════ */}
      <SlidePanel open={!!payModal} onClose={() => { setPayModal(null); setTxnRef(""); }} title="Confirm Payment" width="md">
            <div className="space-y-5">
              {payModal && (<>
              <div className="bg-transparent/30 p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-white/60 font-medium">Target Invoice</span>
                  <span className="font-mono text-white/90 bg-white/5 px-2 py-0.5 rounded">{payModal.id}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-white/60 font-medium">Project Source</span>
                  <span className="text-red-400 font-bold">{payModal.project}</span>
                </div>
                <div className="pt-4 border-t border-white/5 flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Amount to Transfer</span>
                  <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">
                    ₹{payModal.amount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-white/60 uppercase tracking-widest font-bold ml-1">Bank Transaction Reference ID</label>
                <input
                  value={txnRef}
                  onChange={(e) => setTxnRef(e.target.value)}
                  placeholder="e.g. UTR-XXXXXXXXXXXXXXXX"
                  className="w-full bg-transparent/30 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white/90 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none placeholder:text-slate-600 transition-all font-mono"
                />
              </div>

              <button 
                onClick={() => markPaid(payModal.id)} 
                className="w-full mt-2 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-bold text-[15px] hover:from-emerald-500 hover:to-emerald-400 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} /> Mark as Disbursed
              </button>
              </>)}
            </div>
      </SlidePanel>

      {/* Tailwind specific animations injected via inline style block to ensure they exist since we removed framer */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-scale-up {
          animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-600 { animation-delay: 600ms; }
      `}} />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════ */

function SummaryCard({ icon: Icon, label, count, amount, accent = "red", highlight, delay = "" }) {
  const ring = highlight ? "ring-1 ring-red-500/30 overflow-hidden relative" : "relative overflow-hidden";
  const colorMap = {
    amber: "text-amber-400 bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-amber-500/20",
    blue: "text-blue-400 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/20",
    emerald: "text-emerald-400 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-emerald-500/20",
    red: "text-red-400 bg-gradient-to-br from-red-500/20 to-red-500/5 border-red-500/20",
  };
  const acClass = colorMap[accent] || colorMap.red;

  return (
    <div className={`bg-white/[0.02] backdrop-blur-md rounded-3xl border border-white/5 p-6 shadow-xl animate-fade-in-up opacity-0 ${delay} ${ring}`} style={{ animationFillMode: "forwards" }}>
      {highlight && <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[40px] rounded-full pointer-events-none" />}
      
      <div className="flex items-center justify-between mb-5 relative z-10">
        <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest">{label}</span>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner border ${acClass}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="relative z-10">
        <p className={`text-3xl font-black tracking-tight ${highlight ? "text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-200" : "text-slate-100"}`}>
          ₹{amount.toLocaleString("en-IN")}
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 bg-transparent/20 px-2.5 py-1 rounded-md border border-white/5">
          <TrendingUp size={12} className={highlight ? "text-red-400" : "text-white/60"} />
          <p className="text-[11px] font-semibold text-white/80">
            {count} document{count !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
