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
  
  /* ===================== AUTO GENERATED DATA ===================== */
  
  // 6 months certification + quality monitoring
  const monthlyCertificationData = [
    { month: "Jan", certified: 45, passRate: 82 },
    { month: "Feb", certified: 52, passRate: 88 },
    { month: "Mar", certified: 38, passRate: 75 },
    { month: "Apr", certified: 60, passRate: 90 },
    { month: "May", certified: 70, passRate: 92 },
    { month: "Jun", certified: 65, passRate: 89 },
  ];
  
  // Monthly working hours
  const monthlyWorkingHours = [
    { month: "Jan", hours: 160 },
    { month: "Feb", hours: 170 },
    { month: "Mar", hours: 150 },
    { month: "Apr", hours: 180 },
    { month: "May", hours: 175 },
    { month: "Jun", hours: 165 },
  ];
  
  /* ===================== COMPONENT ===================== */
  
  export default function Section3() {
    const [view] = useState("monthly");
  
    return (
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
  
        {/* ================= WORKING HOURS ================= */}
        <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6
          hover:shadow-[0_0_30px_rgba(16,185,129,0.08)] transition">
  
          <h3 className="font-semibold text-slate-100 mb-4">
            Monthly Working Hours
          </h3>
  
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyWorkingHours}>
                <defs>
                  <linearGradient id="hoursFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
  
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#e5e7eb",
                  }}
                />
                <Legend />
  
                <Bar
                  dataKey="hours"
                  fill="url(#hoursFill)"
                  radius={[8, 8, 0, 0]}
                  name="Working Hours"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
  
        {/* ================= CERTIFICATION PERFORMANCE ================= */}
        <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6
          hover:shadow-[0_0_30px_rgba(16,185,129,0.08)] transition">
  
          <h3 className="font-semibold text-slate-100 mb-4">
            Certification & Pass Rate
          </h3>
  
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyCertificationData}>
                <defs>
                  <linearGradient id="certifiedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
  
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis yAxisId="left" stroke="#94a3b8" />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#94a3b8"
                  domain={[0, 100]}
                />
  
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#e5e7eb",
                  }}
                />
                <Legend />
  
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="certified"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#certifiedFill)"
                  name="Certified Candidates"
                />
  
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="passRate"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                  name="Pass Rate (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
  
      </section>
    );
  }
  