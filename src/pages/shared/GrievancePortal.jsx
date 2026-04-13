import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  MessageSquareWarning,
  Plus,
  X,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Upload,
  ChevronDown,
  Search,
  Eye,
  ArrowUpRight,
  MessageCircle,
  Filter,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   ACCENT PALETTE
═══════════════════════════════════════════════════════════════ */

const ACCENT_MAP = {
  mobilizer: {
    text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20",
    btn: "bg-yellow-400 hover:bg-yellow-300 text-black", ring: "ring-yellow-400/30",
    shadow: "shadow-yellow-500/10", gradientFrom: "from-yellow-500/10",
  },
  trainer: {
    text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20",
    btn: "bg-emerald-500 hover:bg-emerald-400 text-white", ring: "ring-emerald-400/30",
    shadow: "shadow-emerald-500/10", gradientFrom: "from-emerald-500/10",
  },
  "placement-officer": {
    text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20",
    btn: "bg-cyan-500 hover:bg-cyan-400 text-white", ring: "ring-cyan-400/30",
    shadow: "shadow-cyan-500/10", gradientFrom: "from-cyan-500/10",
  },
};

const CATEGORIES = ["Payment Issue", "Work Environment", "Harassment", "Policy Concern", "Management", "Other"];
const PRIORITIES = ["Low", "Medium", "High"];

