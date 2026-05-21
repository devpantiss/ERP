import { useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  FaBuilding,
  FaBriefcase,
  FaMoneyBillWave,
  FaUsers,
  FaArrowUp,
  FaChartLine,
} from "react-icons/fa";
import { usePlacementStore } from "../../../stores/placementStore";
import {
  selectJobOpeningRows,
  selectOpeningAnalytics,
  selectOpeningTrendData,
} from "../../../stores/selectors/placementSelectors";

/* ================= COLORS ================= */

const PIE_COLORS = ["#06b6d4", "#22d3ee", "#67e8f9", "#0891b2", "#0ea5e9"];

/* ================= MAIN ================= */

export default function Section3() {
  const { drives, fetchDrives } = usePlacementStore();

  useEffect(() => {
    fetchDrives();
  }, [fetchDrives]);

  const openings = useMemo(() => selectJobOpeningRows(drives), [drives]);
  const trendData = useMemo(() => selectOpeningTrendData(openings), [openings]);
  /* ================= KPI ================= */

  const stats = useMemo(() => selectOpeningAnalytics(openings), [openings]);

  return (
    <section className="w-full mt-4 bg-[#020617] border border-cyan-900 rounded-2xl p-6 md:p-8 space-y-8 shadow-2xl">

      {/* ================= HEADER ================= */}

      <header className="flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-semibold text-cyan-400">
            Workforce Intelligence Dashboard
          </h2>
          <p className="text-sm text-white/60">
            Hiring trends, placement analytics & demand insights
          </p>
        </div>

        <div className="text-xs text-gray-500">
          Updated just now
        </div>

      </header>

      {/* ================= KPI ================= */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

        <KpiCard
          title="Total Vacancies"
          value={stats.vacancies}
          icon={<FaUsers />}
          trend="+12%"
        />

        <KpiCard
          title="Companies Hiring"
          value={stats.companies}
          icon={<FaBuilding />}
          trend="+8%"
        />

        <KpiCard
          title="Avg Salary"
          value={`₹ ${stats.avgSalary}`}
          icon={<FaMoneyBillWave />}
          trend="+5%"
        />

        <KpiCard
          title="Placement Conversion"
          value={`${stats.conversion}%`}
          icon={<FaChartLine />}
          trend="+6%"
        />

      </div>

      {/* ================= CHART GRID ================= */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* COMPANY TREND */}

        <Panel title="Monthly Company Hiring">

          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={trendData.monthlyCompanyData}>
              <CartesianGrid stroke="#0f172a" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />

              {trendData.companies.map((company, index) => (
                <Bar key={company} dataKey={company} fill={trendData.colors[index % trendData.colors.length]} radius={[6, 6, 0, 0]} />
              ))}

            </BarChart>
          </ResponsiveContainer>

        </Panel>

        {/* ROLE TREND */}

        <Panel title="Role Demand Trend">

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={trendData.roleTrendData}>
              <CartesianGrid stroke="#0f172a" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />

              {trendData.roles.map((role, index) => (
                <Line key={role} type="monotone" dataKey={role} stroke={trendData.colors[index % trendData.colors.length]} strokeWidth={3} />
              ))}

            </LineChart>
          </ResponsiveContainer>

        </Panel>

      </div>

      {/* ================= SECOND GRID ================= */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* INDUSTRY */}

        <Panel title="Industry Distribution">

          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={trendData.industryData}
                dataKey="value"
                outerRadius={100}
                label
              >
                {trendData.industryData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

        </Panel>

        {/* SALARY */}

        <Panel title="Salary Intelligence">

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={trendData.salaryData}>
              <CartesianGrid stroke="#0f172a" />
              <XAxis dataKey="role" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />

              <Bar dataKey="salary" fill="#06b6d4" radius={[6, 6, 0, 0]} />

            </BarChart>
          </ResponsiveContainer>

        </Panel>

        {/* FUNNEL */}

        <Panel title="Placement Funnel">

          <div className="space-y-3">

            {trendData.funnelData.map((f, i) => (
              <div key={i}>

                <div className="flex justify-between text-xs text-white/60 mb-1">
                  <span>{f.stage}</span>
                  <span>{f.value}</span>
                </div>

                <div className="w-full bg-transparent rounded h-2">
                  <div
                    className="bg-cyan-400 h-2 rounded"
                    style={{ width: `${(f.value / Math.max(trendData.funnelData[0]?.value || 1, 1)) * 100}%` }}
                  />
                </div>

              </div>
            ))}

          </div>

        </Panel>

      </div>

    </section>
  );
}

/* ================= KPI ================= */

function KpiCard({ title, value, icon, trend }) {
  return (
    <div className="bg-transparent/40 border border-cyan-900 rounded-xl p-5 flex items-center justify-between">

      <div>
        <p className="text-xs text-white/60">{title}</p>
        <h3 className="text-xl font-semibold text-white">{value}</h3>

        <div className="flex items-center gap-1 text-xs text-green-400 mt-1">
          <FaArrowUp />
          {trend}
        </div>
      </div>

      <div className="text-cyan-400 text-xl">{icon}</div>

    </div>
  );
}

/* ================= PANEL ================= */

function Panel({ title, children }) {
  return (
    <div className="bg-transparent/40 border border-cyan-900 rounded-xl p-5">

      <div className="flex justify-between mb-4">
        <h3 className="text-sm font-semibold text-cyan-400">
          {title}
        </h3>
      </div>

      {children}

    </div>
  );
}
