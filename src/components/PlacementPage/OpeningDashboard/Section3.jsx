import { useEffect, useMemo } from "react";
import {
  FaBriefcase,
  FaCalendarAlt,
  FaChartLine,
  FaProjectDiagram,
  FaUsers,
} from "react-icons/fa";
import { usePlacementStore } from "../../../stores/placementStore";
import { selectJobOpeningRows } from "../../../stores/selectors/placementSelectors";

/* ================= MAIN ================= */

export default function Section3() {
  const { drives, fetchDrives } = usePlacementStore();

  useEffect(() => {
    fetchDrives();
  }, [fetchDrives]);

  const openings = useMemo(() => selectJobOpeningRows(drives), [drives]);
  const projectRows = useMemo(() => buildProjectRows(drives, openings), [drives, openings]);
  const totals = useMemo(() => {
    return projectRows.reduce(
      (acc, project) => ({
        drives: acc.drives + project.drives,
        candidates: acc.candidates + project.candidates,
        placed: acc.placed + project.placed,
        companies: acc.companies + project.companies.length,
      }),
      { drives: 0, candidates: 0, placed: 0, companies: 0 }
    );
  }, [projectRows]);

  const bestProject = projectRows.reduce(
    (best, project) => (project.conversion > best.conversion ? project : best),
    { name: "-", conversion: 0 }
  );

  return (
    <section className="w-full mt-4 bg-[#020617] border border-cyan-900 rounded-2xl p-6 md:p-8 space-y-8 shadow-2xl">

      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-cyan-400">
            Project-wise Placement Details
          </h2>
          <p className="text-sm text-white/60">
            Track placement drives, companies, candidates, and outcomes by project.
          </p>
        </div>

        <div className="text-xs text-gray-500">
          Tracking view
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <KpiCard title="Projects Tracked" value={projectRows.length} icon={<FaProjectDiagram />} />
        <KpiCard title="Total Drives" value={totals.drives} icon={<FaBriefcase />} />
        <KpiCard title="Candidates Sent" value={totals.candidates} icon={<FaUsers />} />
        <KpiCard title="Placed Candidates" value={totals.placed} icon={<FaChartLine />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_2fr] gap-6">
        <Panel title="Placement Snapshot">
          <div className="space-y-4">
            <SnapshotRow label="Best Conversion" value={`${bestProject.name} (${bestProject.conversion}%)`} />
            <SnapshotRow label="Companies Engaged" value={totals.companies} />
            <SnapshotRow
              label="Overall Conversion"
              value={`${totals.candidates ? Math.round((totals.placed / totals.candidates) * 100) : 0}%`}
            />
            <SnapshotRow
              label="Latest Drive"
              value={projectRows.find((project) => project.latestDrive)?.latestDrive || "-"}
            />
          </div>
        </Panel>

        <Panel title="Project Placement Progress">
          <div className="space-y-4">
            {projectRows.map((project) => (
              <div key={project.name}>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium text-white/85">{project.name}</span>
                  <span className="text-cyan-300">{project.placed}/{project.candidates} placed</span>
                </div>
                <div className="mt-2 h-2 rounded bg-slate-800">
                  <div
                    className="h-2 rounded bg-cyan-400"
                    style={{ width: `${project.conversion}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="overflow-hidden rounded-xl border border-cyan-900 bg-transparent/40">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-sm">
            <thead className="bg-[#0f172a] text-cyan-300">
              <tr className="text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Project</th>
                <th className="px-4 py-3 text-left">Companies</th>
                <th className="px-4 py-3 text-left">Roles</th>
                <th className="px-4 py-3 text-center">Drives</th>
                <th className="px-4 py-3 text-center">Candidates</th>
                <th className="px-4 py-3 text-center">Placed</th>
                <th className="px-4 py-3 text-center">Conversion</th>
                <th className="px-4 py-3 text-right">Avg Salary</th>
                <th className="px-4 py-3 text-left">Latest Drive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.08]">
              {projectRows.map((project) => (
                <tr key={project.name} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-4 font-medium text-white">{project.name}</td>
                  <td className="px-4 py-4 text-white/70">{project.companies.join(", ") || "-"}</td>
                  <td className="px-4 py-4 text-white/70">{project.roles.join(", ") || "-"}</td>
                  <td className="px-4 py-4 text-center">{project.drives}</td>
                  <td className="px-4 py-4 text-center">{project.candidates}</td>
                  <td className="px-4 py-4 text-center text-emerald-300">{project.placed}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="rounded-full border border-cyan-500/40 bg-cyan-900/20 px-2.5 py-1 text-xs text-cyan-200">
                      {project.conversion}%
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">₹ {project.avgSalary.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-4 text-white/70">{project.latestDrive || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </section>
  );
}

/* ================= HELPERS ================= */

function buildProjectRows(drives, openings) {
  const openingById = new Map(openings.map((opening) => [opening.id, opening]));
  const projects = new Map();

  drives.forEach((drive) => {
    const opening = openingById.get(drive.id);
    const projectName = opening?.project || drive.project?.name || "Not Assigned";
    const current = projects.get(projectName) || {
      name: projectName,
      drives: 0,
      candidates: 0,
      placed: 0,
      salaryTotal: 0,
      salaryCount: 0,
      latestDrive: "",
      companies: new Set(),
      roles: new Set(),
    };

    const candidateCount = drive.candidateIds?.length || opening?.candidateCount || 0;
    const placedCount =
      (drive.placedStudents || []).length ||
      (drive.candidates || []).filter((candidate) => candidate.status === "PLACED").length;

    current.drives += 1;
    current.candidates += candidateCount;
    current.placed += placedCount;
    if (opening?.salary) {
      current.salaryTotal += opening.salary;
      current.salaryCount += 1;
    }
    if (opening?.company) current.companies.add(opening.company);
    if (opening?.role) current.roles.add(opening.role);
    if (!current.latestDrive || new Date(drive.scheduledOn) > new Date(current.latestDrive)) {
      current.latestDrive = drive.scheduledOn || current.latestDrive;
    }

    projects.set(projectName, current);
  });

  return Array.from(projects.values())
    .map((project) => ({
      ...project,
      companies: Array.from(project.companies),
      roles: Array.from(project.roles),
      avgSalary: project.salaryCount ? Math.round(project.salaryTotal / project.salaryCount) : 0,
      conversion: project.candidates ? Math.round((project.placed / project.candidates) * 100) : 0,
    }))
    .sort((a, b) => b.placed - a.placed || a.name.localeCompare(b.name));
}

function KpiCard({ title, value, icon }) {
  return (
    <div className="bg-transparent/40 border border-cyan-900 rounded-xl p-5 flex items-center justify-between">
      <div>
        <p className="text-xs text-white/60">{title}</p>
        <h3 className="text-xl font-semibold text-white">{value}</h3>
      </div>
      <div className="text-cyan-400 text-xl">{icon}</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="bg-transparent/40 border border-cyan-900 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-cyan-400">{title}</h3>
        <FaCalendarAlt className="text-cyan-400/70" />
      </div>
      {children}
    </div>
  );
}

function SnapshotRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-white/[0.08] bg-[#020617] px-4 py-3">
      <span className="text-sm text-white/55">{label}</span>
      <span className="text-sm font-semibold text-white text-right">{value}</span>
    </div>
  );
}
