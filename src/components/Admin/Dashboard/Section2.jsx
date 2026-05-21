import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  UserCheck,
  UserPlus,
  Clock,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

/* ===================== MAIN COMPONENT ===================== */

export default function AdminDashboardSection2({ roleData = [], recentActivity = [] }) {
  return (
    <section className="grid md:grid-cols-2 gap-6 mt-6">

      {/* ================= ROLE DISTRIBUTION ================= */}
      <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6">

        <h3 className="text-sm font-medium text-violet-400 mb-6">
          User Distribution by Role
        </h3>

        <div className="h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={roleData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                paddingAngle={3}
                strokeWidth={0}
              >
                {roleData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-white/80">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Role summary */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {roleData.map((role) => (
            <div
              key={role.name}
              className="flex items-center gap-2 text-sm"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: role.color }}
              />
              <span className="text-white/60">{role.name}</span>
              <span className="ml-auto font-medium text-white/90">
                {role.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= RECENT ACTIVITY ================= */}
      <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6">

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-medium text-violet-400">
            Recent Activity
          </h3>
          <button className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition">
            View All <ArrowRight size={12} />
          </button>
        </div>

        <div className="space-y-4">
          {recentActivity.map((activity, index) => {
            const Icon = activity.type === "alert" ? AlertTriangle : activity.type === "placement" ? Clock : activity.type === "candidate" ? UserPlus : UserCheck;
            return (
              <div
                key={`${activity.type}-${index}`}
                className="flex items-start gap-3 group"
              >
                <div className={`mt-0.5 ${activity.color}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/90 leading-snug">
                    {activity.text}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activity.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}
