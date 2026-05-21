import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { Download, TrendingUp, Users, Briefcase } from "lucide-react";
import { selectAdminReportAnalytics } from "../../stores/selectors/analyticsSelectors";

const tooltipStyle = {  border: "1px solid #334155", borderRadius: "8px", color: "#e2e8f0" };

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState("enrollment");
  const analytics = selectAdminReportAnalytics();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Reports & Analytics</h1>
          <p className="text-sm text-white/60 mt-1">Comprehensive platform analytics and insights</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-400 transition">
          <Download size={14} /> Export Report
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {analytics.summary.map((s, index) => {
          const icons = [Users, Briefcase, TrendingUp, TrendingUp];
          const Icon = icons[index] || TrendingUp;
          return (
          <div key={s.label} className="bg-[#111827] border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/60">{s.label}</span>
              <Icon size={16} className="text-violet-400" />
            </div>
            <p className="text-xl font-semibold text-slate-100">{s.value}</p>
            <p className="text-xs text-emerald-400 mt-1">{s.change}</p>
          </div>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {["enrollment", "placement", "training", "sectors"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm rounded-lg capitalize transition ${activeTab === tab ? "bg-violet-500 text-white" : "bg-[#111827] text-white/60 border border-slate-700 hover:border-violet-500/30"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="bg-[#111827] border border-slate-700 rounded-xl p-6">
        {activeTab === "enrollment" && (
          <>
            <h3 className="text-sm font-medium text-violet-400 mb-6">Monthly Enrollment Trends</h3>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={analytics.enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="enrolled" fill="#8b5cf6" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {activeTab === "placement" && (
          <>
            <h3 className="text-sm font-medium text-violet-400 mb-6">Placement Rate Trends</h3>
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={analytics.placementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} domain={[60, 100]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {activeTab === "training" && (
          <>
            <h3 className="text-sm font-medium text-violet-400 mb-6">Training Hours by Center</h3>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={analytics.trainingHours} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" fontSize={12} />
                  <YAxis dataKey="center" type="category" stroke="#64748b" fontSize={12} width={80} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="hours" fill="#8b5cf6" radius={[0,6,6,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {activeTab === "sectors" && (
          <>
            <h3 className="text-sm font-medium text-violet-400 mb-6">Placement by Sector</h3>
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={analytics.sectorData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="value" paddingAngle={3} strokeWidth={0}>
                    {analytics.sectorData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend formatter={(v) => <span className="text-sm text-white/80">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
