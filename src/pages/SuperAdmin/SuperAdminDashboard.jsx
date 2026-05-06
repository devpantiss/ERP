import { createElement, useMemo } from "react";
import {
  Activity,
  ArrowUpRight,
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
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SA_EMPLOYEES, SA_PLACEMENT_DRIVES, SA_PROJECTS } from "./superAdminData";

function getProjectStats(project) {
  const centers = project.centers || [];
  const batches = centers.flatMap((center) => center.batches || []);
  const candidates = batches.flatMap((batch) => batch.candidates || []);
  const placedCandidates = candidates.filter((candidate) => candidate.placementStatus === "Placed").length;
  const activeCandidates = candidates.filter((candidate) => candidate.status === "Active").length;
  const completedCandidates = candidates.filter((candidate) => candidate.status === "Completed").length;
  const employees = SA_EMPLOYEES.filter((employee) => employee.project === project.name);
  const drives = SA_PLACEMENT_DRIVES.filter((drive) => drive.project === project.name);
  const participated = drives.reduce((sum, drive) => sum + drive.participated, 0);
  const selected = drives.reduce((sum, drive) => sum + drive.selected, 0);
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
    batches: batches.length,
    candidates: candidates.length || learners,
    centers: centers.length,
    completedCandidates,
    completedModules,
    employees: employees.length,
    enrolled,
    enrollmentRate,
    learners,
    mobilized,
    moduleRate,
    participated,
    placedCandidates,
    placementDrives: drives.length,
    placementRate,
    selected,
    totalModules,
  };
}

export default function SuperAdminDashboard() {
  const projectStats = useMemo(() => SA_PROJECTS.map(getProjectStats), []);

  const totals = useMemo(
    () =>
      projectStats.reduce(
        (summary, project) => ({
          activeProjects: summary.activeProjects + (project.status === "Active" ? 1 : 0),
          centers: summary.centers + project.centers,
          candidates: summary.candidates + project.candidates,
          employees: summary.employees + project.employees,
          placementDrives: summary.placementDrives + project.placementDrives,
          selected: summary.selected + project.selected,
        }),
        { activeProjects: 0, centers: 0, candidates: 0, employees: 0, placementDrives: 0, selected: 0 }
      ),
    [projectStats]
  );

  const chartData = projectStats.map((project) => ({
    name: project.name,
    Candidates: project.candidates,
    Placed: project.placedCandidates,
    Employees: project.employees,
  }));

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

        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300/80">Portfolio Status</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-black text-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {totals.activeProjects}/{SA_PROJECTS.length} Active Projects
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={FolderKanban} label="Projects" value={SA_PROJECTS.length} sub={`${totals.activeProjects} active`} tone="red" />
        <MetricCard icon={Building2} label="Centers" value={totals.centers} sub="Across all projects" tone="sky" />
        <MetricCard icon={GraduationCap} label="Candidates" value={totals.candidates} sub="Generated records" tone="emerald" />
        <MetricCard icon={Users} label="Employees" value={totals.employees} sub="Mapped staff" tone="violet" />
        <MetricCard icon={Briefcase} label="Selections" value={totals.selected} sub={`${totals.placementDrives} drives`} tone="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-6 backdrop-blur-sm">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white/85">Project Comparison</h2>
              <p className="mt-1 text-xs text-slate-500">Candidates, placed learners, and project employees.</p>
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
                <Bar dataKey="Candidates" fill="#ef4444" radius={[5, 5, 0, 0]} />
                <Bar dataKey="Placed" fill="#10b981" radius={[5, 5, 0, 0]} />
                <Bar dataKey="Employees" fill="#38bdf8" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-6 backdrop-blur-sm">
          <div className="mb-5">
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white/85">Portfolio Health</h2>
            <p className="mt-1 text-xs text-slate-500">Quick scan of operational progress.</p>
          </div>

          <div className="space-y-5">
            {projectStats.map((project) => (
              <div key={project.id} className="rounded-2xl border border-slate-700/50 bg-[#0b1220] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-white">{project.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{project.fundingAgency}</p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${
                      project.status === "Active"
                        ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                        : "border-amber-400/20 bg-amber-500/10 text-amber-300"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                <ProgressRow label="Training Modules" value={project.moduleRate} />
                <ProgressRow label="Mobilization Enrollment" value={project.enrollmentRate} color="bg-sky-400" />
                <ProgressRow label="Placement Selection" value={project.placementRate} color="bg-emerald-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {projectStats.map((project) => (
          <ProjectOverviewCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub, tone }) {
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
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${tones[tone]}`}>
          {createElement(Icon, { size: 18 })}
        </div>
      </div>
      <p className="mt-4 text-3xl font-black text-white">{value.toLocaleString("en-IN")}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{sub}</p>
    </div>
  );
}

function ProjectOverviewCard({ project }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 backdrop-blur-sm transition hover:border-red-500/35 hover:bg-[#151e2f]">
      <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-red-500/10 blur-3xl transition group-hover:bg-red-500/20" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-lg font-black text-white">{project.name}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{project.fundingAgency}</p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-red-200">
          <ArrowUpRight size={15} />
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-2 text-center">
        <MiniStat label="Centers" value={project.centers} />
        <MiniStat label="Batches" value={project.batches} />
        <MiniStat label="Staff" value={project.employees} />
      </div>

      <div className="relative mt-5 rounded-xl border border-slate-700/50 bg-[#0b1220] p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoItem icon={GraduationCap} label="Candidates" value={project.candidates} />
          <InfoItem icon={Briefcase} label="Selected" value={project.selected} />
          <InfoItem icon={Target} label="Attendance" value={`${project.attendanceAvg}%`} />
          <InfoItem icon={CalendarDays} label="Timeline" value={`${formatDate(project.startDate)} - ${formatDate(project.endDate)}`} wide />
        </div>
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
