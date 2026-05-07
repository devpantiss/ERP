import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  MessageSquareWarning,
  Clock,
  CheckCircle2,
  Eye,
  ArrowUpRight,
  ChevronDown,
  Search,
  MessageCircle,
  Users,
  ShieldAlert,
  User,
  Building2,
  FolderKanban,
  Filter,
} from "lucide-react";
import { PageHeader } from "./SuperAdminSharedComponents";
import { EMPLOYEE_GRIEVANCES, ADMIN_TO_SUPERADMIN_GRIEVANCES } from "../shared/grievanceData";

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════ */

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

export default function SuperAdminGrievancePortal() {
  const [activeTab, setActiveTab] = useState("all"); // "all" | "admin" | "employee"
  const [allEmpGrievances, setAllEmpGrievances] = useState(EMPLOYEE_GRIEVANCES);
  const [adminGrievances, setAdminGrievances] = useState(ADMIN_TO_SUPERADMIN_GRIEVANCES);
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProject, setFilterProject] = useState("All");

  // Status update
  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const allGrievances = useMemo(() => [...adminGrievances, ...allEmpGrievances], [adminGrievances, allEmpGrievances]);

  const projects = useMemo(() => {
    const set = new Set(allGrievances.map((g) => g.project));
    return ["All", ...Array.from(set).sort()];
  }, [allGrievances]);

  const currentList = useMemo(() => {
    if (activeTab === "admin") return adminGrievances;
    if (activeTab === "employee") return allEmpGrievances;
    return allGrievances;
  }, [activeTab, allGrievances, adminGrievances, allEmpGrievances]);

  const filtered = useMemo(() => {
    return currentList
      .filter((g) => filterStatus === "All" || g.status === filterStatus)
      .filter((g) => filterProject === "All" || g.project === filterProject)
      .filter((g) => !searchQuery || g.subject.toLowerCase().includes(searchQuery.toLowerCase()) || g.raisedBy.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [currentList, filterStatus, filterProject, searchQuery]);

  const globalStats = {
    total: allGrievances.length,
    open: allGrievances.filter((g) => g.status === "Open").length,
    inReview: allGrievances.filter((g) => g.status === "Under Review").length,
    resolved: allGrievances.filter((g) => g.status === "Resolved").length,
    escalated: allGrievances.filter((g) => g.status === "Escalated").length,
    fromAdmins: adminGrievances.length,
    fromEmployees: allEmpGrievances.length,
  };

  /* Update status */
  const handleStatusUpdate = () => {
    if (!statusModal || !newStatus) return;
    const isAdminGrievance = statusModal.id.startsWith("GRV-A");
    const setter = isAdminGrievance ? setAdminGrievances : setAllEmpGrievances;
    setter((prev) =>
      prev.map((g) => {
        if (g.id !== statusModal.id) return g;
        const updatedTimeline = [
          ...g.timeline,
          { date: new Date().toISOString().split("T")[0], status: newStatus, note: `Status changed to ${newStatus} by Super Admin` },
        ];
        return {
          ...g,
          status: newStatus,
          resolvedOn: newStatus === "Resolved" ? new Date().toISOString().split("T")[0] : g.resolvedOn,
          timeline: updatedTimeline,
        };
      })
    );
    toast.success(`Grievance ${statusModal.id} updated to ${newStatus}`);
    setStatusModal(null);
    setNewStatus("");
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <PageHeader icon={MessageSquareWarning} title="Grievance Tracker" subtitle="All projects · Organization-wide grievance monitoring" />

      {/* ─── Summary Cards ─── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <StatCard icon={MessageSquareWarning} label="Total" value={globalStats.total} color="text-red-400" bg="bg-red-500/10" border="border-red-500/20" />
        <StatCard icon={Clock} label="Open" value={globalStats.open} color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20" />
        <StatCard icon={Eye} label="In Review" value={globalStats.inReview} color="text-sky-400" bg="bg-sky-500/10" border="border-sky-500/20" />
        <StatCard icon={CheckCircle2} label="Resolved" value={globalStats.resolved} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
        <StatCard icon={ArrowUpRight} label="Escalated" value={globalStats.escalated} color="text-red-400" bg="bg-red-500/10" border="border-red-500/20" />
        <StatCard icon={ShieldAlert} label="From Admins" value={globalStats.fromAdmins} color="text-violet-400" bg="bg-violet-500/10" border="border-violet-500/20" />
        <StatCard icon={Users} label="From Employees" value={globalStats.fromEmployees} color="text-cyan-400" bg="bg-cyan-500/10" border="border-cyan-500/20" />
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex flex-wrap gap-2 p-1 bg-white/[0.02] rounded-xl border border-white/[0.06] w-fit">
        {[
          { key: "all", label: "All Grievances", icon: MessageSquareWarning },
          { key: "admin", label: "From Admins", icon: ShieldAlert },
          { key: "employee", label: "From Employees", icon: Users },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setFilterStatus("All"); setSearchQuery(""); setExpandedId(null); setFilterProject("All"); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab.key ? "bg-red-500/15 text-red-400 border border-red-500/30" : "text-white/50 hover:text-white/80"}`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Filter & Search ─── */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject or name..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white/90 focus:border-red-400/50 focus:outline-none placeholder:text-slate-600 transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="appearance-none bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 pr-8 text-xs font-bold text-white/80 focus:outline-none cursor-pointer"
          >
            {projects.map((p) => <option key={p} value={p} className="bg-[#0b1220]">{p === "All" ? "All Projects" : p}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Open", "Under Review", "Resolved", "Escalated"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold border transition-all ${filterStatus === s ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-white/[0.02] border-white/[0.06] text-white/50 hover:text-white/80"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Results count ─── */}
      <p className="text-xs font-bold text-slate-500">
        Showing <span className="text-white">{filtered.length}</span> of <span className="text-white">{currentList.length}</span> grievances
      </p>

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
              <div className="flex items-center justify-between px-6 py-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : g.id)}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${sConfig.bg}`}>
                    <SIcon size={16} className={sConfig.text} />
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
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className="text-white/40">Addressed to:</span>
                    <span className="px-2.5 py-1 rounded-lg border bg-violet-500/10 border-violet-500/20 text-violet-300 font-bold">{g.addressedTo}</span>
                    <span className="text-white/40 ml-2">Category:</span>
                    <span className="text-white/70 font-bold">{g.category}</span>
                    <span className="text-white/40 ml-2">Role:</span>
                    <span className="text-white/70 font-bold">{g.role}</span>
                  </div>

                  <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
                    <p className="text-xs text-white/50 uppercase tracking-wide mb-2 flex items-center gap-1.5 font-bold">
                      <MessageCircle size={12} /> Description
                    </p>
                    <p className="text-sm text-white/80 leading-relaxed">{g.description}</p>
                  </div>

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

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-white/30">ID: {g.id} · Submitted: {g.submittedOn}</span>
                    {g.status !== "Resolved" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setStatusModal(g); setNewStatus(g.status); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold transition hover:bg-red-500/20"
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
            <p className="text-xs text-white/50 mb-1">{statusModal.subject}</p>
            <p className="text-[10px] text-white/30 mb-5">Raised by: {statusModal.raisedBy} · {statusModal.project}</p>
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
              <button onClick={handleStatusUpdate} className="flex items-center gap-2 rounded-xl bg-red-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-400">
                <CheckCircle2 size={14} /> Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({ icon: Icon, label, value, color, bg, border }) {
  return (
    <div className={`rounded-2xl border ${border} bg-[#111827]/80 p-4 transition-all hover:scale-[1.02]`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center border ${border}`}>
          <Icon size={13} className={color} />
        </div>
        <span className="text-[9px] text-white/50 uppercase tracking-wider font-black">{label}</span>
      </div>
      <p className={`text-xl font-black ${color}`}>{value}</p>
    </div>
  );
}
