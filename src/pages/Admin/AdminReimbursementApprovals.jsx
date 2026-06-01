import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Eye,
  FolderKanban,
  HandCoins,
  History,
  ReceiptText,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { mockDb } from "../../mock-db/index.js";
import { useHrStore } from "../../stores/hrStore.js";
import ReimbursementClaimOverlay from "../shared/ReimbursementClaimOverlay.jsx";
import SlidePanel from "../../components/common/SlidePanel";
import AuditTrail from "../../components/common/AuditTrail";
import { buildReimbursementAuditTrail } from "../../utils/auditTrailHelpers";

const ADMIN_EMPLOYEE_ID = "EMP-0007";

const STATUS_LABELS = {
  SUBMITTED: "Pending Admin Review",
  UNDER_REVIEW: "Pending Admin Review",
  ADMIN_APPROVED: "Pending Super Admin Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const STATUS_CLASS = {
  "Pending Admin Review": "border-amber-400/25 bg-amber-500/10 text-amber-300",
  "Pending Super Admin Review": "border-sky-400/25 bg-sky-500/10 text-sky-300",
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
    statusLabel: status,
    submittedOn: claim.submittedOn || claim.createdAt?.slice(0, 10) || "-",
  };
}

export default function AdminReimbursementApprovals() {
  const { reimbursements, fetchReimbursements, updateReimbursement } = useHrStore();
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [auditClaim, setAuditClaim] = useState(null);
  const admin = mockDb.employees.byId[ADMIN_EMPLOYEE_ID];
  const adminProjectIds = admin?.projectIds || [];

  useEffect(() => {
    fetchReimbursements({ filters: { projectId: adminProjectIds[0] } });
  }, [fetchReimbursements, adminProjectIds]);

  const claims = useMemo(
    () => reimbursements.filter((claim) => adminProjectIds.includes(claim.projectId)).map(normalizeClaim),
    [adminProjectIds, reimbursements]
  );

  const summary = useMemo(
    () => ({
      pending: claims.filter((claim) => claim.status === "SUBMITTED" || claim.status === "UNDER_REVIEW").length,
      forwarded: claims.filter((claim) => claim.status === "ADMIN_APPROVED").length,
      approved: claims.filter((claim) => claim.status === "APPROVED").length,
      rejected: claims.filter((claim) => claim.status === "REJECTED").length,
    }),
    [claims]
  );

  const decide = (id, status) => {
    const decidedOn = new Date().toISOString().split("T")[0];
    updateReimbursement(id, {
      status,
      adminApprovedBy: status === "ADMIN_APPROVED" ? ADMIN_EMPLOYEE_ID : undefined,
      adminApprovedOn: decidedOn,
    });
    setSelectedClaim(null);
  };

  return (
    <section className="min-h-screen bg-transparent p-4 text-white/90 md:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-300">
              Admin Approval Flow
            </p>
            <h1 className="text-3xl font-bold text-white">Reimbursement Approvals</h1>
            <p className="mt-1 max-w-2xl text-sm text-white/50">
              Review reimbursement claims only for your assigned project before sending them to Super Admin.
            </p>
          </div>
          <div className="rounded-2xl border border-violet-400/15 bg-violet-500/5 px-4 py-3">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-violet-200">
              <FolderKanban size={15} />
              Project Scope
            </p>
            <p className="mt-1 text-sm font-semibold text-white">{adminProjectIds.map(projectName).join(", ")}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Stat icon={Clock} label="Pending Admin" value={summary.pending} />
          <Stat icon={ShieldCheck} label="Sent to Super Admin" value={summary.forwarded} />
          <Stat icon={CheckCircle2} label="Approved" value={summary.approved} />
          <Stat icon={XCircle} label="Rejected" value={summary.rejected} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-xl shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wider text-white/45">
                <tr>
                  {["Claim", "Employee", "Project", "Bills", "Submitted", "Amount", "Status", "Action"].map((header) => (
                    <th key={header} className="px-5 py-3 text-left font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{claim.id}</p>
                      <p className="mt-1 flex items-center gap-2 text-xs text-white/45">
                        <ReceiptText size={13} className="text-violet-300" />
                        {claim.claimTitle || claim.category || "Reimbursement"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{claim.employee}</p>
                      <p className="text-xs text-white/45">{claim.role}</p>
                    </td>
                    <td className="px-5 py-4 text-white/70">{claim.project}</td>
                    <td className="px-5 py-4 text-white/60">
                      {claim.bills.length} bill{claim.bills.length === 1 ? "" : "s"}
                    </td>
                    <td className="px-5 py-4 text-white/60">{claim.submittedOn}</td>
                    <td className="px-5 py-4 font-semibold text-emerald-300">{formatCurrency(claim.amount)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_CLASS[claim.statusLabel] || STATUS_CLASS["Pending Admin Review"]}`}>
                        {claim.statusLabel}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {["SUBMITTED", "UNDER_REVIEW"].includes(claim.status) ? (
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
                            onClick={() => decide(claim.id, "ADMIN_APPROVED")}
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
                            onClick={() => setAuditClaim(claim)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-500/15 px-3 py-2 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/25"
                            title="Audit Trail"
                          >
                            <History size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ReimbursementClaimOverlay
        claim={selectedClaim}
        open={Boolean(selectedClaim)}
        onClose={() => setSelectedClaim(null)}
        canDecide={selectedClaim && ["SUBMITTED", "UNDER_REVIEW"].includes(selectedClaim.status)}
        approveLabel="Approve and Send to Super Admin"
        rejectLabel="Reject Claim"
        onApprove={() => selectedClaim && decide(selectedClaim.id, "ADMIN_APPROVED")}
        onReject={() => selectedClaim && decide(selectedClaim.id, "REJECTED")}
        tone="violet"
      />

      <SlidePanel
        open={Boolean(auditClaim)}
        onClose={() => setAuditClaim(null)}
        title="Reimbursement — Audit Trail"
        width="md"
      >
        {auditClaim && (
          <div className="space-y-5">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-white">{auditClaim.employee}</p>
              <p className="mt-1 text-xs text-white/45">{auditClaim.id} • {auditClaim.claimTitle || auditClaim.category || "Reimbursement"}</p>
            </div>
            <AuditTrail entries={buildReimbursementAuditTrail(auditClaim)} tone="violet" />
          </div>
        )}
      </SlidePanel>
    </section>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-violet-400/15 bg-violet-500/5 p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
        <Icon size={20} className="text-violet-300" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-white/45">{label}</p>
    </div>
  );
}
