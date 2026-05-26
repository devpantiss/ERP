import { useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, FolderKanban, ShieldCheck, XCircle } from "lucide-react";
import { Breadcrumb, PageHeader } from "./SuperAdminSharedComponents";
import { readLeaveRequests, ROLE_LABEL, writeLeaveRequests } from "../shared/leaveWorkflow";

const PROJECT_BY_ROLE = {
  trainer: "Tata Steel Foundation Livelihood Program",
  mobilizer: "DDUGKY Rural Youth Employment Program",
  placement: "PMKVY 4.0 Odisha Skills",
  admin: "PMKVY 4.0 Odisha Skills",
};

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

export default function SuperAdminLeaveApprovals() {
  const [requests, setRequests] = useState(() => readLeaveRequests().map(normalizeLeave));
  const [selectedProject, setSelectedProject] = useState(null);
  const [rejectDraft, setRejectDraft] = useState(null);

  const adminCleared = useMemo(
    () => requests.filter((request) => request.status !== "Pending Admin Review"),
    [requests]
  );
  const projects = useMemo(() => summarizeProjects(adminCleared), [adminCleared]);
  const rows = selectedProject ? adminCleared.filter((request) => request.project === selectedProject) : [];
  const totals = useMemo(() => summarizeTotals(adminCleared), [adminCleared]);

  const persist = (nextRequests) => {
    const writable = nextRequests.map(({ project, ...request }) => request);
    writeLeaveRequests(writable);
    setRequests(nextRequests);
  };

  const decide = (id, status, reason = "") => {
    persist(
      requests.map((request) =>
        request.id === id
          ? {
              ...request,
              status,
              superAdminDecision:
                status === "Approved"
                  ? "Approved by Super Admin."
                  : `Rejected by Super Admin: ${reason}`,
              superAdminRejectionReason: status === "Rejected" ? reason : "",
              decisionNote:
                status === "Approved"
                  ? "Final approval completed by Super Admin."
                  : `Super Admin rejection reason: ${reason}`,
            }
          : request
      )
    );
  };

  const submitRejection = (event) => {
    event.preventDefault();
    const reason = rejectDraft?.reason.trim();
    if (!rejectDraft || !reason) return;
    decide(rejectDraft.id, "Rejected", reason);
    setRejectDraft(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={CalendarDays}
        title={selectedProject ? `${selectedProject} Leaves` : "Leave Approvals"}
        subtitle={
          selectedProject
            ? "Final Super Admin decision for leave requests forwarded by Admin."
            : "Only Admin-approved leave requests appear here for final review."
        }
      />
      <Breadcrumb items={selectedProject ? ["Super Admin", "Leave Approvals", selectedProject] : ["Super Admin", "Leave Approvals"]} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={Clock} label="Pending Final Review" value={totals.pending} />
        <Metric icon={CheckCircle2} label="Approved" value={totals.approved} />
        <Metric icon={XCircle} label="Rejected" value={totals.rejected} />
      </div>

      {!selectedProject ? (
        <ProjectGrid projects={projects} onSelect={setSelectedProject} />
      ) : (
        <section className="space-y-5">
          <button
            type="button"
            onClick={() => setSelectedProject(null)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2 text-xs font-black text-white/70 transition hover:border-red-400/40 hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to Projects
          </button>
          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1460px] table-fixed text-sm">
                <colgroup>
                  <col className="w-[180px]" />
                  <col className="w-[230px]" />
                  <col className="w-[190px]" />
                  <col className="w-[250px]" />
                  <col className="w-[110px]" />
                  <col className="w-[360px]" />
                  <col className="w-[200px]" />
                  <col className="w-[190px]" />
                </colgroup>
                <thead className="border-b border-slate-700/50 bg-[#0b1220] text-xs uppercase tracking-[0.14em] text-slate-500">
                  <tr>
                    {["Request", "Employee", "Leave Type", "Dates", "Days", "Admin Clearance", "Status", "Action"].map((header) => (
                      <th key={header} className="px-6 py-4 text-left font-black">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {rows.map((request) => (
                    <tr key={request.id} className="hover:bg-white/[0.03]">
                      <td className="px-6 py-5 align-top">
                        <p className="font-black text-white">{request.id}</p>
                        <p className="text-xs text-slate-500">Applied {formatDate(request.appliedOn)}</p>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <p className="font-semibold text-white">{request.employee}</p>
                        <p className="text-xs text-slate-500">{ROLE_LABEL[request.role]}</p>
                      </td>
                      <td className="px-6 py-5 align-top text-slate-400">{request.type}</td>
                      <td className="px-6 py-5 align-top text-slate-400">{formatDate(request.from)} - {formatDate(request.to)}</td>
                      <td className="px-6 py-5 align-top text-slate-400">{request.days}</td>
                      <td className="px-6 py-5 align-top text-slate-400">
                        <p className="font-semibold text-white">{request.approver || "Admin Office"}</p>
                        <p className="mt-2 text-xs leading-5 text-slate-500">{request.adminDecision || "Forwarded by Admin."}</p>
                      </td>
                      <td className="px-6 py-5 align-top"><Status status={request.status} /></td>
                      <td className="px-6 py-5 align-top">
                        {request.status === "Pending Super Admin Review" ? (
                          <div className="inline-flex min-w-[140px] flex-col gap-2">
                            <Action tone="approve" onClick={() => decide(request.id, "Approved")}>Approve</Action>
                            <Action tone="reject" onClick={() => setRejectDraft({ id: request.id, reason: "" })}>Reject</Action>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">Closed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {rejectDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form onSubmit={submitRejection} className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#0b1220] p-5 shadow-2xl shadow-black/40">
            <h2 className="text-lg font-black text-white">Reject Leave Request</h2>
            <p className="mt-1 text-sm text-slate-500">Add the Super Admin rejection reason.</p>
            <textarea
              required
              autoFocus
              rows={5}
              value={rejectDraft.reason}
              onChange={(event) => setRejectDraft({ ...rejectDraft, reason: event.target.value })}
              placeholder="Enter rejection reason"
              className="mt-5 w-full resize-none rounded-xl border border-slate-700 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-red-400/50"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setRejectDraft(null)} className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white/65 transition hover:bg-white/5 hover:text-white">Cancel</button>
              <button type="submit" className="rounded-xl bg-red-500/15 px-4 py-2 text-sm font-black text-red-300 transition hover:bg-red-500/25">Reject Request</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function normalizeLeave(request) {
  return { ...request, project: request.project || PROJECT_BY_ROLE[request.role] || "PMKVY 4.0 Odisha Skills" };
}

function summarizeProjects(requests) {
  return Array.from(
    requests.reduce((map, request) => {
      const current = map.get(request.project) || { name: request.project, total: 0, pending: 0, approved: 0 };
      map.set(request.project, {
        ...current,
        total: current.total + 1,
        pending: current.pending + (request.status === "Pending Super Admin Review" ? 1 : 0),
        approved: current.approved + (request.status === "Approved" ? 1 : 0),
      });
      return map;
    }, new Map()).values()
  );
}

function summarizeTotals(requests) {
  return {
    pending: requests.filter((request) => request.status === "Pending Super Admin Review").length,
    approved: requests.filter((request) => request.status === "Approved").length,
    rejected: requests.filter((request) => request.status === "Rejected").length,
  };
}

function ProjectGrid({ projects, onSelect }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <button key={project.name} type="button" onClick={() => onSelect(project.name)} className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 text-left transition hover:border-red-400/35 hover:bg-[#151e2f]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-300"><FolderKanban size={20} /></div>
            <div className="min-w-0">
              <p className="truncate text-base font-black text-white">{project.name}</p>
              <p className="mt-1 text-xs text-slate-500">Admin-forwarded leave requests</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <MiniStat label="Total" value={project.total} />
            <MiniStat label="Pending" value={project.pending} accent="amber" />
            <MiniStat label="Approved" value={project.approved} accent="emerald" />
          </div>
        </button>
      ))}
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-300"><Icon size={20} /></div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

function MiniStat({ label, value, accent = "slate" }) {
  const cls = accent === "amber" ? "text-amber-300" : accent === "emerald" ? "text-emerald-300" : "text-white";
  return <div className="rounded-xl border border-slate-700/50 bg-[#0b1220] px-3 py-2"><p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p><p className={`mt-1 text-sm font-black ${cls}`}>{value}</p></div>;
}

function Status({ status }) {
  const cls = {
    Approved: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
    "Pending Super Admin Review": "border-amber-400/25 bg-amber-500/10 text-amber-300",
    Rejected: "border-red-400/25 bg-red-500/10 text-red-300",
  }[status] || "border-slate-500/25 bg-slate-500/10 text-slate-300";
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${cls}`}>{status}</span>;
}

function Action({ tone, onClick, children }) {
  const cls = tone === "approve" ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25" : "bg-red-500/15 text-red-300 hover:bg-red-500/25";
  return <button type="button" onClick={onClick} className={`rounded-lg px-4 py-2.5 text-xs font-semibold transition ${cls}`}>{children}</button>;
}
