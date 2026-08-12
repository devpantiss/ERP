import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Award,
  CalendarDays,
  Clock3,
  IndianRupee,
  MapPinned,
  Medal,
  ShieldCheck,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  buildClientProjectSnapshot,
  getClientDeliveryMetrics,
  getClientPlacementGeography,
  getClientProjects,
  getProjectSummary,
  getStoredClient,
} from "./clientPortalData";

const DELIVERY_ICON = {
  certified: Award,
  enrolled: UserCheck,
  placed: Medal,
  retention: ShieldCheck,
};

const DELIVERY_COLORS = {
  enrolled: "#5eead4",
  certified: "#86efac",
  placed: "#93c5fd",
  retention: "#d6b56d",
};

const PLACEMENT_COLORS = {
  district: ["#5eead4", "#d6b56d"],
  location: {
    "Odisha district": "#5eead4",
    "Outside Odisha": "#93c5fd",
  },
  local: ["#5eead4", "#93c5fd"],
};

const formatNumber = (value) => new Intl.NumberFormat("en-IN").format(value || 0);

export default function ClientDashboard() {
  const client = getStoredClient();
  const projects = getClientProjects(client.name);
  const deliveryMetrics = getClientDeliveryMetrics(projects);
  const placementGeography = getClientPlacementGeography(projects);

  return (
    <section className="space-y-6">
      <Header
        eyebrow="Client Dashboard"
        title={`${client.name} project tracking`}
        description="A focused view of project delivery, center performance, enrollment, attendance, placement, and open delivery risks."
      />

      <AgendaSection projects={projects} />

      <DashboardRoiSection projects={projects} />

      <section className="overflow-hidden rounded-3xl border border-violet-200/10 bg-[#12071f]/80 shadow-xl shadow-black/20">
        <div className="border-b border-white/10 p-5 md:flex md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Delivery Command Center</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Targets and outcomes</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">
              Enrollment, certification, placement, and 3-month retention progress across active projects.
            </p>
          </div>
          <div className="mt-4 rounded-2xl border border-violet-300/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-100 md:mt-0">
            Overall achievement <span className="ml-2 text-lg font-semibold text-white">{deliveryMetrics.percentage}%</span>
          </div>
        </div>

        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-4 p-5 md:grid-cols-2 2xl:grid-cols-3">
            {deliveryMetrics.metrics.map((metric) => (
              <TargetMetricCard key={metric.id} metric={metric} />
            ))}
          </div>

          <aside className="border-t border-white/10 p-5 xl:border-l xl:border-t-0">
            <TargetDonut metrics={deliveryMetrics.metrics} percentage={deliveryMetrics.percentage} />
          </aside>
        </div>
      </section>

      <PlacementGeographySection geography={placementGeography} />

      <section className="rounded-3xl border border-violet-200/10 bg-[#12071f]/80 p-5 shadow-xl shadow-black/20">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Tracked Projects</h2>
            <p className="text-sm text-white/45">Projects attached to this client account.</p>
          </div>
          <Link
            to="/client/projects"
            className="inline-flex items-center gap-2 rounded-2xl border border-violet-300/20 px-4 py-2 text-sm text-violet-200 hover:bg-violet-500/10"
          >
            View all
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="space-y-3">
          {projects.map((project) => (
            <ProjectRow key={project.id} project={project} />
          ))}
        </div>
      </section>
    </section>
  );
}

