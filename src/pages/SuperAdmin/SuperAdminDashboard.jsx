import { createElement, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarDays,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Target,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEmployeeStore } from "../../stores/employeeStore";
import { usePlacementStore } from "../../stores/placementStore";
import { useProjectStore } from "../../stores/projectStore";
import {
  selectSuperAdminPlacementDrives,
  selectSuperAdminProjectHierarchy,
} from "../../stores/selectors/superAdminSelectors";

function getProjectStats(project, employees, placementDrives) {
  const centers = project.centers || [];
  const batches = centers.flatMap((center) => center.batches || []);
  const candidates = batches.flatMap((batch) => batch.candidates || []);
  const placedCandidates = candidates.filter((candidate) => candidate.placementStatus === "Placed").length;
  const activeCandidates = candidates.filter((candidate) => candidate.status === "Active").length;
  const completedCandidates = candidates.filter((candidate) => candidate.status === "Completed").length;
  const trainedCandidates = candidates.filter(
    (candidate) => candidate.status === "Completed" || candidate.moduleCompletion >= 100
  ).length;
  const certifiedCandidates = candidates.filter(
    (candidate) => candidate.status === "Completed" && candidate.moduleCompletion >= 80 && candidate.attendance >= 75
  ).length;
  const projectEmployees = employees.filter((employee) => employee.projectIds?.includes(project.id));
  const drives = placementDrives.filter((drive) => drive.projectId === project.id);
  const participated = drives.reduce((sum, drive) => sum + drive.participated, 0);
  const selected = drives.reduce((sum, drive) => sum + drive.selected, 0);
  const retained3Months = drives.reduce(
    (sum, drive) =>
      sum +
      (drive.students || []).filter(
        (student, index) => student.status === "Selected" && student.salary && index % 5 !== 0
      ).length,
    0
  );
  const totalModules = centers.reduce((sum, center) => sum + (center.totalModules || 0), 0);
  const completedModules = centers.reduce((sum, center) => sum + (center.completedModules || 0), 0);
  const mobilized = centers.reduce((sum, center) => sum + (center.mobilization?.mobilized || 0), 0);
  const enrolled = centers.reduce((sum, center) => sum + (center.mobilization?.enrolled || 0), 0);
  const learners = batches.reduce((sum, batch) => sum + (batch.learners || 0), 0);
  const attendanceAvg = candidates.length
    ? Math.round(candidates.reduce((sum, candidate) => sum + candidate.attendance, 0) / candidates.length)
    : 0;
  const moduleRate = totalModules ? Math.round((completedModules / totalModules) * 100) : 0;
  const placementRate = participated ? Math.round((selected / participated) * 100) : 0;
  const enrollmentRate = mobilized ? Math.round((enrolled / mobilized) * 100) : 0;

  return {
    ...project,
    attendanceAvg,
    activeCandidates,
    batchRecords: batches,
    batches: batches.length,
    candidates: candidates.length || learners,
    centerRecords: centers,
    centers: centers.length,
    certifiedCandidates,
    completedCandidates,
    completedModules,
    employees: projectEmployees.length,
    enrolled,
    enrollmentRate,
    learners,
    mobilized,
    moduleRate,
    participated,
    placedCandidates,
    placementDrives: drives.length,
    placementRate,
    retained3Months,
    selected,
    totalModules,
    trainedCandidates,
  };
}

