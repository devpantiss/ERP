import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
  } from "recharts";
  
  /* ===================== DATA ===================== */
  
  /* 12 Month Retention */
  
  const retentionData = [
    { month: "Jan", retention: 76 },
    { month: "Feb", retention: 80 },
    { month: "Mar", retention: 74 },
    { month: "Apr", retention: 82 },
    { month: "May", retention: 85 },
    { month: "Jun", retention: 79 },
    { month: "Jul", retention: 83 },
    { month: "Aug", retention: 88 },
    { month: "Sep", retention: 84 },
    { month: "Oct", retention: 87 },
    { month: "Nov", retention: 90 },
    { month: "Dec", retention: 86 },
  ];
  
  /* 12 Month Funnel */
  
  const funnelData = [
    { month: "Jan", placed: 120, joined: 102, retained30: 92, retained90: 80 },
    { month: "Feb", placed: 135, joined: 118, retained30: 101, retained90: 88 },
    { month: "Mar", placed: 110, joined: 95, retained30: 82, retained90: 70 },
    { month: "Apr", placed: 145, joined: 130, retained30: 112, retained90: 98 },
    { month: "May", placed: 160, joined: 142, retained30: 125, retained90: 110 },
    { month: "Jun", placed: 150, joined: 134, retained30: 118, retained90: 104 },
    { month: "Jul", placed: 170, joined: 150, retained30: 135, retained90: 120 },
    { month: "Aug", placed: 180, joined: 162, retained30: 146, retained90: 130 },
    { month: "Sep", placed: 165, joined: 148, retained30: 132, retained90: 118 },
    { month: "Oct", placed: 190, joined: 170, retained30: 155, retained90: 138 },
    { month: "Nov", placed: 200, joined: 182, retained30: 165, retained90: 150 },
    { month: "Dec", placed: 185, joined: 168, retained30: 150, retained90: 135 },
  ];
  
  /* ===================== COMPONENT ===================== */
  
  export default function Section3() {
    return (
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
  
        {/* ================= RETENTION ================= */}
        <div className="bg-[#111827] border border-cyan-400 rounded-2xl p-6
          hover:shadow-[0_0_30px_rgba(34,211,238,0.08)] transition">
  
          <h3 className="font-semibold text-slate-100 mb-4">
            Annual Retention Trend
          </h3>
  
          <div className="h-[320px]">
  
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={retentionData}>
  
                <defs>
                  <linearGradient id="retentionFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
  
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
  
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
  
                <Bar
                  dataKey="retention"
                  fill="url(#retentionFill)"
                  radius={[6, 6, 0, 0]}
                  name="Retention %"
                />
  
              </BarChart>
            </ResponsiveContainer>
  
          </div>
        </div>
  
        {/* ================= FUNNEL ================= */}
        <div className="bg-[#111827] border border-cyan-400 rounded-2xl p-6
          hover:shadow-[0_0_30px_rgba(34,211,238,0.08)] transition">
  
          <h3 className="font-semibold text-slate-100 mb-4">
            Placement Funnel — Last 12 Months
          </h3>
  
          <div className="h-[320px]">
  
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={funnelData}>
  
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
  
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
  
                <Legend />
  
                <Line
                  type="monotone"
                  dataKey="placed"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  name="Placed"
                />
  
                <Line
                  type="monotone"
                  dataKey="joined"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Joined"
                />
  
                <Line
                  type="monotone"
                  dataKey="retained30"
                  stroke="#facc15"
                  strokeWidth={2}
                  name="30 Day"
                />
  
                <Line
                  type="monotone"
                  dataKey="retained90"
                  stroke="#f472b6"
                  strokeWidth={2}
                  name="90 Day"
                />
  
              </LineChart>
            </ResponsiveContainer>
  
          </div>
        </div>
  
      </section>
    );
  }
  