import React, { useMemo } from "react";
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

/* ================= DUMMY DATA ================= */

const monthlyCompanyData = [
  { month: "Jan", Tata: 25, Adani: 18, LNT: 12, JSW: 20 },
  { month: "Feb", Tata: 30, Adani: 15, LNT: 18, JSW: 22 },
  { month: "Mar", Tata: 28, Adani: 20, LNT: 15, JSW: 25 },
  { month: "Apr", Tata: 35, Adani: 22, LNT: 20, JSW: 30 },
  { month: "May", Tata: 40, Adani: 28, LNT: 22, JSW: 32 },
  { month: "Jun", Tata: 45, Adani: 30, LNT: 25, JSW: 35 },
];

const roleTrendData = [
  { month: "Jan", Technician: 40, Operator: 25, Supervisor: 18 },
  { month: "Feb", Technician: 45, Operator: 28, Supervisor: 20 },
  { month: "Mar", Technician: 50, Operator: 30, Supervisor: 22 },
  { month: "Apr", Technician: 55, Operator: 35, Supervisor: 26 },
  { month: "May", Technician: 60, Operator: 38, Supervisor: 28 },
  { month: "Jun", Technician: 70, Operator: 42, Supervisor: 30 },
];

const industryData = [
  { name: "Mining", value: 120 },
  { name: "Construction", value: 98 },
  { name: "Logistics", value: 86 },
  { name: "Power", value: 65 },
  { name: "Shipping", value: 50 },
];

const recruiterData = [
  { name: "Tata Steel", jobs: 120 },
  { name: "Adani", jobs: 95 },
  { name: "L&T", jobs: 88 },
  { name: "JSW", jobs: 72 },
  { name: "Reliance", jobs: 60 },
];

const salaryData = [
  { role: "Technician", salary: 22000 },
  { role: "Operator", salary: 26000 },
  { role: "Supervisor", salary: 32000 },
  { role: "Engineer", salary: 45000 },
];

const funnelData = [
  { stage: "Enrolled", value: 500 },
  { stage: "Trained", value: 420 },
  { stage: "Certified", value: 350 },
  { stage: "Interviewed", value: 280 },
  { stage: "Placed", value: 210 },
];

/* ================= COLORS ================= */

const PIE_COLORS = ["#06b6d4", "#22d3ee", "#67e8f9", "#0891b2", "#0ea5e9"];

/* ================= MAIN ================= */

export default function Section3() {
  /* ================= KPI ================= */

  const stats = useMemo(() => {
    return {
      vacancies: 620,
      companies: 48,
      avgSalary: 28000,
      conversion: 68,
    };
  }, []);

  return (
    <section className="w-full mt-4 bg-[#020617] border border-cyan-900 rounded-2xl p-6 md:p-8 space-y-8 shadow-2xl">

      {/* ================= HEADER ================= */}

      <header className="flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-semibold text-cyan-400">
            Workforce Intelligence Dashboard
          </h2>
          <p className="text-sm text-gray-400">
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
            <BarChart data={monthlyCompanyData}>
              <CartesianGrid stroke="#0f172a" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />

              <Bar dataKey="Tata" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Adani" fill="#22d3ee" radius={[6, 6, 0, 0]} />
              <Bar dataKey="LNT" fill="#67e8f9" radius={[6, 6, 0, 0]} />
              <Bar dataKey="JSW" fill="#0891b2" radius={[6, 6, 0, 0]} />

            </BarChart>
          </ResponsiveContainer>

        </Panel>

        {/* ROLE TREND */}

        <Panel title="Role Demand Trend">

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={roleTrendData}>
              <CartesianGrid stroke="#0f172a" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />

              <Line type="monotone" dataKey="Technician" stroke="#06b6d4" strokeWidth={3} />
              <Line type="monotone" dataKey="Operator" stroke="#22d3ee" strokeWidth={3} />
              <Line type="monotone" dataKey="Supervisor" stroke="#67e8f9" strokeWidth={3} />

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
                data={industryData}
                dataKey="value"
                outerRadius={100}
                label
              >
                {industryData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

        </Panel>

        {/* SALARY */}

        <Panel title="Salary Intelligence">

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={salaryData}>
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

            {funnelData.map((f, i) => (
              <div key={i}>

                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{f.stage}</span>
                  <span>{f.value}</span>
                </div>

                <div className="w-full bg-gray-800 rounded h-2">
                  <div
                    className="bg-cyan-400 h-2 rounded"
                    style={{ width: `${(f.value / 500) * 100}%` }}
                  />
                </div>

              </div>
            ))}

          </div>

        </Panel>

      </div>

      {/* ================= TOP RECRUITERS ================= */}

      {/* <Panel title="Top Recruiters">

        <div className="space-y-3">

          {recruiterData.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-black/40 border border-gray-700 rounded-lg px-4 py-2"
            >
              <span className="text-sm text-gray-200">{r.name}</span>

              <div className="flex items-center gap-2 text-cyan-400">
                <FaBriefcase />
                {r.jobs}
              </div>
            </div>
          ))}

        </div>

      </Panel> */}

    </section>
  );
}

/* ================= KPI ================= */

function KpiCard({ title, value, icon, trend }) {
  return (
    <div className="bg-black/40 border border-cyan-900 rounded-xl p-5 flex items-center justify-between">

      <div>
        <p className="text-xs text-gray-400">{title}</p>
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
    <div className="bg-black/40 border border-cyan-900 rounded-xl p-5">

      <div className="flex justify-between mb-4">
        <h3 className="text-sm font-semibold text-cyan-400">
          {title}
        </h3>
      </div>

      {children}

    </div>
  );
}
