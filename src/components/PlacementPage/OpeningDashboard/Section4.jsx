import { useEffect, useMemo, useState } from "react";
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
import { usePlacementStore } from "../../../stores/placementStore";
import {
  selectCompanyRetentionRows,
  selectJobOpeningRows,
  selectPlacementTrendRows,
} from "../../../stores/selectors/placementSelectors";

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
  const { drives, fetchDrives } = usePlacementStore();
  const [tab, setTab] = useState("joining");

  useEffect(() => {
    fetchDrives();
  }, [fetchDrives]);

  const openings = useMemo(() => selectJobOpeningRows(drives), [drives]);

  const trendData = useMemo(() => {
    return selectPlacementTrendRows(openings, tab);
  }, [openings, tab]);

  const retentionData = useMemo(() => {
    return selectCompanyRetentionRows(openings);
  }, [openings]);

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

        <div className="xl:col-span-2 bg-[#020617] border border-white/[0.08] rounded-xl p-5 space-y-5">

          {/* Header */}

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-white">
                Placement Trends
              </h2>
              <p className="text-xs text-white/60">
                Top 10 performance across placement dimensions
              </p>
            </div>

          </div>

          {/* Tabs */}

          <div className="flex flex-wrap gap-2 border-b border-white/[0.08] pb-2">

            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-1.5 rounded-lg text-sm transition
                  ${
                    tab === t.id
                      ? "bg-cyan-500 text-black font-semibold"
                      : "text-white/60 hover:text-white"
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

        <div className="bg-[#020617] border border-white/[0.08] rounded-xl p-5 space-y-5">

          <div>
            <h2 className="text-lg font-semibold text-white">
              Company Retention
            </h2>
            <p className="text-xs text-white/60">
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
