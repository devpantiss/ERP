import { ArrowUpRight, ArrowDownRight } from "lucide-react";

/* ===================== PROJECT STATUS DATA ===================== */

const PROJECTS = [
  {
    name: "PMKVY 4.0",
    center: "Pantiss Skill Resort, Angul",
    status: "Active",
    progress: 78,
    enrolled: 240,
    certified: 212,
    placed: 185,
    trend: "up",
  },
  {
    name: "CSR – Tata Steel",
    center: "Jajpur Training Center",
    status: "Ongoing",
    progress: 62,
    enrolled: 180,
    certified: 146,
    placed: 112,
    trend: "up",
  },
  {
    name: "DDUGKY",
    center: "Kalahandi Center",
    status: "Active",
    progress: 45,
    enrolled: 320,
    certified: 218,
    placed: 144,
    trend: "down",
  },
  {
    name: "State Skill Mission",
    center: "Jharsuguda Campus",
    status: "Ongoing",
    progress: 88,
    enrolled: 150,
    certified: 141,
    placed: 132,
    trend: "up",
  },
  {
    name: "DMF Keonjhar",
    center: "Keonjhar Training Hub",
    status: "Active",
    progress: 34,
    enrolled: 200,
    certified: 116,
    placed: 68,
    trend: "up",
  },
  {
    name: "Shaksham Sundargarh",
    center: "Sundargarh Skill Center",
    status: "Active",
    progress: 55,
    enrolled: 280,
    certified: 206,
    placed: 154,
    trend: "down",
  },
];

/* ===================== MAIN COMPONENT ===================== */

export default function AdminDashboardSection3() {
  return (
    <section className="relative mt-6 overflow-hidden rounded-[28px] border border-cyan-400/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(8,13,25,0.98))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.13),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(139,92,246,0.14),transparent_26%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/45 to-transparent" />

      <div className="relative z-10 mb-6 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
          Project Status Overview
        </h3>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-400">
          {PROJECTS.length} active projects
        </span>
      </div>

      <div className="relative z-10 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.025]">
        <table className="w-full text-sm">

          <thead className="bg-white/[0.035]">
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-[0.16em] text-white/45">
              <th className="px-4 py-4">Project</th>
              <th className="px-4 py-4">Center</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Progress</th>
              <th className="px-4 py-4">Enrolled</th>
              <th className="px-4 py-4">Certified</th>
              <th className="px-4 py-4">Placed</th>
              <th className="px-4 py-4">Trend</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/8">
            {PROJECTS.map((project) => (
              <tr
                key={project.name}
                className="transition hover:bg-cyan-400/[0.035]"
              >
                <td className="px-4 py-4">
                  <span className="font-medium text-white/90">
                    {project.name}
                  </span>
                </td>

                <td className="px-4 py-4 text-white/60">
                  {project.center}
                </td>

                <td className="px-4 py-4">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs ${
                      project.status === "Active"
                        ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
                        : "border-amber-400/20 bg-amber-400/10 text-amber-300"
                    }`}
                  >
                    {project.status}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-800 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-400 to-fuchsia-400 shadow-[0_0_18px_rgba(34,211,238,0.35)] transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="min-w-9 text-xs font-semibold text-cyan-100">
                      {project.progress}%
                    </span>
                  </div>
                </td>

                <td className="px-4 py-4 font-medium text-white/80">
                  {project.enrolled}
                </td>

                <td className="px-4 py-4 font-medium text-white/80">
                  {project.certified}
                </td>

                <td className="px-4 py-4 font-medium text-white/80">
                  {project.placed}
                </td>

                <td className="px-4 py-4">
                  {project.trend === "up" ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-300">
                      <ArrowUpRight size={14} />
                      Up
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium text-red-300">
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
