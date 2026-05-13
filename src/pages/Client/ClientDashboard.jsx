import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  CircleAlert,
  FolderKanban,
  GraduationCap,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  getClientProjects,
  getClientSummary,
  getProjectSummary,
  getStoredClient,
} from "./clientPortalData";

export default function ClientDashboard() {
  const client = getStoredClient();
  const projects = getClientProjects(client.name);
  const summary = getClientSummary(projects);

  return (
    <section className="space-y-7">
      <Header
        eyebrow="Client Dashboard"
        title={`${client.name} project tracking`}
        description="A focused view of project delivery, center performance, enrollment, attendance, placement, and open delivery risks."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={FolderKanban} label="Projects" value={summary.projects} />
        <Stat icon={Building2} label="Centers" value={summary.centers} />
        <Stat icon={GraduationCap} label="Candidates" value={summary.candidates} />
        <Stat icon={TrendingUp} label="Portfolio Health" value={`${summary.health}%`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-violet-200/10 bg-[#12071f]/80 p-5 shadow-xl shadow-black/20">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Tracked Projects</h2>
              <p className="text-sm text-white/45">Projects attached to this client account.</p>
            </div>
            <Link
              to="/client/projects"
              className="inline-flex items-center gap-2 rounded-2xl border border-violet-300/20 px-4 py-2 text-sm text-violet-200 hover:bg-violet-500/10"
            >
              View all
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="space-y-3">
            {projects.map((project) => (
              <ProjectRow key={project.id} project={project} />
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-violet-200/10 bg-[#12071f]/80 p-5 shadow-xl shadow-black/20">
          <h2 className="text-xl font-semibold text-white">Portfolio Signals</h2>
          <div className="mt-5 space-y-4">
            <Signal
              icon={CheckCircle2}
              label="Average attendance"
              value={`${summary.attendanceRate}%`}
              tone="text-emerald-300"
            />
            <Signal
              icon={TrendingUp}
              label="Average placement"
              value={`${summary.placementRate}%`}
              tone="text-violet-200"
            />
            <Signal
              icon={CircleAlert}
              label="Open grievance items"
              value={summary.grievances}
              tone="text-amber-300"
            />
            <Signal icon={Users} label="Delivery staff" value={summary.employees} tone="text-sky-200" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Header({ eyebrow, title, description }) {
  return (
    <div className="rounded-3xl border border-violet-200/10 bg-[#12071f]/75 p-6 shadow-xl shadow-black/20">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">{title}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">{description}</p>
    </div>
  );
}

export function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-violet-200/10 bg-white/[0.04] p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-500/15">
        <Icon size={20} className="text-violet-200" />
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="text-sm text-white/45">{label}</p>
    </div>
  );
}

function ProjectRow({ project }) {
  const summary = getProjectSummary(project);

  return (
    <Link
      to={`/client/projects/${project.id}`}
      className="grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-violet-300/35 hover:bg-violet-500/10 md:grid-cols-[1fr_auto]"
    >
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold text-white">{project.name}</h3>
          <span className="rounded-full border border-violet-300/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
            {project.status}
          </span>
        </div>
        <p className="mt-2 text-sm text-white/45">
          {summary.centers} centers, {summary.candidates} candidates, {summary.employees} staff
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <Mini label="Health" value={`${summary.health}%`} />
        <Mini label="Attendance" value={`${summary.attendanceRate}%`} />
        <Mini label="Placement" value={`${summary.placementRate}%`} />
      </div>
    </Link>
  );
}

function Mini({ label, value }) {
  return (
    <div className="min-w-[92px] rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2">
      <p className="text-sm font-semibold text-white">{value}</p>
      <p className="text-[11px] text-white/35">{label}</p>
    </div>
  );
}

function Signal({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center gap-3">
        <Icon size={19} className={tone} />
        <span className="text-sm text-white/60">{label}</span>
      </div>
      <span className="text-lg font-semibold text-white">{value}</span>
    </div>
  );
}