function DashboardRoiSection({ projects }) {
  const metrics = projects.reduce(
    (totals, project) => {
      const snapshot = buildClientProjectSnapshot(project);
      const placedCandidates = snapshot.centers.flatMap((center) =>
        center.batches.flatMap((batch) =>
          (batch.candidateRecords || []).filter((candidate) => candidate.placementStatus === "Placed")
        )
      );

      totals.learners += snapshot.summary.candidates;
      totals.placed += placedCandidates.length;
      totals.annualIncome += placedCandidates.reduce(
        (sum, candidate) => sum + (candidate.salary || 0) * 12,
        0
      );
      return totals;
    },
    { annualIncome: 0, learners: 0, placed: 0 }
  );
  const investment = metrics.learners * 26000;
  const netReturn = metrics.annualIncome - investment;
  const roi = investment ? Math.round((netReturn / investment) * 100) : 0;
  const returnMultiple = investment ? metrics.annualIncome / investment : 0;
  const costPerPlacement = metrics.placed ? Math.round(investment / metrics.placed) : 0;
  const positiveReturn = netReturn >= 0;
  const recovery = Math.min(100, Math.max(0, Math.round(returnMultiple * 100)));

  return (
    <section className="overflow-hidden rounded-3xl border border-emerald-300/15 bg-[#0b1516]/90 shadow-xl shadow-black/20">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="p-5 md:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-500/10 text-emerald-300">
              <IndianRupee size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Return on Investment</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Portfolio economic impact</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">
                Annualized income generated through placements compared with the estimated investment across all client projects.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardRoiMetric label="Estimated investment" value={`₹${formatNumber(investment)}`} />
            <DashboardRoiMetric label="Annual income generated" value={`₹${formatNumber(metrics.annualIncome)}`} tone="positive" />
            <DashboardRoiMetric
              label="Net economic return"
              value={`${positiveReturn ? "" : "−"}₹${formatNumber(Math.abs(netReturn))}`}
              tone={positiveReturn ? "positive" : "warning"}
            />
            <DashboardRoiMetric label="Cost per placement" value={metrics.placed ? `₹${formatNumber(costPerPlacement)}` : "—"} />
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-white/45">Investment recovery through annual income</span>
              <span className="font-semibold text-white">{returnMultiple.toFixed(2)}×</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${recovery}%` }}
              />
            </div>
            <p className="mt-3 text-xs leading-5 text-white/35">
              Indicative estimate using a ₹26,000 investment baseline per learner and recorded placement salaries annualized for 12 months.
            </p>
          </div>
        </div>

        <aside className="flex flex-col justify-center border-t border-white/10 bg-black/15 p-6 lg:border-l lg:border-t-0">
          <p className="text-sm font-medium text-white/45">Estimated portfolio ROI</p>
          <p className={`mt-2 text-5xl font-semibold tracking-tight ${positiveReturn ? "text-emerald-300" : "text-amber-300"}`}>
            {roi > 0 ? "+" : ""}{roi}%
          </p>
          <div className="mt-5 space-y-3 border-t border-white/10 pt-5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-white/40">Learners</span>
              <span className="font-semibold text-white">{formatNumber(metrics.learners)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-white/40">Placed learners</span>
              <span className="font-semibold text-white">{formatNumber(metrics.placed)}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function DashboardRoiMetric({ label, tone = "default", value }) {
  const valueColor = tone === "positive" ? "text-emerald-300" : tone === "warning" ? "text-amber-300" : "text-white";

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-medium text-white/40">{label}</p>
      <p className={`mt-2 text-xl font-semibold ${valueColor}`}>{value}</p>
    </div>
  );
}

function AgendaSection({ projects }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const addDays = (days) => {
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return date;
  };
  const agendaItems = projects
    .flatMap((project, projectIndex) => {
      const summary = getProjectSummary(project);
      const projectEndDate = project.endDate ? new Date(`${project.endDate}T00:00:00`) : null;
      const endDate = projectEndDate && projectEndDate >= today ? projectEndDate : addDays(14 + projectIndex);

      return [
        {
          id: `${project.id}-delivery-review`,
          date: addDays(projectIndex + 1),
          eyebrow: "Delivery review",
          title: `${project.name} performance check-in`,
          detail: `${formatNumber(summary.candidates)} learners · ${summary.attendanceRate}% attendance`,
          icon: TrendingUp,
          tone: "violet",
          projectId: project.id,
        },
        {
          id: `${project.id}-placement-review`,
          date: addDays(projectIndex + 3),
          eyebrow: "Outcome review",
          title: "Placement and retention checkpoint",
          detail: `${summary.placementRate}% placement · ${formatNumber(summary.grievances)} open issues`,
          icon: UserCheck,
          tone: "teal",
          projectId: project.id,
        },
        {
          id: `${project.id}-milestone`,
          date: endDate,
          eyebrow: "Project milestone",
          title: `${project.name} delivery window closes`,
          detail: `${formatNumber(summary.centers)} centers · ${project.status}`,
          icon: CalendarDays,
          tone: "amber",
          projectId: project.id,
        },
      ];
    })
    .sort((a, b) => a.date - b.date)
    .slice(0, 6);

  const dateLabel = (date) => {
    const dayDifference = Math.round((date - today) / 86400000);
    if (dayDifference === 0) return "Today";
    if (dayDifference === 1) return "Tomorrow";
    return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(date);
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-violet-200/10 bg-[#12071f]/80 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Agenda</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Upcoming reviews and milestones</h2>
          <p className="mt-2 text-sm leading-6 text-white/45">
            The next delivery, outcome, and project timeline checkpoints across your portfolio.
          </p>
        </div>
        <Link
          to="/client/projects"
          className="inline-flex w-fit items-center gap-2 rounded-2xl border border-violet-300/20 px-4 py-2 text-sm font-medium text-violet-200 transition hover:bg-violet-500/10"
        >
          Open projects
          <ArrowUpRight size={16} />
        </Link>
      </div>

      {agendaItems.length ? (
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          {agendaItems.map((item) => (
            <AgendaCard key={item.id} item={item} dateLabel={dateLabel(item.date)} />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center">
          <CalendarDays className="mx-auto text-white/20" size={30} />
          <p className="mt-3 font-medium text-white/60">No agenda items yet</p>
          <p className="mt-1 text-sm text-white/35">Project reviews and milestones will appear here.</p>
        </div>
      )}
    </section>
  );
}

function AgendaCard({ dateLabel, item }) {
  const Icon = item.icon;
  const tones = {
    amber: "border-amber-300/15 bg-amber-500/[0.06] text-amber-300",
    teal: "border-teal-300/15 bg-teal-500/[0.06] text-teal-300",
    violet: "border-violet-300/15 bg-violet-500/[0.08] text-violet-300",
  };

  return (
    <Link
      to={`/client/projects/${item.projectId}`}
      className="group rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:-translate-y-0.5 hover:border-violet-300/30 hover:bg-violet-500/[0.08]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${tones[item.tone]}`}>
          <Icon size={19} />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-white/55">
          <Clock3 size={12} />
          {dateLabel}
        </span>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-white/35">{item.eyebrow}</p>
      <h3 className="mt-2 line-clamp-2 font-semibold leading-6 text-white transition group-hover:text-violet-100">{item.title}</h3>
      <p className="mt-2 text-sm text-white/40">{item.detail}</p>
    </Link>
  );
}

