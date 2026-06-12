import { useMemo, useState } from "react";
import { Activity, Radio, Video, Wifi } from "lucide-react";
import { ProjectCards, WorkspaceHeader } from "../../components/Admin/ProjectWorkspace";
import { buildProjectSummaries } from "../../components/Admin/projectWorkspaceUtils";
import { LIVE_FEEDS } from "./adminPortalData";

const statusStyles = {
  Live: "bg-red-500/10 text-red-300 border-red-400/20",
  Queued: "bg-amber-500/10 text-amber-300 border-amber-400/20",
};

export default function AdminTrainerLiveFeed({
  title = "Live Feed",
  projectTitleSuffix = "Live Feed",
  emptySubtitle = "Select a project to view its live monitoring streams.",
  selectedSubtitle = "Real-time monitoring streams for the selected project.",
}) {
  const [selectedProject, setSelectedProject] = useState(null);

  const projects = useMemo(() => buildProjectSummaries(LIVE_FEEDS), []);
  const projectFeeds = useMemo(
    () =>
      selectedProject
        ? LIVE_FEEDS.filter((feed) => feed.project === selectedProject.name)
        : [],
    [selectedProject]
  );

  const activeFeeds = selectedProject ? projectFeeds : LIVE_FEEDS;
  const liveCount = activeFeeds.filter((feed) => feed.status === "Live").length;

  return (
    <div className="space-y-6">
      <WorkspaceHeader
        title={selectedProject ? `${selectedProject.name} ${projectTitleSuffix}` : title}
        subtitle={selectedProject ? selectedSubtitle : emptySubtitle}
        selectedProject={selectedProject}
        onBack={() => setSelectedProject(null)}
      />

      {!selectedProject ? (
        <ProjectCards projects={projects} onSelect={setSelectedProject} countLabel="Total Streams" />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-700 bg-[#111827] p-4">
              <div className="mb-2 flex items-center gap-2 text-white/60">
                <Radio size={15} className="animate-pulse text-red-400" />
                <span className="text-xs">Streams Live Now</span>
              </div>
              <p className="text-2xl font-semibold text-white">{liveCount}</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-[#111827] p-4">
              <div className="mb-2 flex items-center gap-2 text-white/60">
                <Wifi size={15} className="text-violet-400" />
                <span className="text-xs">Connected Centers</span>
              </div>
              <p className="text-2xl font-semibold text-white">
                {new Set(projectFeeds.map((feed) => feed.center)).size}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-[#111827] p-4">
              <div className="mb-2 flex items-center gap-2 text-white/60">
                <Activity size={15} className="text-emerald-400" />
                <span className="text-xs">Project Streams</span>
              </div>
              <p className="text-2xl font-semibold text-white">{projectFeeds.length}</p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {projectFeeds.map((feed) => (
              <LiveFeedCard key={feed.id} feed={feed} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function LiveFeedCard({ feed }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700 bg-[#111827] transition hover:border-violet-500/30">
      <div className="flex aspect-video items-center justify-center bg-[#0b1220]">
        <div className="text-center text-white/45">
          <Video size={38} className="mx-auto text-violet-400" />
          <p className="mt-2 text-sm">Live monitoring window</p>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-white">{feed.stream}</p>
            <p className="mt-1 text-sm text-white/60">
              {feed.owner} • {feed.role}
            </p>
          </div>
          <span
            className={`rounded-full border px-2.5 py-1 text-xs ${
              statusStyles[feed.status] || "border-slate-600 bg-slate-700/50 text-white/70"
            }`}
          >
            {feed.status}
          </span>
        </div>

        <div className="grid gap-3 text-sm md:grid-cols-3">
          <div className="rounded-xl bg-[#0b1220] p-3">
            <p className="text-xs text-slate-500">Center</p>
            <p className="mt-1 text-white/80">{feed.center}</p>
          </div>
          <div className="rounded-xl bg-[#0b1220] p-3">
            <p className="text-xs text-slate-500">Project</p>
            <p className="mt-1 text-white/80">{feed.project}</p>
          </div>
          <div className="rounded-xl bg-[#0b1220] p-3">
            <p className="text-xs text-slate-500">Started</p>
            <p className="mt-1 text-white/80">{feed.startedAt}</p>
          </div>
        </div>

        <button className="w-full rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-400">
          Open Feed Console
        </button>
      </div>
    </div>
  );
}
