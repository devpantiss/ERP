import { Activity, Radio, Video, Wifi } from "lucide-react";
import { LIVE_FEEDS } from "./adminPortalData";

const statusStyles = {
  Live: "bg-red-500/10 text-red-300 border-red-400/20",
  Queued: "bg-amber-500/10 text-amber-300 border-amber-400/20",
};

export default function AdminTrainerLiveFeed() {
  const liveCount = LIVE_FEEDS.filter((feed) => feed.status === "Live").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Live Feed</h1>
        <p className="mt-1 text-sm text-white/60">
          Real-time monitoring across training, placement, mobilization, and admin supervision streams.
        </p>
      </div>

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
          <p className="text-2xl font-semibold text-white">{new Set(LIVE_FEEDS.map((feed) => feed.center)).size}</p>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-[#111827] p-4">
          <div className="mb-2 flex items-center gap-2 text-white/60">
            <Activity size={15} className="text-emerald-400" />
            <span className="text-xs">Monitored Projects</span>
          </div>
          <p className="text-2xl font-semibold text-white">{new Set(LIVE_FEEDS.map((feed) => feed.project)).size}</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {LIVE_FEEDS.map((feed) => (
          <div
            key={feed.id}
            className="overflow-hidden rounded-2xl border border-slate-700 bg-[#111827] transition hover:border-violet-500/30"
          >
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
                    statusStyles[feed.status] || "bg-slate-700/50 text-white/70 border-slate-600"
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
        ))}
      </div>
    </div>
  );
}