function PlacementGeographySection({ geography }) {
  const summary = [
    { label: "Total placed", value: geography.totals.total },
    { label: "Local Odisha", value: geography.totals.local },
    { label: "Outside Odisha", value: geography.totals.outsideState },
    { label: "Same district", value: geography.totals.sameDistrict },
    { label: "Different district", value: geography.totals.differentDistrict },
  ];

  return (
    <section className="overflow-hidden rounded-3xl border border-violet-200/10 bg-[#12071f]/80 shadow-xl shadow-black/20">
      <div className="border-b border-white/10 p-5 md:flex md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Placement Geography</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Where students are placed</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">
            Placement distribution across local Odisha roles, out-of-state placements, district movement, and location-wise outcomes.
          </p>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100 md:mt-0">
          <MapPinned size={18} />
          {formatNumber(geography.totals.total)} verified placements
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-5">
        {summary.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/35">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(item.value)}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 px-5 pb-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1.25fr)]">
        <PlacementPieCard
          title="Local vs Outside Odisha"
          description="How many placed students stayed within Odisha compared with out-of-state placements."
          data={geography.localSplit}
          colors={PLACEMENT_COLORS.local}
        />
        <PlacementPieCard
          title="District Movement"
          description="Within Odisha, comparison of same-district and different-district placements."
          data={geography.districtSplit}
          colors={PLACEMENT_COLORS.district}
        />
        <PlacementBarCard data={geography.locationBars} />
      </div>
    </section>
  );
}

function PlacementPieCard({ title, description, data, colors }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <article className="rounded-3xl border border-white/10 bg-black/20 p-4">
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm leading-5 text-white/40">{description}</p>
      </div>

      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={58}
              nameKey="name"
              outerRadius={86}
              paddingAngle={4}
              stroke="rgba(18,7,31,0.8)"
              strokeWidth={3}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<PlacementTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = total ? Math.round((item.value / total) * 100) : 0;

          return (
            <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-white/55">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="truncate">{item.name}</span>
              </span>
              <span className="font-semibold text-white">
                {formatNumber(item.value)}
                <span className="ml-2 text-white/35">{percentage}%</span>
              </span>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function PlacementBarCard({ data }) {
  const [activeType, setActiveType] = useState("Odisha district");
  const activeData = data.filter((item) => item.type === activeType);
  const activeColor = PLACEMENT_COLORS.location[activeType] || PLACEMENT_COLORS.location["Odisha district"];
  const activeTotal = activeData.reduce((sum, item) => sum + item.count, 0);
  const toggleOptions = [
    { label: "Odisha District", value: "Odisha district" },
    { label: "Outside Odisha", value: "Outside Odisha" },
  ];

  return (
    <article className="rounded-3xl border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Location-wise Placements</h3>
          <p className="mt-1 text-sm leading-5 text-white/40">
            Toggle between Odisha district-wise placements and outside-Odisha state-wise placements.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-1">
          {toggleOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setActiveType(option.value)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                activeType === option.value ? "bg-white text-[#12071f]" : "text-white/45 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs text-white/45">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: activeColor }} />
        {formatNumber(activeTotal)} placements
      </div>

      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={activeData} margin={{ bottom: 52, left: -18, right: 8, top: 8 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis
              dataKey="location"
              angle={-28}
              height={64}
              interval={0}
              textAnchor="end"
              tick={{ fill: "rgba(255,255,255,0.52)", fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              tick={{ fill: "rgba(255,255,255,0.52)", fontSize: 11 }}
              tickLine={false}
            />
            <Tooltip content={<PlacementTooltip />} cursor={{ fill: "rgba(94,234,212,0.08)" }} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {activeData.map((entry) => (
                <Cell key={entry.location} fill={activeColor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

function PlacementTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const label = data.name || data.location;
  const count = data.value ?? data.count;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#160c24] px-3 py-2 text-sm shadow-xl shadow-black/30">
      <p className="font-semibold text-white">{label}</p>
      <p className="mt-1 text-white/55">{formatNumber(count)} placements</p>
      {data.type ? <p className="mt-1 text-xs text-violet-200">{data.type}</p> : null}
    </div>
  );
}

function TargetMetricCard({ metric }) {
  const Icon = DELIVERY_ICON[metric.id] || TrendingUp;
  const color = DELIVERY_COLORS[metric.id] || "#a78bfa";

  return (
    <article className="rounded-3xl border border-white/10 bg-black/20 p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-500/15">
          <Icon size={20} className="text-violet-200" />
        </div>
        <MiniDonut percentage={metric.percentage} color={color} />
      </div>
      <p className="text-sm font-medium text-white/50">{metric.label}</p>
      <div className="mt-2">
        <p className="text-3xl font-semibold text-white">
          {formatNumber(metric.actual)} <span className="text-white/30">/</span> {formatNumber(metric.target)}
        </p>
        <p className="mt-1 text-xs font-medium text-white/40">Achieved / Target</p>
      </div>
      <p className="mt-3 text-xs leading-5 text-white/40">{metric.helper}</p>
    </article>
  );
}

function MiniDonut({ percentage, color }) {
  return (
    <div
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(${color} 0deg ${percentage * 3.6}deg, rgba(255,255,255,0.09) ${percentage * 3.6}deg 360deg)`,
      }}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#12071f] text-[11px] font-semibold text-white">
        {percentage}%
      </div>
    </div>
  );
}

function TargetDonut({ metrics, percentage }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white">Target Achievement</h3>
      <p className="mt-1 text-sm text-white/45">Combined progress across the four delivery metrics.</p>
      <div
        className="mx-auto mt-6 flex h-48 w-48 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(#5eead4 0deg ${percentage * 3.6}deg, rgba(255,255,255,0.08) ${percentage * 3.6}deg 360deg)`,
        }}
      >
        <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full border border-white/10 bg-[#12071f] text-center shadow-inner shadow-black/40">
          <p className="text-4xl font-semibold text-white">{percentage}%</p>
          <p className="mt-1 text-xs text-white/40">overall</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {metrics.map((metric) => (
          <div key={metric.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-white/55">{metric.label}</span>
            <span className="font-semibold text-white">{metric.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Header({ eyebrow, title, description }) {
  return (
    <div className="rounded-3xl border border-violet-200/10 bg-[#12071f]/75 p-6 shadow-xl shadow-black/20">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">{title}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">{description}</p>
    </div>
  );
}

export function Stat({ icon: Icon, label, value, caption }) {
  return (
    <div className="rounded-3xl border border-violet-200/10 bg-white/[0.04] p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-500/15">
        <Icon size={20} className="text-violet-200" />
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="text-sm text-white/45">{label}</p>
      {caption ? <p className="mt-2 text-xs font-medium text-violet-200/70">{caption}</p> : null}
    </div>
  );
}

function ProjectRow({ project }) {
  const summary = getProjectSummary(project);

  return (
    <Link
      to={`/client/projects/${project.id}`}
      className="grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-violet-300/35 hover:bg-violet-500/10 md:grid-cols-[1fr_auto]"
    >
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold text-white">{project.name}</h3>
          <span className="rounded-full border border-violet-300/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
            {project.status}
          </span>
        </div>
        <p className="mt-2 text-sm text-white/45">
          {summary.centers} centers, {summary.candidates} candidates, {summary.employees} staff
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <Mini label="Health" value={`${summary.health}%`} />
        <Mini label="Attendance" value={`${summary.attendanceRate}%`} />
        <Mini label="Placement" value={`${summary.placementRate}%`} />
      </div>
    </Link>
  );
}

function Mini({ label, value }) {
  return (
    <div className="min-w-[92px] rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2">
      <p className="text-sm font-semibold text-white">{value}</p>
      <p className="text-[11px] text-white/35">{label}</p>
    </div>
  );
}