function buildDashboardTotals(projects) {
  const totals = projects.reduce(
    (summary, project) => ({
      activeProjects: summary.activeProjects + (project.status === "Active" ? 1 : 0),
      centers: summary.centers + project.centers,
      certifiedCandidates: summary.certifiedCandidates + project.certifiedCandidates,
      candidates: summary.candidates + project.candidates,
      employees: summary.employees + project.employees,
      placementDrives: summary.placementDrives + project.placementDrives,
      retained3Months: summary.retained3Months + project.retained3Months,
      selected: summary.selected + project.selected,
      trainedCandidates: summary.trainedCandidates + project.trainedCandidates,
      participated: summary.participated + project.participated,
      completedModules: summary.completedModules + project.completedModules,
      totalModules: summary.totalModules + project.totalModules,
      mobilized: summary.mobilized + project.mobilized,
      enrolled: summary.enrolled + project.enrolled,
    }),
    {
      activeProjects: 0,
      centers: 0,
      certifiedCandidates: 0,
      candidates: 0,
      completedModules: 0,
      employees: 0,
      enrolled: 0,
      mobilized: 0,
      participated: 0,
      placementDrives: 0,
      retained3Months: 0,
      selected: 0,
      totalModules: 0,
      trainedCandidates: 0,
    }
  );

  return {
    ...totals,
    enrollmentRate: totals.mobilized ? Math.round((totals.enrolled / totals.mobilized) * 100) : 0,
    moduleRate: totals.totalModules ? Math.round((totals.completedModules / totals.totalModules) * 100) : 0,
    placementRate: totals.participated ? Math.round((totals.selected / totals.participated) * 100) : 0,
  };
}

function getCenterChartData(project) {
  if (!project) return [];

  const centers = Array.isArray(project.centers)
    ? project.centers
    : project.centerRecords || [];

  return centers.map((center) => {
    const batches = center.batches || [];
    const candidates = batches.flatMap((batch) => batch.candidates || []);

    return {
      name: center.name,
      Enrolled: center.mobilization?.enrolled || candidates.length || batches.reduce((sum, batch) => sum + (batch.learners || 0), 0),
      Trained: candidates.filter((candidate) => candidate.status === "Completed" || candidate.moduleCompletion >= 100).length,
      Certified: candidates.filter(
        (candidate) => candidate.status === "Completed" && candidate.moduleCompletion >= 80 && candidate.attendance >= 75
      ).length,
    };
  });
}

function getDashboardTargets(totals) {
  return {
    enrolled: Math.max(totals.mobilized, totals.enrolled),
    trained: Math.max(totals.enrolled, totals.trainedCandidates),
    certified: Math.max(totals.trainedCandidates, totals.certifiedCandidates),
    retention: Math.max(totals.selected, totals.retained3Months),
  };
}

function targetPie(achieved, target) {
  return [
    { name: "Achieved", value: achieved },
    { name: "Remaining", value: Math.max(target - achieved, 0) },
  ];
}

function getPortfolioTimeline(projects) {
  const starts = projects.map((project) => new Date(project.startDate).getTime()).filter(Number.isFinite);
  const ends = projects.map((project) => new Date(project.endDate).getTime()).filter(Number.isFinite);
  if (!starts.length || !ends.length) return "Timeline unavailable";
  return `${formatDate(Math.min(...starts))} - ${formatDate(Math.max(...ends))}`;
}

