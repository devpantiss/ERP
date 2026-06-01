import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Users, XCircle } from "lucide-react";
import { readLeaveRequests, ROLE_LABEL, writeLeaveRequests } from "../shared/leaveWorkflow";

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

export default function SuperAdminLeaveMonitor() {
  const [requests, setRequests] = useState(() => readLeaveRequests());
  const [rejectDraft, setRejectDraft] = useState(null);
  const adminClearedRequests = useMemo(
    () => requests.filter((request) => (
      request.status === "Pending Super Admin Review" ||
      request.status === "Approved" ||
      (request.status === "Rejected" && Boolean(request.superAdminDecision || request.superAdminRejectionReason))
    )),
    [requests]
  );

  const summary = useMemo(
    () => ({
      total: adminClearedRequests.length,
      finalPending: adminClearedRequests.filter((request) => request.status === "Pending Super Admin Review").length,
      approved: adminClearedRequests.filter((request) => request.status === "Approved").length,
      rejected: adminClearedRequests.filter((request) => request.status === "Rejected").length,
    }),
    [adminClearedRequests]
  );

  const decide = (id, status, rejectionReason = "") => {
    const updated = requests.map((request) =>
      request.id === id
        ? {
            ...request,
            status,
            approver: "Super Admin",
            superAdminDecision:
              status === "Approved"
                ? "Final approval by Super Admin."
                : `Rejected by Super Admin: ${rejectionReason}`,
            superAdminRejectionReason: status === "Rejected" ? rejectionReason : "",
            decisionNote:
              status === "Approved"
                ? "Approved after Admin and Super Admin dual approval."
                : `Super Admin rejection reason: ${rejectionReason}`,
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
    <section className="space-y-7 text-white">
      <div>
        <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-red-500">
          Super Admin Oversight
        </p>
        <h1 className="text-3xl font-black tracking-tight">Leave Monitor</h1>
        <p className="mt-1 text-sm text-slate-400">
          Final approval layer after Admin review across mobilizer, trainer, and placement teams.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Users} label="Admin Cleared" value={summary.total} />
        <Stat icon={CalendarDays} label="Pending Final" value={summary.finalPending} />
        <Stat icon={CheckCircle2} label="Approved" value={summary.approved} />
        <Stat icon={XCircle} label="Rejected" value={summary.rejected} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220]/80 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-2 border-b border-white/10 bg-white/[0.025] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-black text-white">Leave Request Queue</h2>
            <p className="mt-1 text-sm text-slate-500">
              Review Admin-cleared leave requests and track final decisions.
            </p>
          </div>
          <span className="inline-flex w-fit rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-red-300">
            {adminClearedRequests.length} records
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-sm">
            <thead className="border-b border-white/10 bg-[#07111f] text-[11px] uppercase tracking-[0.16em] text-slate-500">
              <tr>
                {["Request Details", "Employee", "Leave Window", "Duration", "Current Status", "Decision"].map((header) => (
                  <th key={header} className="px-6 py-4 text-left font-black">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.07]">
              {adminClearedRequests.map((request) => (
                <tr key={request.id} className="align-top transition hover:bg-white/[0.025]">
                  <td className="px-6 py-5">
                    <div className="min-w-[190px]">
                      <p className="font-mono text-xs font-black uppercase tracking-[0.1em] text-red-300">{request.id}</p>
                      <p className="mt-2 text-xs font-semibold text-slate-500">Applied {formatDate(request.appliedOn)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="min-w-[220px]">
                      <p className="text-sm font-black text-white">{request.employee}</p>
                      <p className="mt-2 inline-flex rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-slate-300">
                        {ROLE_LABEL[request.role]}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="min-w-[260px] rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3">
                      <p className="text-sm font-bold text-white">{request.type}</p>
                      <p className="mt-2 text-xs font-medium text-slate-400">
                        {formatDate(request.from)} to {formatDate(request.to)}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex min-w-[76px] justify-center rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-sm font-black text-white">
                      {request.days} {request.days === 1 ? "day" : "days"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="min-w-[190px]">
                      <StatusBadge status={request.status} />
                    </div>
                  </td>
                  <td className="px-6 py-5 text-slate-500">
                    {request.status === "Pending Super Admin Review" ? (
                      <div className="flex min-w-[260px] gap-3">
                        <button
                          onClick={() => decide(request.id, "Approved")}
                          className="inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-500/15 px-4 py-2.5 text-xs font-black text-emerald-300 transition hover:bg-emerald-500/25"
                        >
                          Final Approve
                        </button>
                        <button
                          onClick={() => setRejectDraft({ id: request.id, reason: "" })}
                          className="inline-flex flex-1 items-center justify-center rounded-xl bg-red-500/15 px-4 py-2.5 text-xs font-black text-red-300 transition hover:bg-red-500/25"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <p className="max-w-[360px] text-sm leading-6 text-slate-400">
                        {request.decisionNote || "Awaiting admin decision"}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {rejectDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={submitRejection}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b1220] p-5 shadow-2xl shadow-black/40"
          >
            <h2 className="text-lg font-black text-white">Reject Leave Request</h2>
            <p className="mt-1 text-sm text-slate-500">
              Add the final rejection reason. This will be saved with the Super Admin decision.
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
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-red-500/15 px-4 py-2 text-sm font-black text-red-300 transition hover:bg-red-500/25"
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
    <div className="rounded-2xl border border-red-500/15 bg-red-500/5 p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
        <Icon size={20} className="text-red-500" />
      </div>
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
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
    <span className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${config[status]}`}>
      {status}
    </span>
  );
}
