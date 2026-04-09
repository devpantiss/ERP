import { ArrowUpRight, ArrowDownRight } from "lucide-react";

/* ===================== PROJECT STATUS DATA ===================== */

const PROJECTS = [
  {
    name: "PMKVY 4.0",
    center: "Pantiss Skill Resort, Angul",
    status: "Active",
    progress: 78,
    enrolled: 240,
    placed: 185,
    trend: "up",
  },
  {
    name: "CSR – Tata Steel",
    center: "Jajpur Training Center",
    status: "Ongoing",
    progress: 62,
    enrolled: 180,
    placed: 112,
    trend: "up",
  },
  {
    name: "DDUGKY",
    center: "Kalahandi Center",
    status: "Active",
    progress: 45,
    enrolled: 320,
    placed: 144,
    trend: "down",
  },
  {
    name: "State Skill Mission",
    center: "Jharsuguda Campus",
    status: "Ongoing",
    progress: 88,
    enrolled: 150,
    placed: 132,
    trend: "up",
  },
  {
    name: "DMF Keonjhar",
    center: "Keonjhar Training Hub",
    status: "Active",
    progress: 34,
    enrolled: 200,
    placed: 68,
    trend: "up",
  },
  {
    name: "Shaksham Sundargarh",
    center: "Sundargarh Skill Center",
    status: "Active",
    progress: 55,
    enrolled: 280,
    placed: 154,
    trend: "down",
  },
];

/* ===================== MAIN COMPONENT ===================== */

export default function AdminDashboardSection3() {
  return (
    <section className="bg-[#111827] border border-slate-700 rounded-2xl p-6 mt-6">

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-violet-400">
          Project Status Overview
        </h3>
        <span className="text-xs text-slate-500">
          {PROJECTS.length} active projects
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          <thead>
            <tr className="text-left text-xs text-white/60 border-b border-slate-700">
              <th className="pb-3 pr-4">Project</th>
              <th className="pb-3 pr-4">Center</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Progress</th>
              <th className="pb-3 pr-4">Enrolled</th>
              <th className="pb-3 pr-4">Placed</th>
              <th className="pb-3">Trend</th>
            </tr>
          </thead>

          <tbody>
            {PROJECTS.map((project) => (
              <tr
                key={project.name}
                className="border-b border-slate-700/50 hover:bg-transparent/30 transition"
              >
                <td className="py-4 pr-4">
                  <span className="font-medium text-white/90">
                    {project.name}
                  </span>
                </td>

                <td className="py-4 pr-4 text-white/60">
                  {project.center}
                </td>

                <td className="py-4 pr-4">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full ${
                      project.status === "Active"
                        ? "bg-violet-500/10 text-violet-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {project.status}
                  </span>
                </td>

                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/60">
                      {project.progress}%
                    </span>
                  </div>
                </td>

                <td className="py-4 pr-4 text-white/80">
                  {project.enrolled}
                </td>

                <td className="py-4 pr-4 text-white/80">
                  {project.placed}
                </td>

                <td className="py-4">
                  {project.trend === "up" ? (
                    <span className="flex items-center gap-1 text-emerald-400 text-xs">
                      <ArrowUpRight size={14} />
                      Up
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-400 text-xs">
                      <ArrowDownRight size={14} />
                      Down
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
