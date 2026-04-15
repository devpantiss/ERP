import { useState } from "react";
import SlidePanel from "../../components/common/SlidePanel";
import { useLocation } from "react-router-dom";
import {
  Receipt,
  Plus,
  X,
  Upload,
  Trash2,
  MapPin,
  Calendar,
  FileText,
  CreditCard,
  Banknote,
  Image,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  ChevronDown,
  Eye,
  StickyNote,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   ACCENT PALETTE
═══════════════════════════════════════════════════════════════ */

const ACCENT_MAP = {
  mobilizer: {
    text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20",
    btn: "bg-yellow-400 hover:bg-yellow-300 text-black", ring: "ring-yellow-400/30",
    shadow: "shadow-yellow-500/10",
  },
  trainer: {
    text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20",
    btn: "bg-emerald-500 hover:bg-emerald-400 text-white", ring: "ring-emerald-400/30",
    shadow: "shadow-emerald-500/10",
  },
  "placement-officer": {
    text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20",
    btn: "bg-cyan-500 hover:bg-cyan-400 text-white", ring: "ring-cyan-400/30",
    shadow: "shadow-cyan-500/10",
  },
};

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════ */

const INITIAL_CLAIMS = [
  {
    id: "RMB-001",
    tourName: "Angul Mining Colony Site Visit",
    destination: "Angul, Odisha",
    dateRange: "2026-03-10 → 2026-03-12",
    totalAmount: 4500,
    status: "Approved",
    submittedOn: "2026-03-13",
    tourNote: "Visited 3 mining colonies for candidate mobilization. Met village heads.",
    bills: [
      { desc: "Bus fare (Bhubaneswar → Angul)", amount: 450, mode: "Cash" },
      { desc: "Hotel stay (2 nights)", amount: 2400, mode: "Online" },
      { desc: "Food & refreshments", amount: 650, mode: "Cash" },
      { desc: "Auto fare (local travel)", amount: 300, mode: "Cash" },
      { desc: "Printing & stationery", amount: 700, mode: "Online" },
    ],
  },
  {
    id: "RMB-002",
    tourName: "Jharsuguda Skill Workshop",
    destination: "Jharsuguda, Odisha",
    dateRange: "2026-02-20 → 2026-02-22",
    totalAmount: 5200,
    status: "Paid",
    submittedOn: "2026-02-23",
    tourNote: "Conducted 2-day awareness camp about skilling programs.",
    bills: [
      { desc: "Train travel", amount: 1200, mode: "Online" },
      { desc: "Accommodation", amount: 2000, mode: "Online" },
      { desc: "Food", amount: 800, mode: "Cash" },
      { desc: "Venue rental", amount: 1200, mode: "Online" },
    ],
  },
  {
    id: "RMB-003",
    tourName: "Talcher Community Survey",
    destination: "Talcher, Odisha",
    dateRange: "2026-01-15 → 2026-01-16",
    totalAmount: 2800,
    status: "Pending",
    submittedOn: "2026-01-17",
    tourNote: "Surveyed 5 villages for training center feasibility.",
    bills: [
      { desc: "Bus fare", amount: 350, mode: "Cash" },
      { desc: "Meals", amount: 450, mode: "Cash" },
      { desc: "Accommodation", amount: 1500, mode: "Online" },
      { desc: "Printing surveys", amount: 500, mode: "Cash" },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */

export default function ReimbursementPortal() {
  const location = useLocation();
  const roleKey = location.pathname.split("/")[1];
  const a = ACCENT_MAP[roleKey] || ACCENT_MAP.mobilizer;

  const [claims, setClaims] = useState(INITIAL_CLAIMS);
  const [showForm, setShowForm] = useState(false);
  const [expandedClaim, setExpandedClaim] = useState(null);

  // Form state
  const [tourName, setTourName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tourNote, setTourNote] = useState("");
  const [bills, setBills] = useState([{ desc: "", amount: "", mode: "Cash", billFile: null, paymentScreenshot: null }]);

  const resetForm = () => {
    setTourName(""); setDestination(""); setStartDate(""); setEndDate(""); setTourNote("");
    setBills([{ desc: "", amount: "", mode: "Cash", billFile: null, paymentScreenshot: null }]);
    setShowForm(false);
  };

  const addBill = () => setBills([...bills, { desc: "", amount: "", mode: "Cash", billFile: null, paymentScreenshot: null }]);
  const removeBill = (idx) => setBills(bills.filter((_, i) => i !== idx));
  const updateBill = (idx, field, value) => {
    const updated = [...bills];
    updated[idx][field] = value;
    setBills(updated);
  };

  const handleSubmit = () => {
    const totalAmount = bills.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
    const newClaim = {
      id: `RMB-${String(claims.length + 4).padStart(3, "0")}`,
      tourName,
      destination,
      dateRange: `${startDate} → ${endDate}`,
      totalAmount,
      status: "Pending",
      submittedOn: new Date().toISOString().split("T")[0],
      tourNote,
      bills: bills.map(b => ({ desc: b.desc, amount: parseFloat(b.amount) || 0, mode: b.mode })),
    };
    setClaims([newClaim, ...claims]);
    resetForm();
  };

  const summaryStats = {
    total: claims.length,
    pending: claims.filter(c => c.status === "Pending").length,
    approved: claims.filter(c => c.status === "Approved").length,
    totalAmount: claims.reduce((s, c) => s + c.totalAmount, 0),
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */

  return (
    <section className="min-h-screen bg-transparent text-white/90 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ─── Header ──────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className={`text-xs tracking-widest ${a.text} uppercase mb-2 font-medium`}>HR Entitlement</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Reimbursement Portal</h1>
            <p className="text-sm text-white/50 mt-1">Apply for tour reimbursements, upload bills & track claim status</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl transition-all active:scale-95 ${a.btn} shadow-lg ${a.shadow}`}
          >
            <Plus size={16} /> New Reimbursement
          </button>
        </div>

        {/* ─── Summary Cards ──────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MiniCard icon={Receipt} label="Total Claims" value={summaryStats.total} accent={a} />
          <MiniCard icon={Clock} label="Pending" value={summaryStats.pending} accent={a} />
          <MiniCard icon={CheckCircle2} label="Approved" value={summaryStats.approved} accent={a} />
          <MiniCard icon={CreditCard} label="Total Amount" value={`₹${summaryStats.totalAmount.toLocaleString("en-IN")}`} accent={a} highlight />
        </div>

        {/* ─── Claims List ────────────────────────────────── */}
        <div className="space-y-4">
          {claims.map((claim) => {
            const isExpanded = expandedClaim === claim.id;
            return (
              <div
                key={claim.id}
                className="bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/[0.05] overflow-hidden shadow-lg shadow-black/20 hover:bg-white/[0.03] transition-all"
              >
                {/* Claim header */}
                <div
                  className="flex items-center justify-between px-6 py-5 cursor-pointer"
                  onClick={() => setExpandedClaim(isExpanded ? null : claim.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${a.bg} flex items-center justify-center border ${a.border}`}>
                      <MapPin size={20} className={a.text} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{claim.tourName}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
                        <span className="flex items-center gap-1"><MapPin size={11} />{claim.destination}</span>
                        <span className="flex items-center gap-1"><Calendar size={11} />{claim.dateRange}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${a.text}`}>₹{claim.totalAmount.toLocaleString("en-IN")}</p>
                      <StatusBadge status={claim.status} />
                    </div>
                    {isExpanded ? <ChevronDown size={18} className="text-white/40 rotate-180 transition-transform" /> : <ChevronDown size={18} className="text-white/40 transition-transform" />}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-white/[0.05] px-6 py-5 space-y-4">
                    {/* Tour Note */}
                    {claim.tourNote && (
                      <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
                        <p className="text-xs text-white/50 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <StickyNote size={12} /> Tour Note
                        </p>
                        <p className="text-sm text-white/80">{claim.tourNote}</p>
                      </div>
                    )}

                    {/* Bills table */}
                    <div>
                      <p className="text-xs text-white/50 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <Receipt size={12} /> Bill Details
                      </p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="text-white/50 bg-white/[0.02]">
                            <tr>
                              <th className="px-4 py-3 text-left font-medium">#</th>
                              <th className="px-4 py-3 text-left font-medium">Description</th>
                              <th className="px-4 py-3 text-left font-medium">Amount</th>
                              <th className="px-4 py-3 text-left font-medium">Payment Mode</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            {claim.bills.map((bill, i) => (
                              <tr key={i} className="hover:bg-white/[0.02]">
                                <td className="px-4 py-3 text-white/40">{i + 1}</td>
                                <td className="px-4 py-3 text-white/80">{bill.desc}</td>
                                <td className={`px-4 py-3 font-semibold ${a.text}`}>₹{bill.amount.toLocaleString("en-IN")}</td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${bill.mode === "Cash" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-sky-500/10 border-sky-500/20 text-sky-400"}`}>
                                    {bill.mode === "Cash" ? <Banknote size={12} /> : <CreditCard size={12} />}
                                    {bill.mode}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 text-sm">
                      <span className="text-white/50">Submitted: {claim.submittedOn}</span>
                      <span className="text-xs text-white/40">Claim ID: {claim.id}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
         NEW REIMBURSEMENT MODAL
      ═══════════════════════════════════════════════════════ */}
      <SlidePanel open={showForm} onClose={() => setShowForm(false)} title="New Reimbursement Claim" width="lg">
          <div className="space-y-6">

            {/* Tour Info */}
            <div className="space-y-4">
              <p className="text-xs text-white/50 uppercase tracking-wide font-medium">Tour Details</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/60 mb-1.5 block">Tour Name *</label>
                  <input
                    value={tourName}
                    onChange={(e) => setTourName(e.target.value)}
                    placeholder="e.g. Angul Mining Visit"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90 focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50 focus:outline-none placeholder:text-slate-600 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1.5 block">Destination *</label>
                  <input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Angul, Odisha"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90 focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50 focus:outline-none placeholder:text-slate-600 transition-all"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/60 mb-1.5 block">Start Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90 focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1.5 block">End Date *</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90 focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Bills */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/50 uppercase tracking-wide font-medium">Bill Items</p>
                <button onClick={addBill} className={`text-xs ${a.text} hover:underline flex items-center gap-1`}>
                  <Plus size={14} /> Add Bill
                </button>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {bills.map((bill, idx) => (
                  <div key={idx} className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/40 font-medium">Bill #{idx + 1}</span>
                      {bills.length > 1 && (
                        <button onClick={() => removeBill(idx)} className="text-red-400/70 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input
                        value={bill.desc}
                        onChange={(e) => updateBill(idx, "desc", e.target.value)}
                        placeholder="Bill description"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/90 focus:border-yellow-400/50 focus:outline-none placeholder:text-slate-600 transition-all"
                      />
                      <input
                        type="number"
                        value={bill.amount}
                        onChange={(e) => updateBill(idx, "amount", e.target.value)}
                        placeholder="Amount (₹)"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/90 focus:border-yellow-400/50 focus:outline-none placeholder:text-slate-600 transition-all"
                      />
                    </div>

                    {/* Payment Mode */}
                    <div className="space-y-2">
                      <label className="text-xs text-white/50">Payment Mode</label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => updateBill(idx, "mode", "Cash")}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border transition-all ${bill.mode === "Cash" ? "bg-amber-500/15 border-amber-500/30 text-amber-400" : "bg-white/[0.02] border-white/10 text-white/50 hover:text-white/80"}`}
                        >
                          <Banknote size={14} /> Cash
                        </button>
                        <button
                          onClick={() => updateBill(idx, "mode", "Online")}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border transition-all ${bill.mode === "Online" ? "bg-sky-500/15 border-sky-500/30 text-sky-400" : "bg-white/[0.02] border-white/10 text-white/50 hover:text-white/80"}`}
                        >
                          <CreditCard size={14} /> Online Payment
                        </button>
                      </div>
                    </div>

                    {/* File uploads */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <label className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white/[0.03] border border-dashed border-white/15 rounded-lg text-xs text-white/50 hover:text-white/70 hover:border-white/30 cursor-pointer transition-all">
                        <Upload size={14} />
                        <span>{bill.billFile ? bill.billFile.name : "Upload Bill/Receipt"}</span>
                        <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => updateBill(idx, "billFile", e.target.files[0] || null)} />
                      </label>

                      {bill.mode === "Online" && (
                        <label className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white/[0.03] border border-dashed border-sky-500/20 rounded-lg text-xs text-sky-400/60 hover:text-sky-400/80 hover:border-sky-500/40 cursor-pointer transition-all">
                          <Image size={14} />
                          <span>{bill.paymentScreenshot ? bill.paymentScreenshot.name : "Payment Screenshot"}</span>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => updateBill(idx, "paymentScreenshot", e.target.files[0] || null)} />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-2 border-t border-white/[0.06]">
                <span className="text-sm text-white/60">Total Claim Amount</span>
                <span className={`text-xl font-bold ${a.text}`}>
                  ₹{bills.reduce((s, b) => s + (parseFloat(b.amount) || 0), 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Tour Note */}
            <div>
              <label className="text-xs text-white/60 mb-1.5 block">Tour Note *</label>
              <textarea
                value={tourNote}
                onChange={(e) => setTourNote(e.target.value)}
                rows={3}
                placeholder="Describe the purpose and activities during this tour..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90 focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50 focus:outline-none resize-none placeholder:text-slate-600 transition-all"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!tourName || !destination || !startDate || !endDate || bills.some(b => !b.desc || !b.amount)}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${a.btn} shadow-lg ${a.shadow}`}
            >
              <Send size={16} /> Submit Reimbursement Claim
            </button>
          </div>
      </SlidePanel>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════ */

function MiniCard({ icon: Icon, label, value, accent: a, highlight }) {
  return (
    <div className={`bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/[0.05] p-5 transition-all duration-300 shadow-lg shadow-black/20 hover:bg-white/[0.04] ${highlight ? `ring-1 ${a.ring} scale-[1.02]` : ""}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg ${a.bg} flex items-center justify-center border ${a.border}`}>
          <Icon size={16} className={a.text} />
        </div>
        <span className="text-xs text-white/60 uppercase tracking-wider font-medium">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${highlight ? a.text : "text-white"}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    Paid: { icon: CheckCircle2, bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400" },
    Approved: { icon: CheckCircle2, bg: "bg-sky-500/10 border-sky-500/20", text: "text-sky-400" },
    Pending: { icon: Clock, bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400" },
    Rejected: { icon: AlertCircle, bg: "bg-red-500/10 border-red-500/20", text: "text-red-400" },
  };
  const c = config[status] || config.Pending;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${c.bg} ${c.text}`}>
      <Icon size={11} /> {status}
    </span>
  );
}
