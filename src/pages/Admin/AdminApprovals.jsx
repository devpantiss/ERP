import { useState, useMemo } from "react";
import AuditTrail from "../../components/common/AuditTrail";
import { buildGenericApprovalAuditTrail } from "../../utils/auditTrailHelpers";
import {
  ArrowLeft,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Eye,
  Filter,
  FolderKanban,
  Megaphone,
  Search,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import SlidePanel from "../../components/common/SlidePanel";
import {
  PROJECT_REPORTS,
  TRAINER_APPROVALS,
  MOBILIZER_APPROVALS,
  PLACEMENT_APPROVALS,
} from "./adminPortalData";

/* ── constants ── */
const statusStyles = {
  Pending: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  Reviewed: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  Approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const tabs = [
  { id: "trainer", label: "Trainer", icon: BookOpen },
  { id: "mobilizer", label: "Mobilizer", icon: Megaphone },
  { id: "placement", label: "Placement", icon: BriefcaseBusiness },
];

const ALL_APPROVALS = [
  ...TRAINER_APPROVALS.map((a) => ({ ...a, _role: "trainer" })),
  ...MOBILIZER_APPROVALS.map((a) => ({ ...a, _role: "mobilizer" })),
  ...PLACEMENT_APPROVALS.map((a) => ({ ...a, _role: "placement" })),
];

/* ── helpers ── */
const pendingCount = (list) => list.filter((r) => r.status === "Pending").length;

const getPersonName = (req) => req.trainer || req.mobilizer || req.officer || "—";

const getContextTitle = (role) =>
  role === "trainer" ? "Batch" : role === "mobilizer" ? "Location" : "Entity";

const getContextValue = (req) => req.batch || req.location || req.entity || "—";

/* ── main ── */
export default function AdminApprovals() {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [activeTab, setActiveTab] = useState("trainer");
  const [searchQuery, setSearchQuery] = useState("");
  const [trainerReqs, setTrainerReqs] = useState(TRAINER_APPROVALS);
  const [mobilizerReqs, setMobilizerReqs] = useState(MOBILIZER_APPROVALS);
  const [placementReqs, setPlacementReqs] = useState(PLACEMENT_APPROVALS);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const selectedProject = PROJECT_REPORTS.find((p) => p.id === selectedProjectId) || null;

  /* project-level aggregate counts for the cards */
  const projectMeta = useMemo(() => {
    const map = {};
    ALL_APPROVALS.forEach((a) => {
      if (!map[a.project]) map[a.project] = { total: 0, pending: 0 };
      map[a.project].total += 1;
      if (a.status === "Pending") map[a.project].pending += 1;
    });
    return map;
  }, []);

  /* filtered data for the selected project + active tab */
  const projectApprovals = useMemo(() => {
    if (!selectedProject) return { trainer: [], mobilizer: [], placement: [] };
    const pName = selectedProject.name;
    return {
      trainer: trainerReqs.filter((r) => r.project === pName),
      mobilizer: mobilizerReqs.filter((r) => r.project === pName),
      placement: placementReqs.filter((r) => r.project === pName),
    };
  }, [selectedProject, trainerReqs, mobilizerReqs, placementReqs]);

  const activeData = projectApprovals[activeTab] || [];

  const filteredData = useMemo(() => {
    if (!searchQuery) return activeData;
    const q = searchQuery.toLowerCase();
    return activeData.filter((r) => {
      const hay = `${r.id} ${r.requestType} ${r.center} ${r.status} ${getPersonName(r)}`.toLowerCase();
      return hay.includes(q);
    });
  }, [activeData, searchQuery]);

  const updateStatus = (id, newStatus) => {
    const updater = (list) => list.map((r) => (r.id === id ? { ...r, status: newStatus } : r));
    setTrainerReqs(updater);
    setMobilizerReqs(updater);
    setPlacementReqs(updater);
  };

  const handleBack = () => {
    setSelectedProjectId(null);
    setActiveTab("trainer");
    setSearchQuery("");
  };

  /* ── render ── */
  return (
    <div className="space-y-6 lg:space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Approvals <span className="text-violet-400">Hub</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Centralized command center for reviewing and granting operational
            approvals across Trainers, Mobilizers, and Placement Officers.
          </p>
        </div>
      </div>

      {!selectedProject ? (
        /* ─── PROJECT CARDS ─── */
        <>
          {/* Global summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard
              label="Total Requests"
              value={ALL_APPROVALS.length}
              icon={ClipboardList}
              color="text-violet-400"
              bg="bg-violet-500/10"
            />
            <SummaryCard
              label="Pending Review"
              value={pendingCount(ALL_APPROVALS)}
              icon={Eye}
              color="text-amber-400"
              bg="bg-amber-500/10"
            />
            <SummaryCard
              label="Approved"
              value={ALL_APPROVALS.filter((r) => r.status === "Approved").length}
              icon={CheckCircle2}
              color="text-emerald-400"
              bg="bg-emerald-500/10"
            />
          </div>

          {/* Project grid */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {PROJECT_REPORTS.map((project) => {
              const meta = projectMeta[project.name] || { total: 0, pending: 0 };
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setSelectedProjectId(project.id)}
                  className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] p-6 text-left transition-all hover:border-violet-500/30 hover:bg-[#151e2f] hover:shadow-[0_0_40px_rgba(124,58,237,0.08)]"
                >
                  {/* Pending indicator */}
                  {meta.pending > 0 && (
                    <span className="absolute right-4 top-4 flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-500/20 px-1.5 text-[11px] font-bold text-amber-300 ring-1 ring-amber-500/30">
                      {meta.pending}
                    </span>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                      <FolderKanban size={20} className="text-violet-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-semibold text-white">
                        {project.name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {project.fundingAgency}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <MiniStat label="Total" value={meta.total} />
                    <MiniStat label="Pending" value={meta.pending} accent="amber" />
                    <MiniStat
                      label="Approved"
                      value={
                        ALL_APPROVALS.filter(
                          (a) => a.project === project.name && a.status === "Approved"
                        ).length
                      }
                      accent="emerald"
                    />
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-violet-400 opacity-0 transition group-hover:opacity-100">
                    View approvals <ChevronRight size={14} />
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        /* ─── PROJECT APPROVAL DETAIL ─── */
        <>
          {/* Back + project header */}
          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
            <button
              type="button"
              onClick={handleBack}
              className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to projects
            </button>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">
                  <FolderKanban size={22} className="text-violet-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    {selectedProject.name}
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-400">
                    {selectedProject.fundingAgency} •{" "}
                    <span
                      className={
                        selectedProject.status === "Active"
                          ? "text-emerald-400"
                          : "text-amber-400"
                      }
                    >
                      {selectedProject.status}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <ProjectStat
                  label="Total"
                  value={
                    projectApprovals.trainer.length +
                    projectApprovals.mobilizer.length +
                    projectApprovals.placement.length
                  }
                  icon={ClipboardList}
                />
                <ProjectStat
                  label="Pending"
                  value={
                    pendingCount(projectApprovals.trainer) +
                    pendingCount(projectApprovals.mobilizer) +
                    pendingCount(projectApprovals.placement)
                  }
                  icon={Eye}
                  accent="amber"
                />
              </div>
            </div>
          </div>

          {/* Tabs + table */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] shadow-xl">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 border-b border-slate-800 bg-[#0b1220] p-4 lg:flex-row lg:items-center xl:px-6">
              {/* Tab pills */}
              <div className="flex overflow-x-auto rounded-xl bg-slate-800/50 p-1 lg:w-max">
                {tabs.map((tab) => {
                  const count = pendingCount(projectApprovals[tab.id]);
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSearchQuery("");
                      }}
                      className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? "border border-violet-500/30 bg-violet-500/20 text-violet-300 shadow-sm"
                          : "border border-transparent text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
                      }`}
                    >
                      <tab.icon
                        size={16}
                        className={isActive ? "text-violet-400" : "opacity-50"}
                      />
                      <span className="whitespace-nowrap">{tab.label}</span>
                      {count > 0 && (
                        <span
                          className={`ml-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                            isActive
                              ? "bg-amber-500/25 text-amber-300 ring-1 ring-amber-400/30"
                              : "bg-slate-700 text-slate-400"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="hidden h-8 w-px bg-slate-800 lg:block" />

              {/* Search */}
              <div className="flex w-full items-center gap-3 lg:ml-auto lg:w-[350px]">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-[#0f172a] py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 transition-all focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <button className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-[#0f172a] text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
                  <Filter size={18} />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-slate-800 bg-[#0b1220] text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Request ID</th>
                    <th className="px-6 py-4 font-semibold">
                      {activeTab === "trainer"
                        ? "Trainer"
                        : activeTab === "mobilizer"
                        ? "Mobilizer"
                        : "Officer"}
                    </th>
                    <th className="px-6 py-4 font-semibold">Center</th>
                    <th className="px-6 py-4 font-semibold">Type</th>
                    <th className="px-6 py-4 font-semibold">
                      {getContextTitle(activeTab)}
                    </th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredData.length > 0 ? (
                    filteredData.map((request) => (
                      <tr
                        key={request.id}
                        className="group transition-colors hover:bg-slate-800/30"
                      >
                        <td className="px-6 py-4 font-medium text-slate-200">
                          {request.id}
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-white">
                              {getPersonName(request).charAt(0)}
                            </div>
                            {getPersonName(request)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {request.center}
                        </td>
                        <td className="px-6 py-4 font-medium text-violet-200">
                          {request.requestType}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {getContextValue(request)}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {request.submittedOn}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide ${
                              statusStyles[request.status] ||
                              "border-slate-700 bg-slate-800 text-slate-300"
                            }`}
                          >
                            {request.status === "Approved" && (
                              <CheckCircle2 size={12} className="mr-1.5" />
                            )}
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                            <button
                              onClick={() => setSelectedRequest(request)}
                              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700"
                            >
                              Review
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        <ClipboardList
                          size={32}
                          className="mx-auto mb-3 opacity-20"
                        />
                        <p className="font-medium text-slate-400">
                          No approval requests found.
                        </p>
                        <p className="mt-1 text-xs">
                          Try adjusting your active tab or search filters.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* SlidePanel for Detailed Review */}
      <SlidePanel
        open={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        title={selectedRequest ? "Approval Review" : ""}
        width="lg"
      >
        {selectedRequest && (
          <div className="flex h-full flex-col bg-[#0a0e17]">
            {/* Context Header */}
            <div className="shrink-0 border-b border-slate-800 bg-[#0b1220] p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedRequest.requestType}
                  </h2>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                    ID:{" "}
                    <span className="font-mono text-slate-300">
                      {selectedRequest.id}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-600" />
                    {selectedRequest.submittedOn}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide ${
                    statusStyles[selectedRequest.status]
                  }`}
                >
                  {selectedRequest.status}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailCard
                  label="Person"
                  value={getPersonName(selectedRequest)}
                />
                <DetailCard
                  label="Center & Location"
                  value={selectedRequest.center}
                />
                <DetailCard
                  label="Context"
                  value={getContextValue(selectedRequest)}
                />
                <DetailCard
                  label="Date Submitted"
                  value={selectedRequest.submittedOn}
                />
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]">
                <div className="border-b border-slate-800 bg-slate-800/30 px-5 py-3">
                  <h3 className="text-sm font-semibold text-slate-300">
                    Justification & Remarks
                  </h3>
                </div>
                <div className="p-5">
                  <p className="text-sm leading-relaxed text-slate-300">
                    {selectedRequest.remarks ||
                      "No additional remarks provided."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-violet-500/30 bg-violet-500/5 p-6 text-center">
                <BookOpen size={24} className="mb-2 text-violet-400/50" />
                <p className="text-sm text-violet-200">
                  Supporting documentation is available.
                </p>
                <button className="mt-3 text-xs font-semibold text-violet-400 underline underline-offset-2 hover:text-violet-300">
                  View Attachments
                </button>
              </div>

              {/* Audit Trail */}
              <AuditTrail
                entries={buildGenericApprovalAuditTrail(selectedRequest)}
                tone="violet"
              />
            </div>

            {/* Sticky Action Footer */}
            <div className="shrink-0 border-t border-slate-800 bg-[#0b1220] p-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-3">
                  {selectedRequest.status === "Pending" && (
                    <button
                      onClick={() => {
                        updateStatus(selectedRequest.id, "Reviewed");
                        setSelectedRequest(null);
                      }}
                      className="rounded-xl border border-amber-500/50 bg-amber-500/10 px-5 py-2.5 text-sm font-semibold text-amber-500 transition-colors hover:bg-amber-500/20"
                    >
                      Mark as Reviewed
                    </button>
                  )}
                  {selectedRequest.status !== "Approved" && (
                    <button
                      onClick={() => {
                        updateStatus(selectedRequest.id, "Approved");
                        setSelectedRequest(null);
                      }}
                      className="flex items-center gap-2 rounded-xl bg-violet-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:bg-violet-400"
                    >
                      <CheckCircle2 size={16} />
                      Grant Approval
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </SlidePanel>
    </div>
  );
}

/* ── sub-components ── */

function SummaryCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] p-5 transition-all hover:border-slate-700 hover:bg-[#151e2f]">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <div className={`rounded-xl p-2.5 ${bg}`}>
          <Icon size={18} className={color} />
        </div>
      </div>
      <p className="text-4xl font-bold tracking-tight text-white">{value}</p>
    </div>
  );
}

function MiniStat({ label, value, accent }) {
  const cls =
    accent === "amber"
      ? "text-amber-300"
      : accent === "emerald"
      ? "text-emerald-300"
      : "text-white";
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0b1220] px-3 py-2 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <p className={`mt-1 text-lg font-bold ${cls}`}>{value}</p>
    </div>
  );
}

function ProjectStat({ label, value, icon: Icon, accent }) {
  const cls = accent === "amber" ? "text-amber-300" : "text-violet-300";
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0b1220] px-4 py-2">
      <Icon size={14} className="text-slate-500" />
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-sm font-bold ${cls}`}>{value}</span>
    </div>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-slate-200">{value}</p>
    </div>
  );
}
