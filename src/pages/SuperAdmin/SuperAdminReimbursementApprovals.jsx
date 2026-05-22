import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  FolderKanban,
  HandCoins,
  ReceiptText,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { mockDb } from "../../mock-db/index.js";
import { useHrStore } from "../../stores/hrStore.js";
import { Breadcrumb, PageHeader } from "./SuperAdminSharedComponents";
import ReimbursementClaimOverlay from "../shared/ReimbursementClaimOverlay.jsx";

const STATUS_LABELS = {
  SUBMITTED: "Waiting Admin",
  UNDER_REVIEW: "Waiting Admin",
  ADMIN_APPROVED: "Pending Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const STATUS_CLASS = {
  "Waiting Admin": "border-slate-500/25 bg-slate-500/10 text-slate-300",
  "Pending Review": "border-amber-400/25 bg-amber-500/10 text-amber-300",
  Approved: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
  Rejected: "border-red-400/25 bg-red-500/10 text-red-300",
};

function employeeName(employeeId) {
  const employee = mockDb.employees.byId[employeeId];
  return employee ? `${employee.firstName} ${employee.lastName}` : "Employee";
}

function employeeRole(employeeId) {
  return mockDb.employees.byId[employeeId]?.designation || "Employee";
}

function projectName(projectId) {
  return mockDb.projects.byId[projectId]?.name || "Project";
}

function fundingAgency(projectId) {
  const project = mockDb.projects.byId[projectId];
  const agency = project ? mockDb.fundingAgencies.byId[project.fundingAgencyId] : null;
  return agency?.shortName || agency?.name || "-";
}

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function normalizeClaim(claim) {
  const status = STATUS_LABELS[claim.status] || claim.status;
  return {
    ...claim,
    amount: claim.totalAmount || claim.amount || 0,
    bills: claim.bills || [{ date: claim.submittedOn || "-", desc: claim.category || "Claim", amount: claim.amount || 0, mode: "Online" }],
    employee: employeeName(claim.employeeId),
    role: employeeRole(claim.employeeId),
    project: projectName(claim.projectId),
    fundingAgency: fundingAgency(claim.projectId),
    statusLabel: status,
    submittedOn: claim.submittedOn || claim.createdAt?.slice(0, 10) || "-",
  };
}

function summarizeProjects(claims) {
  return Array.from(
    claims
      .reduce((map, claim) => {
        const current = map.get(claim.projectId) || {
          id: claim.projectId,
          name: claim.project,
          fundingAgency: claim.fundingAgency,
          total: 0,
          amount: 0,
          waitingAdmin: 0,
          pendingReview: 0,
          approved: 0,
          rejected: 0,
        };

        map.set(claim.projectId, {
          ...current,
          total: current.total + 1,
          amount: current.amount + claim.amount,
          waitingAdmin: current.waitingAdmin + (claim.statusLabel === "Waiting Admin" ? 1 : 0),
          pendingReview: current.pendingReview + (claim.statusLabel === "Pending Review" ? 1 : 0),
          approved: current.approved + (claim.statusLabel === "Approved" ? 1 : 0),
          rejected: current.rejected + (claim.statusLabel === "Rejected" ? 1 : 0),
        });

        return map;
      }, new Map())
      .values()
  );
}

