import {
  AreaChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";

/* ===================== DUMMY DATA ===================== */

const weeklyEarnings = [
  { label: "Mon", earnings: 120, enrolled: 8 },
  { label: "Tue", earnings: 150, enrolled: 10 },
  { label: "Wed", earnings: 170, enrolled: 12 },
  { label: "Thu", earnings: 200, enrolled: 9 },
  { label: "Fri", earnings: 260, enrolled: 15 },
  { label: "Sat", earnings: 320, enrolled: 14 },
  { label: "Sun", earnings: 400, enrolled: 18 },
];

const monthlyEarnings = [
  { label: "Jan", earnings: 3200, enrolled: 120 },
  { label: "Feb", earnings: 3500, enrolled: 135 },
  { label: "Mar", earnings: 3000, enrolled: 110 },
  { label: "Apr", earnings: 3800, enrolled: 145 },
  { label: "May", earnings: 4100, enrolled: 160 },
  { label: "Jun", earnings: 3900, enrolled: 150 },
];

const monthlyWorkingHours = [
  { month: "Jan", hours: 160 },
  { month: "Feb", hours: 170 },
  { month: "Mar", hours: 150 },
  { month: "Apr", hours: 180 },
  { month: "May", hours: 175 },
  { month: "Jun", hours: 165 },
  { month: "Jul", hours: 170 },
  { month: "Aug", hours: 180 },
  { month: "Sep", hours: 190 },
  { month: "Oct", hours: 200 },
  { month: "Nov", hours: 210 },
  { month: "Dec", hours: 220 },
];

/* ===================== COMPONENT ===================== */

export default function Section3() {
  const [view, setView] = useState("weekly");

  const earningsData =
    view === "weekly" ? weeklyEarnings : monthlyEarnings;

  return (
    <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">

      {/* ================= EARNINGS OVERVIEW ================= */}
      <div className="bg-[#111827] border border-yellow-400 rounded-2xl p-6
        hover:shadow-[0_0_30px_rgba(250,204,21,0.08)] transition">

        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-100">
            Earnings Overview
          </h3>

          <div className="flex gap-2">
            {["weekly", "monthly"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition
                  ${
                    view === v
                      ? "bg-yellow-400 text-black"
                      : "bg-white/5 text-slate-400 hover:bg-yellow-400"
                  }`}
              >
                {v === "weekly" ? "Weekly" : "Monthly"}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={earningsData}>
              <defs>
                <linearGradient id="earningsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#facc15" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#facc15" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.08)"
              />
              <XAxis dataKey="label" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#e5e7eb",
                }}
              />
              <Legend />

              <Area
                type="monotone"
                dataKey="earnings"
                stroke="#facc15"
                strokeWidth={2}
                fill="url(#earningsFill)"
                name="Earnings (₹)"
              />

              <Line
                type="monotone"
                dataKey="enrolled"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Candidates Enrolled"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= WORKING HOURS ================= */}
      <div className="bg-[#111827] border border-yellow-400 rounded-2xl p-6
        hover:shadow-[0_0_30px_rgba(250,204,21,0.08)] transition">

        <h3 className="font-semibold text-slate-100 mb-4">
          Monthly Average Working Hours
        </h3>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyWorkingHours}>
              <defs>
                <linearGradient id="hoursFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#facc15" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#facc15" stopOpacity={0.35} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.08)"
              />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#e5e7eb",
                }}
              />

              <Bar
                dataKey="hours"
                fill="url(#hoursFill)"
                radius={[8, 8, 0, 0]}
                name="Avg Hours"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </section>
  );
}
