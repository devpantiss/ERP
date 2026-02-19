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

/* ===================== PROJECT DATA ===================== */

const projectRetentionData = {
  "Shaksham Sundargarh": [
    { month: "Jan", retention: 76 },
    { month: "Feb", retention: 80 },
    { month: "Mar", retention: 74 },
    { month: "Apr", retention: 82 },
  ],

  "DMF Jajpur": [
    { month: "Jan", retention: 70 },
    { month: "Feb", retention: 74 },
    { month: "Mar", retention: 72 },
    { month: "Apr", retention: 78 },
  ],
};

const projectFunnelData = {
  "Shaksham Sundargarh": [
    { month: "Jan", placed: 120, joined: 102, retained30: 92, retained90: 80 },
    { month: "Feb", placed: 135, joined: 118, retained30: 101, retained90: 88 },
    { month: "Mar", placed: 110, joined: 95, retained30: 82, retained90: 70 },
  ],

  "DMF Jajpur": [
    { month: "Jan", placed: 90, joined: 70, retained30: 60, retained90: 50 },
    { month: "Feb", placed: 105, joined: 88, retained30: 75, retained90: 65 },
  ],
};

/* ===================== MAIN ===================== */

export default function Section3({ project }) {

  const retentionData =
    projectRetentionData[project] ||
    projectRetentionData["Shaksham Sundargarh"];

  const funnelData =
    projectFunnelData[project] ||
    projectFunnelData["Shaksham Sundargarh"];

  return (
    <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">

      {/* RETENTION GRAPH */}
      <div className="bg-[#111827] border border-cyan-400 rounded-2xl p-6">

        <h3 className="font-semibold text-slate-100 mb-4">
          {project} — Annual Retention
        </h3>

        <div className="h-[320px]">

          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={retentionData}>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />

              <Bar
                dataKey="retention"
                fill="#22d3ee"
                radius={[6, 6, 0, 0]}
              />

            </BarChart>
          </ResponsiveContainer>

        </div>

      </div>

      {/* FUNNEL GRAPH */}
      <div className="bg-[#111827] border border-cyan-400 rounded-2xl p-6">

        <h3 className="font-semibold text-slate-100 mb-4">
          {project} — Placement Funnel
        </h3>

        <div className="h-[320px]">

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={funnelData}>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Line type="monotone" dataKey="placed" stroke="#22d3ee" />
              <Line type="monotone" dataKey="joined" stroke="#10b981" />
              <Line type="monotone" dataKey="retained30" stroke="#facc15" />
              <Line type="monotone" dataKey="retained90" stroke="#f472b6" />

            </LineChart>
          </ResponsiveContainer>

        </div>

      </div>

    </section>
  );
}