export default function SuperAdminReimbursementApprovals() {
  const { reimbursements, fetchReimbursements, updateReimbursement } = useHrStore();
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchReimbursements();
  }, [fetchReimbursements]);

  const claims = useMemo(() => reimbursements.map(normalizeClaim), [reimbursements]);
  const projectSummaries = useMemo(() => summarizeProjects(claims), [claims]);
  const selectedProject = useMemo(
    () => projectSummaries.find((project) => project.id === selectedProjectId),
    [projectSummaries, selectedProjectId]
  );

  const visibleClaims = useMemo(() => {
    if (!selectedProjectId) return [];
    const query = search.trim().toLowerCase();
    return claims.filter((claim) => {
      if (claim.projectId !== selectedProjectId) return false;
      if (!query) return true;
      return `${claim.id} ${claim.employee} ${claim.role} ${claim.category} ${claim.statusLabel}`.toLowerCase().includes(query);
    });
  }, [claims, search, selectedProjectId]);

  const totals = useMemo(
    () =>
      claims.reduce(
        (summary, claim) => ({
          amount: summary.amount + claim.amount,
          waitingAdmin: summary.waitingAdmin + (claim.statusLabel === "Waiting Admin" ? 1 : 0),
          pendingReview: summary.pendingReview + (claim.statusLabel === "Pending Review" ? 1 : 0),
          approved: summary.approved + (claim.statusLabel === "Approved" ? 1 : 0),
        }),
        { amount: 0, waitingAdmin: 0, pendingReview: 0, approved: 0 }
      ),
    [claims]
  );

  const decide = (id, status) => {
    updateReimbursement(id, {
      status,
      superAdminDecidedOn: new Date().toISOString().split("T")[0],
    });
    setSelectedClaim(null);
  };

  const clearProjectSelection = () => {
    setSelectedProjectId(null);
    setSearch("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={HandCoins}
        title={selectedProject ? `${selectedProject.name} Reimbursements` : "Reimbursement Approvals"}
        subtitle={
          selectedProject
            ? "Review Admin-approved reimbursement claims for this project."
            : "Project-wise reimbursement approval queue across all programs."
        }
      />
      <Breadcrumb
        items={
          selectedProject
            ? ["Super Admin", "Reimbursements", selectedProject.name]
            : ["Super Admin", "Reimbursements"]
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={HandCoins} label="Claim Value" value={formatCurrency(totals.amount)} tone="red" />
        <MetricCard icon={Clock} label="Waiting Admin" value={totals.waitingAdmin} tone="slate" />
        <MetricCard icon={ShieldCheck} label="Pending Review" value={totals.pendingReview} tone="amber" />
        <MetricCard icon={CheckCircle2} label="Approved" value={totals.approved} tone="emerald" />
      </div>

      {!selectedProject ? (
        <section className="space-y-5">
          <div className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 backdrop-blur-sm">
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-white/85">Select Project</h2>
            <p className="mt-1 text-sm text-slate-500">
              Open a project to review only the reimbursement claims routed from that project.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projectSummaries.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => setSelectedProjectId(project.id)}
                className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 text-left transition hover:border-red-400/35 hover:bg-[#151e2f]"
              >
                {project.pendingReview > 0 && (
                  <span className="absolute right-4 top-4 rounded-full border border-amber-400/20 bg-amber-500/10 px-2.5 py-1 text-xs font-black text-amber-300">
                    {project.pendingReview} pending
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-300">
                    <FolderKanban size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-black text-white">{project.name}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                      {project.fundingAgency}
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  <MiniStat label="Claims" value={project.total} />
                  <MiniStat label="Pending" value={project.pendingReview} accent="amber" />
                  <MiniStat label="Value" value={formatCurrency(project.amount)} accent="emerald" />
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="space-y-5">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between">
            <button
              type="button"
              onClick={clearProjectSelection}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2 text-xs font-bold text-white/70 transition hover:border-red-400/40 hover:text-white"
            >
              <ArrowLeft size={14} />
              Back to Projects
            </button>
            <label className="relative w-full lg:max-w-sm">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search claims..."
                className="w-full rounded-xl border border-slate-700 bg-[#0b1220] py-2.5 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-400/60"
              />
            </label>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] text-sm">
                <thead className="border-b border-slate-700/50 bg-[#0b1220] text-xs uppercase tracking-[0.14em] text-slate-500">
                  <tr>
                    {["Claim", "Employee", "Bills", "Submitted", "Amount", "Admin Status", "Super Admin Action"].map((header) => (
                      <th key={header} className="px-5 py-4 text-left font-black">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {visibleClaims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-white/[0.03]">
                      <td className="px-5 py-4">
                        <p className="font-black text-white">{claim.id}</p>
                        <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <ReceiptText size={13} className="text-red-300" />
                          {claim.claimTitle || claim.category || "Reimbursement"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{claim.employee}</p>
                        <p className="text-xs text-slate-500">{claim.role}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {claim.bills.length} bill{claim.bills.length === 1 ? "" : "s"}
                      </td>
                      <td className="px-5 py-4 text-slate-400">{claim.submittedOn}</td>
                      <td className="px-5 py-4 font-black text-emerald-300">{formatCurrency(claim.amount)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${STATUS_CLASS[claim.statusLabel] || STATUS_CLASS["Waiting Admin"]}`}>
                          {claim.statusLabel}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {claim.status === "ADMIN_APPROVED" ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedClaim(claim)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.05] px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/[0.09] hover:text-white"
                            >
                              <Eye size={13} />
                              Details
                            </button>
                            <button
                              type="button"
                              onClick={() => decide(claim.id, "APPROVED")}
                              className="rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/25"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => decide(claim.id, "REJECTED")}
                              className="rounded-lg bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/25"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedClaim(claim)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.05] px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/[0.09] hover:text-white"
                          >
                            <Eye size={13} />
                            Details
                          </button>
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

      <ReimbursementClaimOverlay
        claim={selectedClaim}
        open={Boolean(selectedClaim)}
        onClose={() => setSelectedClaim(null)}
        canDecide={selectedClaim?.status === "ADMIN_APPROVED"}
        approveLabel="Approve Claim"
        rejectLabel="Reject Claim"
        onApprove={() => selectedClaim && decide(selectedClaim.id, "APPROVED")}
        onReject={() => selectedClaim && decide(selectedClaim.id, "REJECTED")}
        tone="red"
      />
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, tone }) {
  const tones = {
    red: "border-red-400/20 bg-red-500/10 text-red-300",
    slate: "border-slate-500/20 bg-slate-500/10 text-slate-300",
    amber: "border-amber-400/20 bg-amber-500/10 text-amber-300",
    emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  };

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${tones[tone] || tones.red}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="mt-4 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function MiniStat({ label, value, accent = "slate" }) {
  const colors = {
    slate: "text-white",
    amber: "text-amber-300",
    emerald: "text-emerald-300",
  };

  return (
    <div className="rounded-xl border border-slate-700/50 bg-[#0b1220] px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-1 text-sm font-black ${colors[accent] || colors.slate}`}>{value}</p>
    </div>
  );
}