export default function SuperAdminDashboard() {
  const { records: projects, fetchAll: fetchProjects } = useProjectStore();
  const { records: employees, fetchWithAssignments } = useEmployeeStore();
  const { drives, fetchDrives } = usePlacementStore();
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  useEffect(() => {
    fetchProjects();
    fetchWithAssignments();
    fetchDrives();
  }, [fetchDrives, fetchProjects, fetchWithAssignments]);

  const projectHierarchy = useMemo(() => selectSuperAdminProjectHierarchy(projects), [projects]);
  const placementDrives = useMemo(() => selectSuperAdminPlacementDrives(drives), [drives]);
  const projectStats = useMemo(
    () => projectHierarchy.map((project) => getProjectStats(project, employees, placementDrives)),
    [employees, placementDrives, projectHierarchy]
  );
  const selectedProject = useMemo(
    () => projectStats.find((project) => project.id === selectedProjectId),
    [projectStats, selectedProjectId]
  );
  const visibleProjects = useMemo(
    () => (selectedProject ? [selectedProject] : projectStats),
    [projectStats, selectedProject]
  );

  const totals = useMemo(() => buildDashboardTotals(visibleProjects), [visibleProjects]);
  const targets = useMemo(() => getDashboardTargets(totals), [totals]);

  const chartData = selectedProject
    ? getCenterChartData(selectedProject)
    : projectStats.map((project) => ({
        name: project.name,
        Enrolled: project.enrolled,
        Trained: project.trainedCandidates,
        Certified: project.certifiedCandidates,
      }));
  const scopeLabel = selectedProject ? selectedProject.name : "All Projects";
  const portfolioTimeline = getPortfolioTimeline(visibleProjects);

  return (
    <div className="space-y-7 animate-in fade-in duration-500">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-slate-100">
            <LayoutDashboard size={31} className="text-red-500" />
            Super Admin Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/58">
            Project-wide command overview across centers, candidates, staff, training completion, mobilization, and placements.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block min-w-[250px]">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              Dashboard Filter
            </span>
            <select
              value={selectedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
              className="w-full rounded-2xl border border-slate-700/70 bg-[#111827] px-4 py-3 text-sm font-black text-white outline-none transition focus:border-red-400/60"
            >
              <option value="all">All Projects - Cumulative</option>
              {projectStats.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300/80">Portfolio Status</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-black text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {selectedProject ? selectedProject.status : `${totals.activeProjects}/${projectStats.length} Active Projects`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TargetMetricCard
          icon={GraduationCap}
          label="Enrolled"
          value={totals.enrolled}
          target={targets.enrolled}
          sub="Against mobilized target"
          tone="emerald"
        />
        <TargetMetricCard
          icon={Target}
          label="Trained"
          value={totals.trainedCandidates}
          target={targets.trained}
          sub="Against enrolled learners"
          tone="violet"
        />
        <TargetMetricCard
          icon={BadgeCheck}
          label="Certified"
          value={totals.certifiedCandidates}
          target={targets.certified}
          sub="Against trained learners"
          tone="amber"
        />
        <TargetMetricCard
          icon={CalendarDays}
          label="3 Month Retention"
          value={totals.retained3Months}
          target={targets.retention}
          sub="Worked at least 3 months"
          tone="sky"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SimpleMetricCard
          icon={FolderKanban}
          label="Projects"
          value={visibleProjects.length}
          sub={selectedProject ? selectedProject.status : `${totals.activeProjects} active`}
          tone="red"
        />
        <SimpleMetricCard
          icon={Building2}
          label="Centers"
          value={totals.centers}
          sub={selectedProject ? selectedProject.fundingAgency : "Across all projects"}
          tone="sky"
        />
        <SimpleMetricCard
          icon={Users}
          label="Employees"
          value={totals.employees}
          sub="Mapped staff"
          tone="violet"
        />
        <SimpleMetricCard
          icon={Briefcase}
          label="Placements"
          value={totals.selected}
          sub={`${totals.placementDrives} drives`}
          tone="amber"
        />
      </div>

      {!selectedProject ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <ComparisonChart chartData={chartData} scopeLabel={scopeLabel} title="Project Comparison" />

          <div className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-6 backdrop-blur-sm">
            <div className="mb-5">
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white/85">Portfolio Health</h2>
              <p className="mt-1 text-xs text-slate-500">Quick scan of cumulative operational progress.</p>
            </div>

            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-white">Cumulative Portfolio</p>
                  <p className="mt-1 text-xs text-red-200/70">{portfolioTimeline}</p>
                </div>
                <span className="rounded-full border border-red-400/20 bg-red-500/10 px-2.5 py-1 text-[10px] font-black text-red-200">
                  ALL
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <MiniStat label="Projects" value={visibleProjects.length} />
                <MiniStat label="Centers" value={totals.centers} />
                <MiniStat label="Staff" value={totals.employees} />
              </div>
              <ProgressRow label="Training Modules" value={totals.moduleRate} />
              <ProgressRow label="Mobilization Enrollment" value={totals.enrollmentRate} color="bg-sky-400" />
              <ProgressRow label="Placement Selection" value={totals.placementRate} color="bg-emerald-400" />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-6 backdrop-blur-sm">
              <div className="mb-5">
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white/85">Project Card</h2>
                <p className="mt-1 text-xs text-slate-500">Timeline, project details, and operational health.</p>
              </div>
              <ProjectHealthCard project={selectedProject} />
            </div>

            <ComparisonChart chartData={chartData} scopeLabel={scopeLabel} title="Center Comparison" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ProjectProgressChart project={selectedProject} />
            <PlacementFunnelChart project={selectedProject} />
          </div>
        </div>
      )}
    </div>
  );
}

function ComparisonChart({ chartData, scopeLabel, title }) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-6 backdrop-blur-sm">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white/85">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">{scopeLabel}: enrolled, trained, and certified learners.</p>
        </div>
        <Activity size={20} className="text-red-400" />
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
              contentStyle={{
                background: "#0f172a",
                border: "1px solid rgba(148, 163, 184, 0.25)",
                borderRadius: "14px",
                color: "#fff",
              }}
            />
            <Bar dataKey="Enrolled" fill="#10b981" radius={[5, 5, 0, 0]} />
            <Bar dataKey="Trained" fill="#8b5cf6" radius={[5, 5, 0, 0]} />
            <Bar dataKey="Certified" fill="#f59e0b" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ProjectProgressChart({ project }) {
  const retentionRate = project.selected ? Math.round((project.retained3Months / project.selected) * 100) : 0;
  const data = [
    { name: "Training", Rate: project.moduleRate },
    { name: "Enrollment", Rate: project.enrollmentRate },
    { name: "Placement", Rate: project.placementRate },
    { name: "Retention", Rate: retentionRate },
  ];

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-6 backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white/85">Project Progress Rates</h2>
        <p className="mt-1 text-xs text-slate-500">Training, enrollment, placement, and retention performance.</p>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip
              cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
              contentStyle={{
                background: "#0f172a",
                border: "1px solid rgba(148, 163, 184, 0.25)",
                borderRadius: "14px",
                color: "#fff",
              }}
            />
            <Bar dataKey="Rate" fill="#ef4444" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function PlacementFunnelChart({ project }) {
  const pending = Math.max(project.participated - project.selected, 0);
  const retained = project.retained3Months;
  const placedNotRetained = Math.max(project.selected - retained, 0);
  const data = [
    { name: "Retained 3 Months", value: retained, fill: "#38bdf8" },
    { name: "Placed", value: placedNotRetained, fill: "#10b981" },
    { name: "Not Selected", value: pending, fill: "#334155" },
  ];

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-6 backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white/85">Placement Retention Mix</h2>
        <p className="mt-1 text-xs text-slate-500">Participated learners split by selected and retained outcomes.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-[220px_1fr] sm:items-center">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} innerRadius={58} outerRadius={88} dataKey="value" stroke="none">
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                  borderRadius: "14px",
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between rounded-xl border border-slate-700/50 bg-[#0b1220] px-4 py-3">
              <span className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                {item.name}
              </span>
              <span className="text-sm font-black text-white">{item.value.toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SimpleMetricCard({ icon: Icon, label, value, sub, tone }) {
  const tones = {
    red: "border-red-400/20 bg-red-500/10 text-red-300",
    sky: "border-sky-400/20 bg-sky-500/10 text-sky-300",
    emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
    violet: "border-violet-400/20 bg-violet-500/10 text-violet-300",
    amber: "border-amber-400/20 bg-amber-500/10 text-amber-300",
  };

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${tones[tone] || tones.red}`}>
          {createElement(Icon, { size: 18 })}
        </div>
      </div>
      <p className="mt-4 text-3xl font-black text-white">{value.toLocaleString("en-IN")}</p>
      <p className="mt-1 truncate text-xs font-semibold text-slate-500">{sub}</p>
    </div>
  );
}

function TargetMetricCard({ icon: Icon, label, value, target, sub, tone }) {
  const tones = {
    red: { card: "border-red-400/20 bg-red-500/10 text-red-300", fill: "#ef4444" },
    sky: { card: "border-sky-400/20 bg-sky-500/10 text-sky-300", fill: "#38bdf8" },
    emerald: { card: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300", fill: "#10b981" },
    violet: { card: "border-violet-400/20 bg-violet-500/10 text-violet-300", fill: "#8b5cf6" },
    amber: { card: "border-amber-400/20 bg-amber-500/10 text-amber-300", fill: "#f59e0b" },
  };
  const palette = tones[tone] || tones.red;
  const safeTarget = Math.max(target || value || 0, 0);
  const percent = safeTarget ? Math.min(Math.round((value / safeTarget) * 100), 100) : 0;
  const pie = targetPie(value, safeTarget);

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${palette.card}`}>
          {createElement(Icon, { size: 18 })}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="h-20 w-20 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pie} innerRadius={26} outerRadius={36} dataKey="value" stroke="none">
                <Cell fill={palette.fill} />
                <Cell fill="#1f2937" />
              </Pie>
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-200 text-[10px] font-black"
              >
                {percent}%
              </text>
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="min-w-0">
          <p className="text-2xl font-black text-white">{value.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Target: {safeTarget.toLocaleString("en-IN")}</p>
          <p className="mt-1 truncate text-xs font-semibold text-slate-500">{sub}</p>
        </div>
      </div>
    </div>
  );
}

function ProjectHealthCard({ project }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-[#0b1220] p-5 transition hover:border-red-500/35 hover:bg-[#10192a]">
      <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-red-500/10 blur-3xl transition group-hover:bg-red-500/20" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-white">{project.name}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{project.fundingAgency}</p>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
            <CalendarDays size={12} className="text-red-300" />
            {formatDate(project.startDate)} - {formatDate(project.endDate)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black ${
            project.status === "Active"
              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
              : "border-amber-400/20 bg-amber-500/10 text-amber-300"
          }`}
        >
          {project.status}
        </span>
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-2 text-center">
        <MiniStat label="Centers" value={project.centers} />
        <MiniStat label="Batches" value={project.batches} />
        <MiniStat label="Staff" value={project.employees} />
      </div>

      <div className="relative mt-5 rounded-xl border border-slate-700/50 bg-[#0b1220] p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoItem icon={GraduationCap} label="Enrolled" value={project.enrolled} />
          <InfoItem icon={Target} label="Trained" value={project.trainedCandidates} />
          <InfoItem icon={BadgeCheck} label="Certified" value={project.certifiedCandidates} />
          <InfoItem icon={Briefcase} label="Placements" value={project.selected} />
          <InfoItem icon={CalendarDays} label="3 Month Retention" value={project.retained3Months} />
          <InfoItem icon={Target} label="Attendance" value={`${project.attendanceAvg}%`} />
        </div>
      </div>

      <div className="relative mt-5">
        <ProgressRow label="Training Modules" value={project.moduleRate} />
        <ProgressRow label="Mobilization Enrollment" value={project.enrollmentRate} color="bg-sky-400" />
        <ProgressRow label="Placement Selection" value={project.placementRate} color="bg-emerald-400" />
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-[#0b1220] px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, wide }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
        {createElement(Icon, { size: 13, className: "text-red-300" })}
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{typeof value === "number" ? value.toLocaleString("en-IN") : value}</p>
    </div>
  );
}

function ProgressRow({ label, value, color = "bg-red-400" }) {
  return (
    <div className="mt-4">
      <div className="mb-1.5 flex items-center justify-between text-[11px]">
        <span className="font-bold text-slate-400">{label}</span>
        <span className="font-black text-white">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-700/60">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

function formatDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}
