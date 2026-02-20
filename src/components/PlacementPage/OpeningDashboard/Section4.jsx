import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";

/* ================= DATA ================= */

const companies = [
  "Tata Steel",
  "JSW",
  "Adani",
  "L&T",
  "Reliance",
  "Vedanta",
  "Jindal",
  "Ultratech",
  "Siemens",
  "ABB",
];

const segments = [
  "Mines",
  "Shipping",
  "Furniture",
  "Green Jobs",
  "Construction",
  "Power",
];

const roles = [
  "Technician",
  "Operator",
  "Supervisor",
  "Electrician",
  "Welder",
  "Fitter",
];

const locations = [
  "Odisha",
  "Gujarat",
  "Jharkhand",
  "Maharashtra",
  "West Bengal",
  "UAE",
  "Qatar",
];

/* ================= HELPERS ================= */

const generateTrendData = (labels) =>
  labels.map((name) => ({
    name,
    value: Math.floor(Math.random() * 120 + 20),
    growth: Math.floor(Math.random() * 40 - 10),
  }));

const generateRetentionData = () =>
  companies.map((c) => ({
    name: c,
    retention: Math.floor(Math.random() * 40 + 60),
  }));

/* ================= LABEL ================= */

const GrowthLabel = ({ x, y, payload }) => {
  if (!payload) return null;

  const growth = payload.growth ?? 0;
  const positive = growth >= 0;

  return (
    <text
      x={x}
      y={y - 18}
      fill={positive ? "#22c55e" : "#ef4444"}
      fontSize={11}
      textAnchor="middle"
    >
      {positive ? "▲" : "▼"} {growth}%
    </text>
  );
};

/* ================= MAIN ================= */

export default function Section4() {
  const [tab, setTab] = useState("joining");

  const trendData = useMemo(() => {
    let base = [];

    if (tab === "joining") base = generateTrendData(companies);
    if (tab === "segment") base = generateTrendData(segments);
    if (tab === "location") base = generateTrendData(locations);
    if (tab === "role") base = generateTrendData(roles);

    return base
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [tab]);

  const retentionData = useMemo(() => {
    return generateRetentionData()
      .sort((a, b) => b.retention - a.retention)
      .slice(0, 10);
  }, []);

  const tabs = [
    { id: "joining", label: "Joining Trend" },
    { id: "segment", label: "Segment Trend" },
    { id: "location", label: "Location Trend" },
    { id: "role", label: "Job Role Trend" },
  ];

  return (
    <div className="bg-[#020617] mt-4 border border-cyan-900 rounded-2xl p-6">

      {/* ================= GRID ================= */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ===================================================== */}
        {/* LEFT — PRIMARY ANALYTICS */}
        {/* ===================================================== */}

        <div className="xl:col-span-2 bg-[#020617] border border-gray-800 rounded-xl p-5 space-y-5">

          {/* Header */}

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-white">
                Placement Trends
              </h2>
              <p className="text-xs text-gray-400">
                Top 10 performance across placement dimensions
              </p>
            </div>

          </div>

          {/* Tabs */}

          <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-2">

            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-1.5 rounded-lg text-sm transition
                  ${
                    tab === t.id
                      ? "bg-cyan-500 text-black font-semibold"
                      : "text-gray-400 hover:text-white"
                  }`}
              >
                {t.label}
              </button>
            ))}

          </div>

          {/* Chart */}

          <div className="h-[420px] w-full">

            <ResponsiveContainer width="100%" height="100%">

              <BarChart data={trendData}>

                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />

                <XAxis
                  dataKey="name"
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                />

                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />

                <Tooltip
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid #0891b2",
                    borderRadius: "8px",
                  }}
                />

                <Bar
                  dataKey="value"
                  fill="#06b6d4"
                  radius={[6, 6, 0, 0]}
                >
                  <LabelList dataKey="growth" content={<GrowthLabel />} />
                </Bar>

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* ===================================================== */}
        {/* RIGHT — SECONDARY ANALYTICS */}
        {/* ===================================================== */}

        <div className="bg-[#020617] border border-gray-800 rounded-xl p-5 space-y-5">

          <div>
            <h2 className="text-lg font-semibold text-white">
              Company Retention
            </h2>
            <p className="text-xs text-gray-400">
              Highest retention employers
            </p>
          </div>

          <div className="h-[420px] w-full">

            <ResponsiveContainer width="100%" height="100%">

              <BarChart
                data={retentionData}
                layout="vertical"
                margin={{ left: 40 }}
              >

                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />

                <XAxis
                  type="number"
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                />

                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                />

                <Tooltip
                  formatter={(v) => `${v}%`}
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid #0891b2",
                    borderRadius: "8px",
                  }}
                />

                <Bar
                  dataKey="retention"
                  fill="#22c55e"
                  radius={[0, 6, 6, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

    </div>
  );
}
