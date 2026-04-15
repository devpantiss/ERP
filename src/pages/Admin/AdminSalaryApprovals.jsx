import { useMemo, useState } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarRange,
  CircleDollarSign,
  Clock3,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { SALARY_APPROVALS } from "./adminPortalData";

const statusStyles = {
  Pending: "bg-amber-500/10 text-amber-300 border-amber-400/20",
  Approved: "bg-emerald-500/10 text-emerald-300 border-emerald-400/20",
};

const roleStyles = {
  Trainer: "bg-violet-500/10 text-violet-200 border-violet-400/20",
  "Placement Officer": "bg-sky-500/10 text-sky-200 border-sky-400/20",
  Mobilizer: "bg-amber-500/10 text-amber-200 border-amber-400/20",
};

export default function AdminSalaryApprovals() {
  const [approvals, setApprovals] = useState(SALARY_APPROVALS);
  const [selectedMonth, setSelectedMonth] = useState("March 2026");
  const [search, setSearch] = useState("");

  const monthOptions = [...new Set(SALARY_APPROVALS.map((item) => item.month))];

  const filteredApprovals = useMemo(() => {
    return approvals.filter((item) => {
      const matchesMonth = selectedMonth === "All Months" || item.month === selectedMonth;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        item.employee.toLowerCase().includes(query) ||
        item.center.toLowerCase().includes(query) ||
        item.role.toLowerCase().includes(query);
      return matchesMonth && matchesSearch;
    });
  }, [approvals, search, selectedMonth]);

  const metrics = useMemo(() => {
    const totalPayroll = filteredApprovals.reduce((sum, item) => sum + item.amount, 0);
    const pendingCount = filteredApprovals.filter((item) => item.status === "Pending").length;
    const approvedCount = filteredApprovals.filter((item) => item.status === "Approved").length;
    const totalTarget = filteredApprovals.reduce((sum, item) => sum + item.target, 0);
    const totalAchievement = filteredApprovals.reduce((sum, item) => sum + item.achievement, 0);
    const avgAchievement = totalTarget ? Math.round((totalAchievement / totalTarget) * 100) : 0;

    return { totalPayroll, pendingCount, approvedCount, totalTarget, totalAchievement, avgAchievement };
  }, [filteredApprovals]);

  const markApproved = (id) => {
    setApprovals((current) =>
      current.map((item) => (item.id === id ? { ...item, status: "Approved" } : item))
    );
  };

  const cards = [
    {
      label: "Payroll Window",
      value: `₹${metrics.totalPayroll.toLocaleString("en-IN")}`,
      helper: `${filteredApprovals.length} salary requests`,
      icon: Wallet,
      accent: "from-violet-500/20 to-fuchsia-500/10",
    },
    {
      label: "Pending Approvals",
      value: metrics.pendingCount,
      helper: "awaiting release decision",
      icon: Clock3,
      accent: "from-amber-500/20 to-orange-500/10",
    },
    {
      label: "Approved Releases",
      value: metrics.approvedCount,
      helper: "ready for payroll run",
      icon: BadgeCheck,
      accent: "from-emerald-500/20 to-teal-500/10",
    },
    {
      label: "Achievement Rate",
      value: `${metrics.avgAchievement}%`,
      helper: `${metrics.totalAchievement}/${metrics.totalTarget} achieved`,
      icon: TrendingUp,
      accent: "from-sky-500/20 to-cyan-500/10",
    },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_26%)]" />

      <div className="relative z-10 space-y-6">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(17,24,39,0.86))] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-end lg:justify-between lg:p-8">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-200">
                <Sparkles size={13} />
                Payroll Intelligence
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Salary Approval Control Tower
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
                Review month-wise salary releases with performance context, operational targets, and achievement confidence before approving payouts.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <CalendarRange size={16} className="text-violet-300" />
                <select
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none"
                >
                  <option value="All Months" className="bg-slate-900">
                    All Months
                  </option>
                  {monthOptions.map((month) => (
                    <option key={month} value={month} className="bg-slate-900">
                      {month}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <Search size={16} className="text-violet-300" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search employee, role, center"
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/35 outline-none"
                />
              </label>
            </div>
          </div>

          <div className="grid gap-4 border-t border-white/10 p-6 md:grid-cols-2 xl:grid-cols-4 lg:p-8">
            {cards.map((card) => (
              <div
                key={card.label}
                className={`rounded-3xl border border-white/10 bg-gradient-to-br ${card.accent} p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
                    {card.label}
                  </span>
                  <div className="rounded-2xl border border-white/10 bg-black/10 p-2.5">
                    <card.icon size={16} className="text-white/80" />
                  </div>
                </div>
                <p className="mt-5 text-3xl font-semibold text-white">{card.value}</p>
                <p className="mt-2 text-xs text-white/55">{card.helper}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-white/10 bg-[rgba(15,23,42,0.82)] p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-white/70">
              <Target size={18} className="text-violet-300" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em]">Release Readiness</h2>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-white/55">Overall Target Achievement</span>
                  <span className="font-semibold text-white">{metrics.avgAchievement}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-400 via-sky-400 to-emerald-400"
                    style={{ width: `${Math.min(metrics.avgAchievement, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InsightCard
                  icon={CircleDollarSign}
                  title="Monthly Payout Focus"
                  value={`₹${metrics.totalPayroll.toLocaleString("en-IN")}`}
                  tone="text-emerald-300"
                />
                <InsightCard
                  icon={BriefcaseBusiness}
                  title="Target Delivery"
                  value={`${metrics.totalAchievement}/${metrics.totalTarget}`}
                  tone="text-sky-300"
                />
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                  Approval Logic
                </p>
                <div className="mt-4 space-y-3 text-sm text-white/70">
                  <p>Attendance, monthly target achievement, and payroll amount are visible together for faster release decisions.</p>
                  <p>High-performance employees with strong target closure surface immediately in the table below.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[rgba(15,23,42,0.82)] p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-white/70">
              <TrendingUp size={18} className="text-violet-300" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em]">Salary Release Queue</h2>
            </div>

            <div className="mt-5 space-y-4">
              {filteredApprovals.slice(0, 3).map((item) => {
                const achievementRate = Math.round((item.achievement / item.target) * 100);
                return (
                  <div key={item.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">{item.employee}</p>
                        <p className="mt-1 text-xs text-white/45">
                          {item.role} • {item.center} • {item.month}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs ${
                          statusStyles[item.status] || "bg-slate-700/50 text-white/70 border-slate-600"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-xs text-white/55">
                        <span>Target vs Achievement</span>
                        <span>{achievementRate}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-violet-400"
                          style={{ width: `${Math.min(achievementRate, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[rgba(15,23,42,0.82)] shadow-[0_20px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Salary Release Table</h2>
              <p className="mt-1 text-sm text-white/45">
                Month-wise payroll review with target and achievement visibility.
              </p>
            </div>
            <div className="rounded-full bg-white/[0.05] px-3 py-1.5 text-xs text-white/55">
              {filteredApprovals.length} records
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1280px] text-sm">
              <thead className="bg-white/[0.02] text-white/45">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em]">Approval ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em]">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em]">Center</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em]">Month</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em]">Attendance</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em]">Target</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em]">Achievement</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em]">Target vs Achievement</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em]">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em]">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {filteredApprovals.map((item) => {
                  const achievementRate = Math.round((item.achievement / item.target) * 100);
                  return (
                    <tr key={item.id} className="transition hover:bg-white/[0.03]">
                      <td className="px-6 py-5 font-medium text-white/85">{item.id}</td>
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-medium text-white">{item.employee}</p>
                          <span
                            className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs ${
                              roleStyles[item.role] || "border-slate-600 bg-slate-700/50 text-white/70"
                            }`}
                          >
                            {item.role}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-white/70">{item.center}</td>
                      <td className="px-6 py-5 text-white/70">{item.month}</td>
                      <td className="px-6 py-5 text-white/70">{item.attendance}%</td>
                      <td className="px-6 py-5 text-white/70">{item.target}</td>
                      <td className="px-6 py-5 text-white/70">{item.achievement}</td>
                      <td className="px-6 py-5">
                        <div className="min-w-[180px]">
                          <div className="mb-2 flex items-center justify-between text-xs">
                            <span className="text-white/45">
                              {item.achievement}/{item.target}
                            </span>
                            <span className="font-semibold text-white">{achievementRate}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className={`h-full rounded-full ${
                                achievementRate >= 90
                                  ? "bg-emerald-400"
                                  : achievementRate >= 75
                                  ? "bg-sky-400"
                                  : "bg-amber-400"
                              }`}
                              style={{ width: `${Math.min(achievementRate, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-semibold text-emerald-300">
                        ₹{item.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs ${
                            statusStyles[item.status] || "bg-slate-700/50 text-white/70 border-slate-600"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {item.status === "Pending" ? (
                          <button
                            onClick={() => markApproved(item.id)}
                            className="rounded-2xl bg-gradient-to-r from-violet-500 to-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_24px_rgba(99,102,241,0.35)] transition hover:scale-[1.02]"
                          >
                            Approve Salary
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-emerald-300">Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function InsightCard({ icon: Icon, title, value, tone }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">{title}</span>
        <Icon size={16} className="text-white/55" />
      </div>
      <p className={`mt-4 text-2xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
