import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Send,
  X,
} from "lucide-react";
import {
  getLeaveBalances,
  getRoleFromPath,
  LEAVE_POLICIES,
  nextLeaveId,
  readLeaveRequests,
  ROLE_LABEL,
  writeLeaveRequests,
} from "./leaveWorkflow";

const ACCENT_MAP = {
  mobilizer: {
    text: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    btn: "bg-yellow-400 hover:bg-yellow-300 text-black",
    soft: "bg-yellow-400/5",
    bar: "bg-yellow-400",
  },
  trainer: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    btn: "bg-emerald-500 hover:bg-emerald-400 text-white",
    soft: "bg-emerald-400/5",
    bar: "bg-emerald-400",
  },
  "placement-officer": {
    text: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    btn: "bg-cyan-500 hover:bg-cyan-400 text-white",
    soft: "bg-cyan-400/5",
    bar: "bg-cyan-400",
  },
};

const LEAVE_TYPES = LEAVE_POLICIES.map((policy) => policy.type);

const diffDays = (from, to) => {
  if (!from || !to) return 0;
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;
  return Math.round((end - start) / 86400000) + 1;
};

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

export default function LeaveManagement() {
  const location = useLocation();
  const roleKey = getRoleFromPath(location.pathname);
  const a = ACCENT_MAP[roleKey] || ACCENT_MAP.mobilizer;

  const [leaves, setLeaves] = useState(() => readLeaveRequests());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: "Casual Leave",
    from: "",
    to: "",
    reason: "",
    contact: "",
  });

  const requestedDays = diffDays(form.from, form.to);
  const roleLeaves = useMemo(
    () => leaves.filter((leave) => leave.role === roleKey),
    [leaves, roleKey]
  );

  const leaveBalances = useMemo(
    () => getLeaveBalances(leaves, roleKey),
    [leaves, roleKey]
  );

  const stats = useMemo(
    () =>
      leaveBalances.reduce(
        (total, balance) => ({
          annual: total.annual + balance.quota,
          used: total.used + balance.used,
          pending: total.pending + balance.pending,
          available: total.available + balance.left,
        }),
        { annual: 0, used: 0, pending: 0, available: 0 }
      ),
    [leaveBalances]
  );

  const selectedLeaveBalance = leaveBalances.find((balance) => balance.type === form.type);
  const exceedsBalance = requestedDays > 0 && selectedLeaveBalance && requestedDays > selectedLeaveBalance.left;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!requestedDays || exceedsBalance) return;

    const newLeave = {
      id: nextLeaveId(leaves),
      role: roleKey,
      employee: `${ROLE_LABEL[roleKey] || "Employee"} User`,
      type: form.type,
      from: form.from,
      to: form.to,
      days: requestedDays,
      reason: form.reason,
      status: "Pending Admin Review",
      appliedOn: new Date().toISOString().split("T")[0],
      approver: "Admin Office",
      adminDecision: "",
      superAdminDecision: "",
      decisionNote: "",
      contact: form.contact,
    };

    const updatedLeaves = [newLeave, ...leaves];
    writeLeaveRequests(updatedLeaves);
    setLeaves(updatedLeaves);
    setForm({
      type: "Casual Leave",
      from: "",
      to: "",
      reason: "",
      contact: "",
    });
    setShowForm(false);
  };

  return (
    <section className="min-h-screen bg-transparent p-4 text-white/90 md:p-8">
      <style>{`
        @keyframes leavePanelIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={`mb-2 text-xs font-medium uppercase tracking-widest ${a.text}`}>
              HR Entitlement
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Leave Management
            </h1>
            <p className="mt-1 text-sm text-white/50">
              Apply for leave, track approvals, and monitor available balances.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition active:scale-95 ${a.btn}`}
          >
            <Plus size={16} />
            Apply Leave
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={CalendarDays} label="Total Yearly Leaves" value={`${stats.annual} days`} accent={a} />
          <StatCard icon={CheckCircle2} label="Used" value={`${stats.used} days`} accent={a} />
          <StatCard icon={Clock} label="Pending" value={`${stats.pending} days`} accent={a} />
          <StatCard icon={FileText} label="Leaves Left" value={`${stats.available} days`} accent={a} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {leaveBalances.map((balance) => (
            <LeaveBalanceCard key={balance.type} balance={balance} accent={a} />
          ))}
        </div>

        <div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-xl shadow-black/20">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-white">Leave Requests</h2>
                <p className="text-xs text-white/45">Recent applications and approval status</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wider text-white/45">
                  <tr>
                    {["Request", "Leave Type", "Dates", "Days", "Status", "Approver"].map((header) => (
                      <th key={header} className="px-5 py-3 text-left font-semibold">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {roleLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-white/[0.03]">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{leave.id}</p>
                        <p className="text-xs text-white/45">Applied {formatDate(leave.appliedOn)}</p>
                      </td>
                      <td className="px-5 py-4 text-white/75">{leave.type}</td>
                      <td className="px-5 py-4">
                        <p className="text-white/80">
                          {formatDate(leave.from)} - {formatDate(leave.to)}
                        </p>
                        <p className="max-w-[260px] truncate text-xs text-white/45">{leave.reason}</p>
                      </td>
                      <td className="px-5 py-4 text-white/80">{leave.days}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={leave.status} />
                      </td>
                      <td className="px-5 py-4 text-white/55">{leave.approver}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="flex h-full w-full max-w-3xl animate-[leavePanelIn_0.22s_ease-out] flex-col border-l border-white/10 bg-[#060b16] shadow-2xl shadow-black/50"
          >
            <div className="shrink-0 flex items-start justify-between gap-4 border-b border-white/10 bg-white/[0.02] px-6 py-5">
              <div>
                <p className={`mb-2 text-xs font-medium uppercase tracking-widest ${a.text}`}>
                  New Leave Request
                </p>
                <h2 className="text-2xl font-bold text-white">Apply for Leave</h2>
                <p className="mt-1 text-sm text-white/45">Request ID will be generated after submission.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="space-y-6 p-6">
                <FormSection title="Leave Details" subtitle="Select leave category and duration">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Leave Type">
                      <select
                        value={form.type}
                        onChange={(event) => setForm({ ...form, type: event.target.value })}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                      >
                        {LEAVE_TYPES.map((type) => (
                          <option key={type} value={type} className="bg-[#060b16]">
                            {type}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="From">
                      <input
                        required
                        type="date"
                        value={form.from}
                        onChange={(event) => setForm({ ...form, from: event.target.value })}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                      />
                    </Field>

                    <Field label="To">
                      <input
                        required
                        type="date"
                        value={form.to}
                        onChange={(event) => setForm({ ...form, to: event.target.value })}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                      />
                    </Field>
                  </div>
                </FormSection>

                <FormSection title="Reason">
                  <Field label="Description">
                    <textarea
                      required
                      rows={5}
                      value={form.reason}
                      onChange={(event) => setForm({ ...form, reason: event.target.value })}
                      placeholder="Explain why leave is required"
                      className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/30"
                    />
                  </Field>
                </FormSection>

                <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/60">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className={a.text} />
                    Requested duration
                  </div>
                  <p className="mt-2 text-2xl font-bold text-white">{requestedDays} days</p>
                  <p className="mt-1 text-xs text-white/45">
                    {form.type} left: {selectedLeaveBalance?.left || 0} days
                  </p>
                </div>

                {exceedsBalance && (
                  <div className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    Requested days exceed the available {form.type.toLowerCase()} balance.
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 flex flex-col-reverse gap-3 border-t border-white/10 bg-white/[0.02] px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-white/10 px-5 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!requestedDays || exceedsBalance}
                className={`flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${a.btn}`}
              >
                <Send size={16} />
                Submit for Dual Approval
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/45">
        {label}
      </span>
      {children}
    </label>
  );
}

function FormSection({ title, subtitle, children }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.015] p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-white/40">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 shadow-lg shadow-black/20">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl border ${accent.border} ${accent.bg}`}>
        <Icon size={20} className={accent.text} />
      </div>
      <p className="text-xs uppercase tracking-wider text-white/40">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function LeaveBalanceCard({ balance, accent }) {
  const usedPercent = Math.min(((balance.used + balance.pending) / balance.quota) * 100, 100);

  return (
    <div className={`rounded-2xl border ${accent.border} bg-white/[0.02] p-5 shadow-lg shadow-black/20`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-white">{balance.type}</p>
          <p className="mt-1 text-xs text-white/45">Yearly quota: {balance.quota} days</p>
        </div>
        <div className={`rounded-xl border ${accent.border} ${accent.bg} px-3 py-2 text-right`}>
          <p className={`text-2xl font-bold ${accent.text}`}>{balance.left}</p>
          <p className="text-[10px] uppercase tracking-wider text-white/45">left</p>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${accent.bar}`}
          style={{ width: `${usedPercent}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
        <div className="rounded-lg bg-black/20 px-2 py-2">
          <p className="font-semibold text-white">{balance.quota}</p>
          <p className="mt-1 text-white/40">Total</p>
        </div>
        <div className="rounded-lg bg-black/20 px-2 py-2">
          <p className="font-semibold text-white">{balance.used}</p>
          <p className="mt-1 text-white/40">Used</p>
        </div>
        <div className="rounded-lg bg-black/20 px-2 py-2">
          <p className="font-semibold text-white">{balance.pending}</p>
          <p className="mt-1 text-white/40">Pending</p>
        </div>
      </div>
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
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${config[status] || config["Pending Admin Review"]}`}>
      {status}
    </span>
  );
}
