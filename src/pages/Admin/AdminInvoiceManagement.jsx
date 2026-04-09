import React, { useState, useMemo, useEffect } from "react";
import {
  FileText, Search, CheckCircle2, XCircle, Clock, Eye, ChevronDown,
  Users, GraduationCap, Megaphone, Briefcase, Filter, X, Check, Ban, CreditCard,
  AlertCircle, Utensils, CalendarDays, Activity, Send, TrendingUp
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   DEMO INVOICE DATA 
═══════════════════════════════════════════════════════════════ */

const STAFF_INVOICES = [
  { id: "INV-T-0042", name: "Suresh Kumar", role: "Trainer", month: "March 2026", amount: 21156, status: "Pending", raisedOn: "2026-03-16", breakdown: { type: "salary", base: 25000, components: [{ label: "Hours (142/160h)", pct: 89, amount: 15531 }, { label: "Visits (3/4)", pct: 75, amount: 5625 }] }, notes: "" },
  { id: "INV-T-0041", name: "Anita Mohanty", role: "Trainer", month: "February 2026", amount: 25000, status: "Approved", raisedOn: "2026-03-01", breakdown: { type: "salary", base: 25000, components: [{ label: "Hours (160/160h)", pct: 100, amount: 17500 }, { label: "Visits (4/4)", pct: 100, amount: 7500 }] }, notes: "Early submission" },
  { id: "INV-M-0023", name: "Rajesh Pradhan", role: "Mobilizer", month: "March 2026", amount: 6000, status: "Pending", raisedOn: "2026-03-16", breakdown: { type: "commission", items: [{ label: "Enrolled Candidates", count: 6, rate: 500, amount: 3000 }, { label: "Community Drives", count: 3, rate: 1000, amount: 3000 }] }, notes: "" },
  { id: "INV-P-0017", name: "Vikram Das", role: "Placement Officer", month: "February 2026", amount: 30000, status: "Paid", raisedOn: "2026-03-01", breakdown: { type: "salary", base: 30000, components: [{ label: "Placements (20/20)", pct: 100, amount: 24000 }, { label: "Drives (3/3)", pct: 100, amount: 6000 }] }, notes: "", paidOn: "2026-03-04", txnRef: "TXN-20260304-8812" },
];

const FOOD_RATE_PER_STUDENT = 3000;
const MIN_ATTENDANCE_PCT    = 70;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const FOOD_MONTHLY_DATA = {
  "2026-03": { activeStudents: 120, attendancePct: 84 },
  "2026-02": { activeStudents: 115, attendancePct: 65 }, // Not eligible
  "2026-01": { activeStudents: 110, attendancePct: 78 }
};

const FOOD_INVOICES = [
  { id: "INV-AF-0102", month: "January 2026", amount: 330000, status: "Paid", raisedOn: "2026-02-02", students: 110 },
  { id: "INV-AF-0101", month: "December 2025", amount: 285000, status: "Paid", raisedOn: "2026-01-05", students: 95 },
];

/* ═══════════════════════════════════════════════════════════════
   HELPERS & STYLING META
═══════════════════════════════════════════════════════════════ */

const ROLE_META = {
  Trainer:             { icon: GraduationCap, color: "text-purple-400", bg: "bg-purple-500/10" },
  Mobilizer:           { icon: Megaphone,     color: "text-yellow-400", bg: "bg-yellow-500/10" },
  "Placement Officer": { icon: Briefcase,     color: "text-cyan-400",   bg: "bg-cyan-500/10" },
};

const STATUS_META = {
  Pending:  { icon: Clock,        bg: "bg-amber-500/15",    text: "text-amber-400",   border: "border-amber-400/30", dot: "bg-amber-400" },
  Approved: { icon: CheckCircle2, bg: "bg-blue-500/15",     text: "text-blue-400",    border: "border-blue-400/30",  dot: "bg-blue-400" },
  Paid:     { icon: CheckCircle2, bg: "bg-emerald-500/15",  text: "text-emerald-400", border: "border-emerald-400/30", dot: "bg-emerald-400" },
  Rejected: { icon: XCircle,      bg: "bg-red-500/15",      text: "text-red-400",     border: "border-red-400/30", dot: "bg-red-400" },
};

const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export default function AdminInvoiceManagement() {
  const [activeTab, setActiveTab] = useState("staff"); // "staff" or "food"
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className={`min-h-screen text-white/90 p-6 md:p-10 relative overflow-hidden bg-gradient-to-br from-[#0a0f18] to-[#121824] transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Background Orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-sky-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="animate-fade-in-up flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              Center Financials
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight">
              Invoice Management
            </h1>
            <p className="text-sm md:text-base text-white/60 mt-2 max-w-2xl font-medium">
              Review staff payout invoices and track center food & boarding operations.
            </p>
          </div>

          {/* Custom Tab Switcher */}
          <div className="flex bg-[#0b1220]/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 shadow-2xl shrink-0">
            <button
              onClick={() => setActiveTab("staff")}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-[13px] transition-all duration-300 ${
                activeTab === "staff" ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]" : "text-slate-500 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              <Users size={16} className={activeTab === "staff" ? "text-purple-400" : ""} /> Staff Approvals
            </button>
            <button
              onClick={() => setActiveTab("food")}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-[13px] transition-all duration-300 ${
                activeTab === "food" ? "bg-orange-500/10 text-orange-50 border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.1)]" : "text-slate-500 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              <Utensils size={16} className={activeTab === "food" ? "text-orange-400" : ""} /> Food Billing
            </button>
          </div>
        </div>

        {activeTab === "staff" ? <StaffInvoicesTab /> : <FoodBillingTab />}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
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
   STAFF INVOICES TAB
═══════════════════════════════════════════════════════════════ */
function StaffInvoicesTab() {
  const [invoices, setInvoices]       = useState(STAFF_INVOICES);
  const [search, setSearch]           = useState("");
  const [roleFilter, setRoleFilter]   = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [detailInv, setDetailInv]     = useState(null);
  const [payModal, setPayModal]       = useState(null);
  const [txnRef, setTxnRef]           = useState("");

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      if (roleFilter !== "All" && inv.role !== roleFilter) return false;
      if (statusFilter !== "All" && inv.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return inv.id.toLowerCase().includes(q) || inv.name.toLowerCase().includes(q) || inv.month.toLowerCase().includes(q);
      }
      return true;
    });
  }, [invoices, search, roleFilter, statusFilter]);

  const summary = useMemo(() => {
    const pending  = invoices.filter((i) => i.status === "Pending");
    const approved = invoices.filter((i) => i.status === "Approved");
    const paid     = invoices.filter((i) => i.status === "Paid");
    return {
      totalPending:  pending.reduce((s, i) => s + i.amount, 0), countPending:  pending.length,
      totalApproved: approved.reduce((s, i) => s + i.amount, 0), countApproved: approved.length,
      totalPaid:     paid.reduce((s, i) => s + i.amount, 0),     countPaid:     paid.length,
      totalAll:      invoices.reduce((s, i) => s + i.amount, 0),
    };
  }, [invoices]);

  const updateStatus = (id, newStatus, extra = {}) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: newStatus, ...extra } : inv));
    setDetailInv(null); setPayModal(null); setTxnRef("");
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <SummaryCard icon={Clock} label="Pending Review" count={summary.countPending} amount={summary.totalPending} accent="amber" delay="delay-100" />
        <SummaryCard icon={CheckCircle2} label="Approved" count={summary.countApproved} amount={summary.totalApproved} accent="blue" delay="delay-200" />
        <SummaryCard icon={CreditCard} label="Paid Out" count={summary.countPaid} amount={summary.totalPaid} accent="emerald" delay="delay-300" />
        <SummaryCard icon={FileText} label="Total Value" count={invoices.length} amount={summary.totalAll} accent="purple" highlight delay="delay-400" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white/[0.02] backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg animate-fade-in-up delay-500">
        <div className="flex items-center gap-2 px-2 border-r border-slate-700/50 pr-5">
          <Filter size={16} className="text-purple-400" />
          <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest">Filters</span>
        </div>
        <div className="relative flex-1 min-w-[200px] group">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-purple-400 transition-colors" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID, name..." className="w-full bg-[#0b1220]/50 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white/90 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all placeholder:text-slate-500" />
        </div>
        {[ 
          { val: roleFilter, set: setRoleFilter, opts: ["All", "Trainer", "Mobilizer", "Placement Officer"], w: "w-[160px]" },
          { val: statusFilter, set: setStatusFilter, opts: ["All", "Pending", "Approved", "Paid", "Rejected"], w: "w-[140px]" }
        ].map((f, i) => (
          <div key={i} className={`relative ${f.w}`}>
            <select value={f.val} onChange={(e) => f.set(e.target.value)} className={`appearance-none w-full bg-[#0b1220]/50 border border-slate-700/80 rounded-xl pl-4 pr-9 py-2.5 text-[13px] text-white/80 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer`}>
              {f.opts.map(o => <option key={o} value={o} className="bg-transparent">{o === 'All' ? `All ${i===0?'Roles':'Statuses'}` : o}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-lg animate-fade-in-up delay-600">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-transparent/20 text-white/60 uppercase tracking-wider text-[10px] border-b border-white/5">
              <tr>
                <th className="px-6 py-5 text-left font-semibold">Invoice & Date</th>
                <th className="px-6 py-5 text-left font-semibold">Staff & Role</th>
                <th className="px-6 py-5 text-left font-semibold">Billing Period</th>
                <th className="px-6 py-5 text-left font-semibold">Amount</th>
                <th className="px-6 py-5 text-left font-semibold">Status</th>
                <th className="px-6 py-5 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-500">No invoices found.</td></tr>
              ) : filtered.map((inv) => {
                const rm = ROLE_META[inv.role]; const sm = STATUS_META[inv.status];
                return (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group animate-fade-in">
                    <td className="px-6 py-5">
                      <div className="font-mono text-white/90 text-xs font-medium mb-1.5">{inv.id}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5"><Clock size={10} /> {inv.raisedOn}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-white/90 font-semibold text-[13px] mb-1.5">{inv.name}</div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase border border-white/5 ${rm.bg} ${rm.color}`}>
                        <rm.icon size={12} /> {inv.role}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-white/80 font-medium">{inv.month}</td>
                    <td className="px-6 py-5">
                      <div className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">
                        ₹{inv.amount.toLocaleString("en-IN")}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border ${sm.bg} ${sm.border} ${sm.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sm.dot} shadow-[0_0_8px_currentColor]`} /> {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setDetailInv(inv)} className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-slate-700/50 transition-all"><Eye size={16} /></button>
                        {inv.status === "Pending" && <button onClick={() => updateStatus(inv.id, "Approved")} className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all"><Check size={16} /></button>}
                        {inv.status === "Pending" && <button onClick={() => updateStatus(inv.id, "Rejected")} className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"><Ban size={16} /></button>}
                        {inv.status === "Approved" && <button onClick={() => setPayModal(inv)} className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-all"><CreditCard size={16} /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detailInv && (
        <div className="fixed inset-0 bg-transparent/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setDetailInv(null)}>
          <div className="bg-[#0f1522] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5 scale-95 animate-scale-up" onClick={e => e.stopPropagation()} style={{animationFillMode:'forwards'}}>
            {(() => {
              const inv = detailInv; const rm = ROLE_META[inv.role]; const sm = STATUS_META[inv.status];
              return (
                <>
                  <div className="relative p-7 border-b border-white/10 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full" />
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-xl bg-transparent/80 border border-slate-700 flex items-center justify-center"><FileText size={20} className="text-purple-400" /></div>
                          <div><h3 className="text-xl font-bold text-slate-100 tracking-tight">Invoice {inv.id}</h3><p className="text-[11px] text-white/60 font-medium">Raised on {inv.raisedOn}</p></div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider mt-2 border border-white/5 ${rm.bg} ${rm.color}`}><rm.icon size={14} /> {inv.role}</span>
                      </div>
                      <button onClick={() => setDetailInv(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white"><X size={18} /></button>
                    </div>
                  </div>

                  <div className="p-7 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="flex flex-col sm:flex-row gap-5">
                      <div className="flex-1 bg-white/5 rounded-2xl p-5 border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Staff Details</p>
                        <p className="font-semibold text-white text-[15px] mt-1">{inv.name}</p>
                        <p className="text-[13px] text-white/60 mt-1">{inv.month}</p>
                      </div>
                      <div className="flex-1 bg-gradient-to-br from-white/5 to-transparent rounded-2xl p-5 border border-white/10 relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full" />
                        <div className="relative z-10">
                          <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Net Payable</p>
                          <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">₹{inv.amount.toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#151b29] border border-slate-700/50 rounded-2xl p-6">
                      <h4 className="text-[13px] font-semibold text-white/80 uppercase tracking-widest mb-4">Earnings Breakdown</h4>
                      {inv.breakdown.type === "salary" ? (
                        <div className="space-y-3">
                          <p className="text-xs text-white/60">Base Rate: ₹{inv.breakdown.base.toLocaleString("en-IN")}</p>
                          {inv.breakdown.components.map((c, i) => (
                            <div key={i} className="flex justify-between items-center bg-transparent/20 p-3 rounded-xl border border-white/5">
                              <div><p className="text-[12px] text-white/80">{c.label}</p><p className="text-[10px] text-slate-500 mt-1">{c.pct}% achieved</p></div>
                              <p className="text-[13px] font-bold text-purple-400">₹{c.amount.toLocaleString("en-IN")}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {inv.breakdown.items.map((c, i) => (
                            <div key={i} className="flex justify-between items-center bg-transparent/20 p-3 rounded-xl border border-white/5">
                              <div><p className="text-[12px] text-white/80">{c.label}</p><p className="text-[10px] text-slate-500 mt-1">{c.count} × ₹{c.rate}</p></div>
                              <p className="text-[13px] font-bold text-yellow-400">₹{c.amount.toLocaleString("en-IN")}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 border-t border-white/10 bg-transparent/20 flex gap-3">
                    {inv.status === "Pending" && (
                      <>
                        <button onClick={() => updateStatus(inv.id, "Approved")} className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)]">
                          <Check size={18} /> Approve
                        </button>
                        <button onClick={() => updateStatus(inv.id, "Rejected")} className="px-6 py-3.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl font-bold flex items-center gap-2">
                          <Ban size={18} /> Reject
                        </button>
                      </>
                    )}
                    {inv.status === "Approved" && (
                      <button onClick={() => { setDetailInv(null); setPayModal(inv); }} className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)]">
                        <CreditCard size={18} /> Disburse Funds
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {payModal && (
        <div className="fixed inset-0 bg-transparent/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => { setPayModal(null); setTxnRef(""); }}>
          <div className="bg-[#0f1522] border border-emerald-500/20 rounded-3xl w-full max-w-md p-8 shadow-[0_0_50px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/10 relative overflow-hidden scale-95 animate-scale-up" onClick={e => e.stopPropagation()} style={{animationFillMode:'forwards'}}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full" />
            <div className="relative z-10 flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"><CreditCard size={20} /></div>
                <h3 className="text-xl font-bold text-white tracking-tight">Confirm Payment</h3>
              </div>
              <button onClick={() => { setPayModal(null); setTxnRef(""); }} className="text-slate-500 hover:text-white transition"><X size={20} /></button>
            </div>
            <div className="relative z-10 space-y-5">
              <div className="bg-transparent/30 p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between text-[13px]"><span className="text-white/60">Invoice</span><span className="font-mono text-white/90">{payModal.id}</span></div>
                <div className="pt-4 border-t border-white/5 flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Amount to Transfer</span>
                  <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">₹{payModal.amount.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] text-white/60 uppercase font-bold ml-1">Txn Reference ID</label>
                <input value={txnRef} onChange={e => setTxnRef(e.target.value)} placeholder="UTR-XXXXXXXX" className="w-full bg-transparent/30 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-emerald-500/50 focus:outline-none" />
              </div>
              <button onClick={() => {
                const updated = invoices.map(i => i.id === payModal.id ? { ...i, status: "Paid", paidOn: new Date().toISOString().split("T")[0], txnRef: txnRef || `TXN-${Date.now()}` } : i);
                setInvoices(updated); setPayModal(null); setTxnRef("");
              }} className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-bold hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] flex justify-center gap-2">
                <CheckCircle2 size={18} /> Mark as Disbursed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOOD BILLING TAB
═══════════════════════════════════════════════════════════════ */
function FoodBillingTab() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const [invoiceModal, setInvoiceModal]   = useState(false);
  const [invoiceNotes, setInvoiceNotes]   = useState("");
  const [invoices, setInvoices]           = useState(FOOD_INVOICES);

  const data = FOOD_MONTHLY_DATA[selectedMonth] || { activeStudents: 0, attendancePct: 0 };
  const isEligible = data.attendancePct >= MIN_ATTENDANCE_PCT;
  const calculatedAmount = data.activeStudents * FOOD_RATE_PER_STUDENT;
  
  const monthLabel = (() => {
    const [y, m] = selectedMonth.split("-");
    const name = MONTHS[parseInt(m) - 1];
    return name ? `${name} ${y}` : selectedMonth;
  })();

  const alreadyRaised = invoices.some((inv) => inv.month === monthLabel);

  const raiseInvoice = () => {
    if (!isEligible || alreadyRaised) return;
    const inv = { id: `INV-AF-${String(invoices.length + 103).padStart(4, "0")}`, month: monthLabel, amount: calculatedAmount, status: "Pending", raisedOn: new Date().toISOString().split("T")[0], students: data.activeStudents };
    setInvoices([inv, ...invoices]);
    setInvoiceModal(false); setInvoiceNotes("");
  };

  return (
    <div className="space-y-8 animate-fade-in-up delay-100">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div><h2 className="text-xl font-semibold text-white/90">Food & Boarding Operations</h2></div>
        <div className="relative w-52">
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="appearance-none w-full bg-[#0b1220]/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white/90 focus:border-orange-500/50 focus:outline-none cursor-pointer pr-10">
            {Object.keys(FOOD_MONTHLY_DATA).map(k => { const [y, m] = k.split("-"); return <option key={k} value={k}>{MONTHS[parseInt(m) - 1]} {y}</option>; })}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Eligibility Card */}
        <div className={`md:col-span-2 rounded-3xl border p-8 flex flex-col justify-center relative overflow-hidden backdrop-blur-md ${isEligible ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
          <div className="absolute -right-10 -top-10 opacity-[0.03] pointer-events-none text-white">{isEligible ? <CheckCircle2 size={250} /> : <AlertCircle size={250} />}</div>
          <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="space-y-4 text-center md:text-left">
              <div>
                <h2 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Monthly Student Attendance</h2>
                <div className="flex items-baseline justify-center md:justify-start gap-2">
                  <span className={`text-6xl font-black ${isEligible ? 'text-emerald-400' : 'text-red-400'}`}>{data.attendancePct}%</span>
                  <span className="text-slate-500 text-sm font-medium">/ 100%</span>
                </div>
              </div>
              <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${isEligible ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
                {isEligible ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                <p className="text-[13px] font-medium leading-relaxed">
                  {isEligible ? `Attendance meets the ${MIN_ATTENDANCE_PCT}% threshold. Invoice generation is cleared for ${monthLabel}.` : `Attendance is strictly below the ${MIN_ATTENDANCE_PCT}% requirement. Invoice generation is locked.`}
                </p>
              </div>
            </div>
            {/* Action Box */}
            <div className="w-full md:w-64 flex flex-col gap-3 shrink-0">
              <div className="bg-[#0b1220]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center shadow-xl">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Invoice Target</p>
                <p className="text-3xl font-black text-white mb-6">₹{calculatedAmount.toLocaleString("en-IN")}</p>
                {alreadyRaised ? (
                  <button disabled className="w-full py-3 bg-white/5 text-emerald-400 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-emerald-500/30"><CheckCircle2 size={16} /> Submitted</button>
                ) : (
                  <button onClick={() => setInvoiceModal(true)} disabled={!isEligible} className={`w-full py-3 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all ${isEligible ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:-translate-y-0.5' : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'}`}>
                    {!isEligible ? <Ban size={16} /> : <FileText size={16} />} {isEligible ? 'Raise Invoice' : 'Locked'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Metrics Column */}
        <div className="space-y-4">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0"><Users size={20} className="text-orange-400" /></div>
            <div><p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Active Students</p><p className="text-xl font-black text-white">{data.activeStudents}</p></div>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0"><Utensils size={20} className="text-orange-400" /></div>
            <div><p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Food Rate</p><p className="text-xl font-black text-white">₹{FOOD_RATE_PER_STUDENT}</p><p className="text-[9px] text-slate-500 mt-0.5">per student/mo</p></div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-lg delay-200 animate-fade-in-up">
        <div className="px-6 py-4 border-b border-white/5"><h2 className="text-[13px] font-bold text-white/80 uppercase tracking-widest flex items-center gap-2"><CalendarDays size={16} className="text-orange-400" /> Billing History</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-transparent/20 text-white/60 uppercase tracking-wider text-[10px] border-b border-white/5">
              <tr><th className="px-6 py-4 text-left font-semibold">Invoice ID</th><th className="px-6 py-4 text-left font-semibold">Billing Month</th><th className="px-6 py-4 text-left font-semibold">Students</th><th className="px-6 py-4 text-left font-semibold">Total Amount</th><th className="px-6 py-4 text-left font-semibold">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-mono text-white/80">{inv.id}</td>
                  <td className="px-6 py-4 font-medium text-white/90">{inv.month}</td>
                  <td className="px-6 py-4 text-white/60">{inv.students}</td>
                  <td className="px-6 py-4 font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-200">₹{inv.amount.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-sky-500/10 text-sky-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${inv.status === 'Paid' ? 'bg-emerald-400' : 'bg-sky-400'}`} />{inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raise Invoice Modal */}
      {invoiceModal && (
        <div className="fixed inset-0 bg-transparent/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setInvoiceModal(false)}>
          <div className="bg-[#0f1522] border border-orange-500/20 rounded-3xl w-full max-w-md p-8 shadow-[0_0_50px_rgba(249,115,22,0.15)] ring-1 ring-orange-500/10 relative overflow-hidden scale-95 animate-scale-up" onClick={e => e.stopPropagation()} style={{animationFillMode:'forwards'}}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 blur-[60px] rounded-full" />
            <div className="relative z-10 flex items-center justify-between mb-8">
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400"><Utensils size={20} /></div><h3 className="text-xl font-bold text-white tracking-tight">Generate Invoice</h3></div>
              <button onClick={() => setInvoiceModal(false)} className="text-slate-500 hover:text-white transition"><X size={20} /></button>
            </div>
            <div className="relative z-10 space-y-5">
              <div className="bg-transparent/30 p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center text-[13px]"><span className="text-white/60 font-medium">Billing Month</span><span className="font-bold text-white/90">{monthLabel}</span></div>
                <div className="flex justify-between items-center text-[13px]"><span className="text-white/60 font-medium">Metrics verified</span><div className="text-right"><p className="text-emerald-400 font-bold">{data.attendancePct}% Attendance</p></div></div>
                <div className="pt-4 border-t border-white/5 flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Invoice Value</span>
                  <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-200">₹{calculatedAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] text-white/60 uppercase font-bold ml-1">Admin Notes Form (Optional)</label>
                <textarea rows={2} value={invoiceNotes} onChange={e => setInvoiceNotes(e.target.value)} placeholder="Add specific notes..." className="w-full bg-transparent/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-orange-500/50 focus:outline-none resize-none" />
              </div>
              <button onClick={raiseInvoice} className="w-full mt-2 py-3.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-bold hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] flex justify-center gap-2">
                <Send size={18} /> Submit to Super Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, count, amount, accent = "purple", highlight, delay = "" }) {
  const ring = highlight ? "ring-1 ring-purple-500/30 overflow-hidden relative" : "relative overflow-hidden";
  const colorMap = { amber: "text-amber-400 bg-amber-500/10 border-amber-500/20", blue: "text-blue-400 bg-blue-500/10 border-blue-500/20", emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", purple: "text-purple-400 bg-purple-500/10 border-purple-500/20" };
  const acClass = colorMap[accent] || colorMap.purple;
  return (
    <div className={`bg-white/[0.02] backdrop-blur-md rounded-3xl border border-white/5 p-6 shadow-xl animate-fade-in-up opacity-0 ${delay} ${ring}`} style={{ animationFillMode: "forwards" }}>
      {highlight && <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[40px] rounded-full pointer-events-none" />}
      <div className="flex items-center justify-between mb-5 relative z-10"><span className="text-[11px] font-bold text-white/60 uppercase tracking-widest">{label}</span><div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner border ${acClass}`}><Icon size={18} /></div></div>
      <div className="relative z-10">
        <p className={`text-3xl font-black tracking-tight ${highlight ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-200" : "text-white"}`}>₹{amount.toLocaleString("en-IN")}</p>
        <div className="mt-3 inline-flex items-center gap-1.5 bg-transparent/20 px-2.5 py-1 rounded-md border border-white/5"><TrendingUp size={12} className={highlight ? "text-purple-400" : "text-white/60"} /><p className="text-[11px] font-semibold text-white/80">{count} document{count !== 1 ? "s" : ""}</p></div>
      </div>
    </div>
  );
}
