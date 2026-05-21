import { useEffect, useMemo, useState } from "react";
import SlidePanel from "../../components/common/SlidePanel";
import MentionInput from "../../components/common/MentionInput";
import { toast } from "react-toastify";
import {
  MessageSquareWarning,
  Plus,
  Send,
  Clock,
  CheckCircle2,
  Eye,
  ArrowUpRight,
  ChevronDown,
  Search,
  MessageCircle,
  Filter,
  Upload,
  Users,
  ShieldAlert,
  User,
  Building2,
  FolderKanban,
} from "lucide-react";
import { useGrievanceStore } from "../../stores/grievanceStore.js";
import {
  selectGrievanceRows,
  selectPeopleDirectory,
} from "../../stores/selectors/grievanceSelectors.js";

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════ */

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

const STATUS_OPTIONS = ["Open", "Under Review", "Resolved", "Escalated"];

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */

export default function AdminGrievancePortal() {
  const { records, fetchAll, create, update } = useGrievanceStore();
  const [activeTab, setActiveTab] = useState("employee"); // "employee" | "raise"
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [attachFile, setAttachFile] = useState(null);
  const [addressedTo, setAddressedTo] = useState([]);

  // Status update
  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const allGrievances = useMemo(() => selectGrievanceRows(records), [records]);
  const empGrievances = useMemo(
    () => allGrievances.filter((grievance) => grievance.raisedBy !== "Admin"),
    [allGrievances]
  );
  const adminGrievances = useMemo(
    () => allGrievances.filter((grievance) => grievance.raisedBy === "Admin"),
    [allGrievances]
  );
  const peopleDirectory = useMemo(() => selectPeopleDirectory(), []);

  const resetForm = () => {
    setCategory(""); setSubject(""); setDescription(""); setPriority("Medium"); setAttachFile(null); setAddressedTo([]);
    setShowForm(false);
  };

  /* Submit new grievance (Admin → Super Admin) */
  const handleSubmit = () => {
    create({
      raisedByType: "EMPLOYEE",
      raisedById: "EMP-0007",
      projectId: "PRJ-0001",
      centerId: "CTR-0001",
      raisedBy: "Admin",
      role: "Admin",
      project: "—",
      center: "—",
      addressedTo: addressedTo.length > 0 ? addressedTo.map((p) => p.name).join(", ") : "Super Admin",
      category,
      subject,
      description,
      priority,
      status: "OPEN",
      submittedOn: new Date().toISOString().split("T")[0],
      resolvedOn: null,
      timeline: [{ date: new Date().toISOString().split("T")[0], status: "Open", note: "Grievance raised by Admin" }],
    });
    resetForm();
    toast.success("Grievance raised to Super Admin");
  };

  /* Update status of employee grievance */
  const handleStatusUpdate = () => {
    if (!statusModal || !newStatus) return;
    const statusMap = { Open: "OPEN", "Under Review": "IN_REVIEW", Resolved: "RESOLVED", Escalated: "ESCALATED" };
    update(statusModal.id, {
      status: statusMap[newStatus] || "OPEN",
      resolvedOn: newStatus === "Resolved" ? new Date().toISOString().split("T")[0] : statusModal.resolvedOn,
      timeline: [
        ...statusModal.timeline,
        { date: new Date().toISOString().split("T")[0], status: newStatus, note: `Status changed to ${newStatus} by Admin` },
      ],
    });
    toast.success(`Grievance ${statusModal.id} updated to ${newStatus}`);
    setStatusModal(null);
    setNewStatus("");
  };

  const currentList = activeTab === "employee" ? empGrievances : adminGrievances;

  const filtered = useMemo(() => {
    return currentList
      .filter((g) => filterStatus === "All" || g.status === filterStatus)
      .filter((g) => !searchQuery || g.subject.toLowerCase().includes(searchQuery.toLowerCase()) || g.raisedBy.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [currentList, filterStatus, searchQuery]);

  const stats = {
    total: currentList.length,
    open: currentList.filter((g) => g.status === "Open").length,
    inReview: currentList.filter((g) => g.status === "Under Review").length,
    resolved: currentList.filter((g) => g.status === "Resolved").length,
    escalated: currentList.filter((g) => g.status === "Escalated").length,
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 mb-1">Support & Compliance</p>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <MessageSquareWarning size={28} className="text-violet-400" />
            Grievance Portal
          </h1>
          <p className="text-sm text-white/50 mt-1">Track employee grievances & raise concerns to Super Admin</p>
        </div>
        {activeTab === "raise" && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/20 transition hover:opacity-90 active:scale-95"
          >
            <Plus size={16} /> Raise to Super Admin
          </button>
        )}
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex gap-2 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06] w-fit">
        <button
          onClick={() => { setActiveTab("employee"); setFilterStatus("All"); setSearchQuery(""); setExpandedId(null); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "employee" ? "bg-violet-500/15 text-violet-300 border border-violet-500/30" : "text-white/50 hover:text-white/80"}`}
        >
          <Users size={15} /> Employee Grievances
        </button>
        <button
          onClick={() => { setActiveTab("raise"); setFilterStatus("All"); setSearchQuery(""); setExpandedId(null); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "raise" ? "bg-violet-500/15 text-violet-300 border border-violet-500/30" : "text-white/50 hover:text-white/80"}`}
        >
          <ShieldAlert size={15} /> Raised to Super Admin
        </button>
      </div>

      {/* ─── Stats ─── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={MessageSquareWarning} label="Total" value={stats.total} color="text-violet-400" bg="bg-violet-500/10" border="border-violet-500/20" />
        <StatCard icon={Clock} label="Open" value={stats.open} color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20" />
        <StatCard icon={Eye} label="Under Review" value={stats.inReview} color="text-sky-400" bg="bg-sky-500/10" border="border-sky-500/20" />
        <StatCard icon={CheckCircle2} label="Resolved" value={stats.resolved} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
        <StatCard icon={ArrowUpRight} label="Escalated" value={stats.escalated} color="text-red-400" bg="bg-red-500/10" border="border-red-500/20" />
      </div>

      {/* ─── Filter & Search ─── */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject or name..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white/90 focus:border-violet-400/50 focus:outline-none placeholder:text-slate-600 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Open", "Under Review", "Resolved", "Escalated"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${filterStatus === s ? "bg-violet-500/10 border-violet-500/30 text-violet-300" : "bg-white/[0.02] border-white/[0.06] text-white/50 hover:text-white/80"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Grievance Cards ─── */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-white/40">
            <MessageSquareWarning size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-bold">No grievances found</p>
          </div>
        )}

        {filtered.map((g) => {
          const isExpanded = expandedId === g.id;
          const pStyle = PRIORITY_STYLES[g.priority];
          const sConfig = STATUS_CONFIG[g.status] || STATUS_CONFIG.Open;
          const SIcon = sConfig.icon;

          return (
            <div key={g.id} className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80 backdrop-blur-sm shadow-lg shadow-black/20 hover:bg-[#151e2f] transition-all">
              {/* Card header */}
              <div className="flex items-center justify-between px-6 py-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : g.id)}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${sConfig.bg}`}>
                    <SIcon size={18} className={sConfig.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-white truncate">{g.subject}</p>
                      {g.anonymous && (
                        <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-bold">Anonymous</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-white/50 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full border ${pStyle.bg} ${pStyle.text} text-[10px] font-bold`}>{g.priority}</span>
                      <span className="flex items-center gap-1"><User size={10} /> {g.raisedBy}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><FolderKanban size={10} /> {g.project}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Building2 size={10} /> {g.center}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  {/* Addressed To badge */}
                  <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border bg-violet-500/10 border-violet-500/20 text-violet-400">
                    → {g.addressedTo}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${sConfig.bg} ${sConfig.text}`}>
                    <SIcon size={12} /> {g.status}
                  </span>
                  <ChevronDown size={16} className={`text-white/40 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-white/[0.05] px-6 py-5 space-y-5">
                  {/* Addressed To */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-white/40">Addressed to:</span>
                    <span className="px-2.5 py-1 rounded-lg border bg-violet-500/10 border-violet-500/20 text-violet-300 font-bold">{g.addressedTo}</span>
                    <span className="text-white/40 ml-2">Category:</span>
                    <span className="text-white/70 font-bold">{g.category}</span>
                  </div>

                  {/* Description */}
                  <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
                    <p className="text-xs text-white/50 uppercase tracking-wide mb-2 flex items-center gap-1.5 font-bold">
                      <MessageCircle size={12} /> Description
                    </p>
                    <p className="text-sm text-white/80 leading-relaxed">{g.description}</p>
                  </div>

                  {/* Timeline */}
                  <div>
                    <p className="text-xs text-white/50 uppercase tracking-wide mb-4 flex items-center gap-1.5 font-bold">
                      <Clock size={12} /> Resolution Timeline
                    </p>
                    <div className="relative pl-6 space-y-4">
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
                                <span className={`text-xs font-bold ${stepConfig.text}`}>{step.status}</span>
                                <span className="text-[10px] text-white/40">{step.date}</span>
                              </div>
                              <p className="text-sm text-white/70 mt-0.5">{step.note}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action buttons for employee grievances */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-white/30">ID: {g.id} · Submitted: {g.submittedOn}</span>
                    {activeTab === "employee" && g.status !== "Resolved" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setStatusModal(g); setNewStatus(g.status); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold transition hover:bg-violet-500/20"
                      >
                        <CheckCircle2 size={14} /> Update Status
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ═══ STATUS UPDATE MODAL ═══ */}
      {statusModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={() => setStatusModal(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700/50 bg-[#0f172a] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black text-white mb-1">Update Grievance Status</h3>
            <p className="text-xs text-white/50 mb-5">{statusModal.subject}</p>
            <div className="space-y-3">
              {STATUS_OPTIONS.map((s) => {
                const sc = STATUS_CONFIG[s];
                const Icon = sc.icon;
                return (
                  <button
                    key={s}
                    onClick={() => setNewStatus(s)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-bold transition-all ${newStatus === s ? `${sc.bg} ${sc.text}` : "border-slate-700/50 bg-[#111827] text-white/60 hover:bg-white/[0.03]"}`}
                  >
                    <Icon size={16} /> {s}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setStatusModal(null)} className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-400 transition hover:text-white">Cancel</button>
              <button onClick={handleStatusUpdate} className="flex items-center gap-2 rounded-xl bg-violet-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-400">
                <CheckCircle2 size={14} /> Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ RAISE GRIEVANCE SLIDE PANEL ═══ */}
      <SlidePanel open={showForm} onClose={() => setShowForm(false)} title="Raise Grievance to Super Admin" width="md">
        <div className="space-y-6">
          {/* Addressed To — @mention */}
          <MentionInput
            values={addressedTo}
            onChange={setAddressedTo}
            people={peopleDirectory}
            placeholder="Type @ to search people..."
            accentColor="violet"
            label="Addressed To *"
          />
          <div>
            <label className="text-xs text-white/60 mb-1.5 block font-bold">Category *</label>
            <div className="relative">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="appearance-none w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90 focus:border-violet-400/50 focus:outline-none cursor-pointer pr-10 transition-all">
                <option value="" className="bg-[#0b1220]">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0b1220]">{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1.5 block font-bold">Subject *</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief subject of your grievance" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90 focus:border-violet-400/50 focus:outline-none placeholder:text-slate-600 transition-all" />
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1.5 block font-bold">Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Provide detailed information..." className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90 focus:border-violet-400/50 focus:outline-none resize-none placeholder:text-slate-600 transition-all" />
          </div>
          <div>
            <label className="text-xs text-white/60 mb-2 block font-bold">Priority</label>
            <div className="flex gap-3">
              {PRIORITIES.map((p) => {
                const ps = PRIORITY_STYLES[p];
                return (
                  <button key={p} onClick={() => setPriority(p)} className={`flex-1 py-2.5 rounded-lg text-xs font-bold border transition-all ${priority === p ? `${ps.bg} ${ps.text}` : "bg-white/[0.02] border-white/10 text-white/50 hover:text-white/70"}`}>
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1.5 block font-bold">Supporting Document (optional)</label>
            <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white/[0.03] border border-dashed border-white/15 rounded-xl text-sm text-white/50 hover:text-white/70 hover:border-white/30 cursor-pointer transition-all">
              <Upload size={16} />
              <span>{attachFile ? attachFile.name : "Click to upload document"}</span>
              <input type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" onChange={(e) => setAttachFile(e.target.files[0] || null)} />
            </label>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!category || !subject || !description || addressedTo.length === 0}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/20"
          >
            <Send size={16} /> Submit Grievance
          </button>
        </div>
      </SlidePanel>
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({ icon: Icon, label, value, color, bg, border }) {
  return (
    <div className={`rounded-2xl border ${border} ${bg} p-4 transition-all hover:scale-[1.02]`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center border ${border}`}>
          <Icon size={14} className={color} />
        </div>
        <span className="text-[10px] text-white/60 uppercase tracking-wider font-black">{label}</span>
      </div>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}
