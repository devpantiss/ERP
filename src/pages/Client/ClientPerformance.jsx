import { BarChart3, Building2, CircleAlert, Target, TrendingUp } from "lucide-react";
import { Header, Stat } from "./ClientDashboard";
import {
  getClientProjects,
  getClientSummary,
  getProjectSummary,
  getStoredClient,
} from "./clientPortalData";

export default function ClientPerformance() {
  const client = getStoredClient();
  const projects = getClientProjects(client.name);
  const summary = getClientSummary(projects);

  return (
    <section className="space-y-7">
      <Header
        eyebrow="Performance"
        title={`${client.name} delivery performance`}
        description="Compare project-level attendance, enrollment, placement conversion, health, and open risk indicators."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={TrendingUp} label="Overall Health" value={`${summary.health}%`} />
        <Stat icon={BarChart3} label="Avg Attendance" value={`${summary.attendanceRate}%`} />
        <Stat icon={Target} label="Avg Placement" value={`${summary.placementRate}%`} />
        <Stat icon={CircleAlert} label="Open Risks" value={summary.grievances} />
      </div>

      <div className="rounded-3xl border border-violet-200/10 bg-[#12071f]/80 p-5 shadow-xl shadow-black/20">
        <h2 className="text-xl font-semibold text-white">Project Scorecard</h2>
        <div className="mt-5 space-y-4">
          {projects.map((project) => {
            const projectSummary = getProjectSummary(project);
            return (
              <div key={project.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                    <p className="mt-1 flex items-center gap-2 text-sm text-white/40">
                      <Building2 size={15} />
                      {projectSummary.centers} centers
                    </p>
                  </div>
                  <span className="rounded-full border border-violet-300/20 bg-violet-500/10 px-3 py-1 text-sm font-semibold text-violet-200">
                    {projectSummary.health}% health
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <Progress label="Enrollment" value={projectSummary.enrollmentRate} />
                  <Progress label="Attendance" value={projectSummary.attendanceRate} />
                  <Progress label="Placement" value={projectSummary.placementRate} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Progress({ label, value }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-white/55">{label}</span>
        <span className="font-semibold text-white">{value}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}