const PRIORITY_STYLES = {
  Low: { bg: "bg-sky-500/10 border-sky-500/20", text: "text-sky-400" },
  Medium: { bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400" },
  High: { bg: "bg-red-500/10 border-red-500/20", text: "text-red-400" },
};

const STATUS_CONFIG = {
  Open: { icon: Clock, bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400" },
  "Under Review": { icon: Eye, bg: "bg-sky-500/10 border-sky-500/20", text: "text-sky-400" },
  Resolved: { icon: CheckCircle2, bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400" },
  Escalated: { icon: ArrowUpRight, bg: "bg-red-500/10 border-red-500/20", text: "text-red-400" },
};

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════ */

const INITIAL_GRIEVANCES = [
  {
    id: "GRV-001",
    category: "Payment Issue",
    subject: "March salary credited late",
    description: "My March 2026 salary was credited 10 days after the usual pay date. This caused financial difficulties. Please ensure timely processing.",
    priority: "High",
    status: "Resolved",
    submittedOn: "2026-03-15",
    resolvedOn: "2026-03-20",
    anonymous: false,
    timeline: [
      { date: "2026-03-15", status: "Open", note: "Grievance submitted" },
      { date: "2026-03-16", status: "Under Review", note: "Assigned to HR team" },
      { date: "2026-03-20", status: "Resolved", note: "Salary processing delay fixed. Compensation applied." },
    ],
  },
  {
    id: "GRV-002",
    category: "Work Environment",
    subject: "Insufficient travel allowance for remote areas",
    description: "The current travel allowance does not adequately cover costs when visiting remote mining colonies. Fuel and accommodation costs have increased significantly.",
    priority: "Medium",
    status: "Under Review",
    submittedOn: "2026-04-02",
    resolvedOn: null,
    anonymous: false,
    timeline: [
      { date: "2026-04-02", status: "Open", note: "Grievance submitted" },
      { date: "2026-04-05", status: "Under Review", note: "Operations team reviewing travel policy" },
    ],
  },
  {
    id: "GRV-003",
    category: "Policy Concern",
    subject: "Unclear leave policy for field staff",
    description: "The current leave policy does not clearly define provisions for field staff who work on weekends during community drives. Need clarification on compensatory offs.",
    priority: "Low",
    status: "Open",
    submittedOn: "2026-04-10",
    resolvedOn: null,
    anonymous: true,
    timeline: [
      { date: "2026-04-10", status: "Open", note: "Grievance submitted anonymously" },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */

export default function GrievancePortal() {
  const location = useLocation();
  const roleKey = location.pathname.split("/")[1];
  const a = ACCENT_MAP[roleKey] || ACCENT_MAP.mobilizer;

  const [grievances, setGrievances] = useState(INITIAL_GRIEVANCES);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [attachFile, setAttachFile] = useState(null);

  const resetForm = () => {
    setCategory(""); setSubject(""); setDescription(""); setPriority("Medium"); setIsAnonymous(false); setAttachFile(null);
    setShowForm(false);
  };

  const handleSubmit = () => {
    const newGrievance = {
      id: `GRV-${String(grievances.length + 4).padStart(3, "0")}`,
      category,
      subject,
      description,
      priority,
      status: "Open",
      submittedOn: new Date().toISOString().split("T")[0],
      resolvedOn: null,
      anonymous: isAnonymous,
      timeline: [{ date: new Date().toISOString().split("T")[0], status: "Open", note: isAnonymous ? "Grievance submitted anonymously" : "Grievance submitted" }],
    };
    setGrievances([newGrievance, ...grievances]);
    resetForm();
  };

  const filtered = grievances
    .filter(g => filterStatus === "All" || g.status === filterStatus)
    .filter(g => !searchQuery || g.subject.toLowerCase().includes(searchQuery.toLowerCase()) || g.category.toLowerCase().includes(searchQuery.toLowerCase()));

  const stats = {
    total: grievances.length,
    open: grievances.filter(g => g.status === "Open").length,
    inReview: grievances.filter(g => g.status === "Under Review").length,
    resolved: grievances.filter(g => g.status === "Resolved").length,
  };

  return (
    <section className="min-h-screen bg-transparent text-white/90 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ─── Header ──────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className={`text-xs tracking-widest ${a.text} uppercase mb-2 font-medium`}>Support</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Grievance Portal</h1>
            <p className="text-sm text-white/50 mt-1">Submit and track your workplace grievances confidentially</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl transition-all active:scale-95 ${a.btn} shadow-lg ${a.shadow}`}
          >
            <Plus size={16} /> Raise Grievance
          </button>
        </div>

        {/* ─── Summary Cards ──────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MiniCard icon={MessageSquareWarning} label="Total" value={stats.total} accent={a} />
          <MiniCard icon={Clock} label="Open" value={stats.open} accent={a} />
          <MiniCard icon={Eye} label="Under Review" value={stats.inReview} accent={a} />
          <MiniCard icon={CheckCircle2} label="Resolved" value={stats.resolved} accent={a} highlight />
        </div>

        {/* ─── Filter & Search ────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search grievances..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white/90 focus:border-yellow-400/50 focus:outline-none placeholder:text-slate-600 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {["All", "Open", "Under Review", "Resolved", "Escalated"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all ${filterStatus === s ? `${a.bg} ${a.border} ${a.text}` : "bg-white/[0.02] border-white/[0.06] text-white/50 hover:text-white/80"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Grievance Cards ────────────────────────────── */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-white/40">
              <MessageSquareWarning size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">No grievances found</p>
            </div>
          )}

          {filtered.map((g) => {
            const isExpanded = expandedId === g.id;
            const pStyle = PRIORITY_STYLES[g.priority];
            const sConfig = STATUS_CONFIG[g.status];
            const SIcon = sConfig?.icon || Clock;

            return (
              <div key={g.id} className="bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/[0.05] overflow-hidden shadow-lg shadow-black/20 hover:bg-white/[0.03] transition-all">
                {/* Card header */}
                <div className="flex items-center justify-between px-6 py-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : g.id)}>
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${sConfig.bg}`}>
                      <SIcon size={20} className={sConfig.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-sm font-semibold text-white truncate">{g.subject}</p>
                        {g.anonymous && (
                          <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">Anonymous</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-white/50 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full border ${pStyle.bg} ${pStyle.text} text-[10px] font-medium`}>{g.priority}</span>
                        <span>{g.category}</span>
                        <span>·</span>
                        <span>{g.submittedOn}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${sConfig.bg} ${sConfig.text}`}>
                      <SIcon size={12} /> {g.status}
                    </span>
                    <ChevronDown size={18} className={`text-white/40 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-white/[0.05] px-6 py-5 space-y-5">
                    {/* Description */}
                    <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
                      <p className="text-xs text-white/50 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <MessageCircle size={12} /> Description
                      </p>
                      <p className="text-sm text-white/80 leading-relaxed">{g.description}</p>
                    </div>

                    {/* Timeline */}
                    <div>
                      <p className="text-xs text-white/50 uppercase tracking-wide mb-4 flex items-center gap-1.5">
                        <Clock size={12} /> Resolution Timeline
                      </p>
                      <div className="relative pl-6 space-y-4">
                        {/* Vertical line */}
                        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-white/10" />

                        {g.timeline.map((step, i) => {
                          const stepConfig = STATUS_CONFIG[step.status] || STATUS_CONFIG.Open;
                          const StepIcon = stepConfig.icon;
                          return (
                            <div key={i} className="relative flex gap-4 items-start">
                              <div className={`absolute -left-6 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${stepConfig.bg} ${stepConfig.text}`}>
                                <StepIcon size={10} />
                              </div>
                              <div className="flex-1 ml-2">
                                <div className="flex items-center gap-3">
                                  <span className={`text-xs font-semibold ${stepConfig.text}`}>{step.status}</span>
                                  <span className="text-[10px] text-white/40">{step.date}</span>
                                </div>
                                <p className="text-sm text-white/70 mt-0.5">{step.note}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="text-xs text-white/30 text-right">ID: {g.id}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
         NEW GRIEVANCE MODAL
      ═══════════════════════════════════════════════════════ */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-start justify-center z-50 p-4 pt-12 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-[#0b1220] border border-white/10 rounded-2xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldAlert size={20} className={a.text} /> Raise Grievance
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs text-white/60 mb-1.5 block">Category *</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="appearance-none w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90 focus:border-yellow-400/50 focus:outline-none cursor-pointer pr-10 transition-all"
                >
                  <option value="" className="bg-[#0b1220]">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0b1220]">{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="text-xs text-white/60 mb-1.5 block">Subject *</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief subject of your grievance"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90 focus:border-yellow-400/50 focus:outline-none placeholder:text-slate-600 transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs text-white/60 mb-1.5 block">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Provide detailed information about your grievance..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90 focus:border-yellow-400/50 focus:outline-none resize-none placeholder:text-slate-600 transition-all"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs text-white/60 mb-2 block">Priority</label>
              <div className="flex gap-3">
                {PRIORITIES.map((p) => {
                  const ps = PRIORITY_STYLES[p];
                  return (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-medium border transition-all ${priority === p ? `${ps.bg} ${ps.text}` : "bg-white/[0.02] border-white/10 text-white/50 hover:text-white/70"}`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Attachment */}
            <div>
              <label className="text-xs text-white/60 mb-1.5 block">Supporting Document (optional)</label>
              <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white/[0.03] border border-dashed border-white/15 rounded-xl text-sm text-white/50 hover:text-white/70 hover:border-white/30 cursor-pointer transition-all">
                <Upload size={16} />
                <span>{attachFile ? attachFile.name : "Click to upload document"}</span>
                <input type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" onChange={(e) => setAttachFile(e.target.files[0] || null)} />
              </label>
            </div>

            {/* Anonymous toggle */}
            <div className="flex items-center gap-3 bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`w-12 h-6 rounded-full relative transition-all ${isAnonymous ? "bg-purple-500/40" : "bg-white/10"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${isAnonymous ? "left-6" : "left-0.5"}`} />
              </button>
              <div>
                <p className="text-sm text-white/80 font-medium">Submit Anonymously</p>
                <p className="text-[11px] text-white/40">Your identity will not be disclosed to management</p>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!category || !subject || !description}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${a.btn} shadow-lg ${a.shadow}`}
            >
              <Send size={16} /> Submit Grievance
            </button>
          </div>
        </div>
      )}
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
