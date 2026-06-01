import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Award,
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
  enrolled: "#a78bfa",
  certified: "#34d399",
  placed: "#22d3ee",
  retention: "#f59e0b",
};

const PLACEMENT_COLORS = {
  district: ["#34d399", "#f59e0b"],
  location: {
    "Odisha district": "#a78bfa",
    "Outside Odisha": "#22d3ee",
  },
  local: ["#a78bfa", "#22d3ee"],
};

const formatNumber = (value) => new Intl.NumberFormat("en-IN").format(value || 0);

export default function ClientDashboard() {
  const client = getStoredClient();
  const projects = getClientProjects(client.name);
  const deliveryMetrics = getClientDeliveryMetrics(projects);
  const placementGeography = getClientPlacementGeography(projects);
  const dashboardCards = deliveryMetrics.metrics.map((metric) => ({
    ...metric,
    icon: DELIVERY_ICON[metric.id] || TrendingUp,
  }));

  return (
    <section className="space-y-6">
      <Header
        eyebrow="Client Dashboard"
        title={`${client.name} project tracking`}
        description="A focused view of project delivery, center performance, enrollment, attendance, placement, and open delivery risks."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((metric) => (
          <Stat
            key={metric.id}
            icon={metric.icon}
            label={metric.label}
            value={formatNumber(metric.actual)}
            caption={`${metric.percentage}% of target`}
          />
        ))}
      </div>

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
            <Tooltip content={<PlacementTooltip />} cursor={{ fill: "rgba(167,139,250,0.08)" }} />
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
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-3xl font-semibold text-white">{formatNumber(metric.actual)}</p>
        <p className="pb-1 text-xs text-white/40">Target {formatNumber(metric.target)}</p>
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
          background: `conic-gradient(#a78bfa 0deg ${percentage * 3.6}deg, rgba(255,255,255,0.08) ${percentage * 3.6}deg 360deg)`,
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
