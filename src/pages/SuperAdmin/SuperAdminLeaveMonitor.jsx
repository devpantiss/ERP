import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock, Users, XCircle } from "lucide-react";
import { readLeaveRequests, ROLE_LABEL, writeLeaveRequests } from "../shared/leaveWorkflow";

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

export default function SuperAdminLeaveMonitor() {
  const [requests, setRequests] = useState(() => readLeaveRequests());

  const summary = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((request) => request.status === "Pending Admin Review").length,
      finalPending: requests.filter((request) => request.status === "Pending Super Admin Review").length,
      approved: requests.filter((request) => request.status === "Approved").length,
      rejected: requests.filter((request) => request.status === "Rejected").length,
    }),
    [requests]
  );

  const decide = (id, status) => {
    const updated = requests.map((request) =>
      request.id === id
        ? {
            ...request,
            status,
            approver: "Super Admin",
            superAdminDecision:
              status === "Approved"
                ? "Final approval by Super Admin."
                : "Rejected by Super Admin at final approval.",
            decisionNote:
              status === "Approved"
                ? "Approved after Admin and Super Admin dual approval."
                : "Rejected at Super Admin final approval.",
          }
        : request
    );
    writeLeaveRequests(updated);
    setRequests(updated);
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
        <Stat icon={Users} label="Total Requests" value={summary.total} />
        <Stat icon={Clock} label="Pending Admin" value={summary.pending} />
        <Stat icon={CalendarDays} label="Pending Final" value={summary.finalPending} />
        <Stat icon={CheckCircle2} label="Approved" value={summary.approved} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                {["Request", "Role", "Employee", "Leave", "Dates", "Days", "Status", "Decision"].map((header) => (
                  <th key={header} className="px-5 py-3 text-left font-black">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-white/[0.03]">
                  <td className="px-5 py-4">
                    <p className="font-black text-white">{request.id}</p>
                    <p className="text-xs text-slate-500">Applied {formatDate(request.appliedOn)}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-300">{ROLE_LABEL[request.role]}</td>
                  <td className="px-5 py-4 text-slate-300">{request.employee}</td>
                  <td className="px-5 py-4 text-slate-300">{request.type}</td>
                  <td className="px-5 py-4 text-slate-400">
                    {formatDate(request.from)} - {formatDate(request.to)}
                  </td>
                  <td className="px-5 py-4 text-slate-300">{request.days}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="max-w-[280px] px-5 py-4 text-slate-500">
                    {request.status === "Pending Super Admin Review" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => decide(request.id, "Approved")}
                          className="rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/25"
                        >
                          Final Approve
                        </button>
                        <button
                          onClick={() => decide(request.id, "Rejected")}
                          className="rounded-lg bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/25"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      request.decisionNote || "Awaiting admin decision"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${config[status]}`}>
      {status}
    </span>
  );
}
