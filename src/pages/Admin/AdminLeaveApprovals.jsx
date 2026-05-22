import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock, XCircle } from "lucide-react";
import {
  readLeaveRequests,
  ROLE_LABEL,
  writeLeaveRequests,
} from "../shared/leaveWorkflow";

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

export default function AdminLeaveApprovals() {
  const [requests, setRequests] = useState(() => readLeaveRequests());
  const [rejectDraft, setRejectDraft] = useState(null);

  const summary = useMemo(
    () => ({
      pending: requests.filter((request) => request.status === "Pending Admin Review").length,
      forwarded: requests.filter((request) => request.status === "Pending Super Admin Review").length,
      rejected: requests.filter((request) => request.status === "Rejected").length,
    }),
    [requests]
  );

  const decide = (id, status, rejectionReason = "") => {
    const updated = requests.map((request) =>
      request.id === id
        ? {
            ...request,
            status,
            approver: "Admin Office",
            adminDecision:
              status === "Pending Super Admin Review"
                ? "Approved by Admin and forwarded for Super Admin final approval."
                : `Rejected by Admin: ${rejectionReason}`,
            adminRejectionReason: status === "Rejected" ? rejectionReason : "",
            decisionNote:
              status === "Pending Super Admin Review"
                ? "Waiting for Super Admin final approval."
                : `Admin rejection reason: ${rejectionReason}`,
          }
        : request
    );
    writeLeaveRequests(updated);
    setRequests(updated);
  };

  const submitRejection = (event) => {
    event.preventDefault();
    const reason = rejectDraft?.reason.trim();
    if (!rejectDraft || !reason) return;

    decide(rejectDraft.id, "Rejected", reason);
    setRejectDraft(null);
  };

  return (
    <section className="min-h-screen bg-transparent p-4 text-white/90 md:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-300">
            Admin Approval Flow
          </p>
          <h1 className="text-3xl font-bold text-white">Leave Approvals</h1>
          <p className="mt-1 text-sm text-white/50">
            First-level approval for leave requests before Super Admin final approval.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Stat icon={Clock} label="Pending Review" value={summary.pending} />
          <Stat icon={CheckCircle2} label="Forwarded" value={summary.forwarded} />
          <Stat icon={XCircle} label="Rejected" value={summary.rejected} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-xl shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wider text-white/45">
                <tr>
                          {["Request", "Employee", "Leave Type", "Dates", "Days", "Coverage", "Status", "Action"].map((header) => (
                    <th key={header} className="px-5 py-3 text-left font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{request.id}</p>
                      <p className="text-xs text-white/45">Applied {formatDate(request.appliedOn)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{request.employee}</p>
                      <p className="text-xs text-white/45">{ROLE_LABEL[request.role]}</p>
                    </td>
                    <td className="px-5 py-4 text-white/75">{request.type}</td>
                    <td className="px-5 py-4 text-white/75">
                      {formatDate(request.from)} - {formatDate(request.to)}
                    </td>
                    <td className="px-5 py-4 text-white/75">{request.days}</td>
                    <td className="max-w-[240px] px-5 py-4 text-white/55">
                      <p>{request.reason}</p>
                      <p className="mt-1 text-xs text-white/35">
                        Backup: {request.backupOwner || "Not assigned"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-5 py-4">
                      {request.status === "Pending Admin Review" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => decide(request.id, "Pending Super Admin Review")}
                            className="rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/25"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectDraft({ id: request.id, reason: "" })}
                            className="rounded-lg bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/25"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-white/35">Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {rejectDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={submitRejection}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b1220] p-5 shadow-2xl shadow-black/40"
          >
            <h2 className="text-lg font-bold text-white">Reject Leave Request</h2>
            <p className="mt-1 text-sm text-white/45">
              Add the reason for rejection. This will be visible in the decision note.
            </p>

            <textarea
              required
              autoFocus
              rows={5}
              value={rejectDraft.reason}
              onChange={(event) => setRejectDraft({ ...rejectDraft, reason: event.target.value })}
              placeholder="Enter rejection reason"
              className="mt-5 w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-red-400/50"
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectDraft(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/65 transition hover:bg-white/5 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-red-500/15 px-4 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/25"
              >
                Reject Request
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-violet-400/15 bg-violet-500/5 p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
        <Icon size={20} className="text-violet-300" />
      </div>
      <p className="text-xs uppercase tracking-wider text-white/40">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    Approved: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
    "Pending Admin Review": "border-amber-400/20 bg-amber-500/10 text-amber-300",
    "Pending Super Admin Review": "border-cyan-400/20 bg-cyan-500/10 text-cyan-300",
    Rejected: "border-red-400/20 bg-red-500/10 text-red-300",
  };

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${config[status]}`}>
      {status}
    </span>
  );
}
