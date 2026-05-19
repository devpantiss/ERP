import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  CircleDot,
  MapPin,
  PauseCircle,
  PlayCircle,
  Radio,
  Video,
  Wifi,
} from "lucide-react";
import { LIVE_FEEDS } from "../Admin/adminPortalData";
import { Header } from "./ClientDashboard";
import { getClientProjects, getStoredClient } from "./clientPortalData";

const statusStyles = {
  Live: "border-red-400/25 bg-red-500/10 text-red-200",
  Queued: "border-amber-400/25 bg-amber-500/10 text-amber-200",
  Recorded: "border-cyan-400/25 bg-cyan-500/10 text-cyan-200",
};

const archiveSlots = [
  { offset: 0, label: "Today", sessions: ["09:00 AM", "11:30 AM", "03:15 PM"] },
  { offset: 1, label: "Yesterday", sessions: ["10:00 AM", "01:45 PM", "04:30 PM"] },
  { offset: 2, label: "2 days ago", sessions: ["09:30 AM", "12:15 PM", "02:45 PM"] },
];

const formatArchiveDate = (offset) => {
  const date = new Date();
  date.setDate(date.getDate() - offset);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const buildArchiveFeeds = (feeds) =>
  feeds.flatMap((feed) =>
    archiveSlots.flatMap((slot) =>
      slot.sessions.map((time, index) => ({
        ...feed,
        id: `${feed.id}-archive-${slot.offset}-${index}`,
        sourceFeedId: feed.id,
        archiveOffset: slot.offset,
        archiveLabel: slot.label,
        dateLabel: formatArchiveDate(slot.offset),
        startedAt: time,
        status: slot.offset === 0 && index === 0 && feed.status === "Live" ? "Live" : "Recorded",
        stream: `${feed.stream} ${slot.offset === 0 && index === 0 && feed.status === "Live" ? "Live" : "Recording"}`,
      }))
    )
  );

export default function ClientLiveFeed() {
  const client = getStoredClient();
  const projects = getClientProjects(client.name);
  const projectNames = useMemo(() => new Set(projects.map((project) => project.name)), [projects]);
  const feeds = useMemo(
    () => LIVE_FEEDS.filter((feed) => projectNames.has(feed.project)),
    [projectNames]
  );
  const archiveFeeds = useMemo(() => buildArchiveFeeds(feeds), [feeds]);
  const centers = useMemo(
    () =>
      [...new Set(archiveFeeds.map((feed) => feed.center))].map((center) => ({
        name: center,
        feeds: archiveFeeds.filter((feed) => feed.center === center),
      })),
    [archiveFeeds]
  );
  const [selectedCenter, setSelectedCenter] = useState(centers[0]?.name || "");
  const [selectedDay, setSelectedDay] = useState(0);
  const [playbackFeedId, setPlaybackFeedId] = useState("");
  const centerFeeds = archiveFeeds.filter(
    (feed) => feed.center === selectedCenter && feed.archiveOffset === selectedDay
  );
  const [selectedFeedId, setSelectedFeedId] = useState("");
  const selectedFeed =
    centerFeeds.find((feed) => feed.id === selectedFeedId) ||
    centerFeeds[0] ||
    archiveFeeds[0];
  const isRecordingPlaying = selectedFeed?.status === "Recorded" && playbackFeedId === selectedFeed.id;
  const liveCount = feeds.filter((feed) => feed.status === "Live").length;
  const centerCount = new Set(feeds.map((feed) => feed.center)).size;
  const archiveCount = archiveFeeds.filter((feed) => feed.status === "Recorded").length;

  return (
    <section className="space-y-6">
      <Header
        eyebrow="Live Feed"
        title={`${client.name} live monitoring`}
        description="View center-wise live streams and recorded feed videos from the last three days for projects linked to your account."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <FeedMetric icon={Radio} label="Live streams" value={liveCount} tone="text-red-300" />
        <FeedMetric icon={Wifi} label="Connected centers" value={centerCount} tone="text-cyan-300" />
        <FeedMetric icon={Activity} label="3-day recordings" value={archiveCount} tone="text-violet-300" />
      </div>

      {selectedFeed ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_410px]">
          <section className="overflow-hidden rounded-3xl border border-violet-200/10 bg-[#10061d]/85 shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
                  Center Feed Console
                </p>
                <h2 className="mt-1 truncate text-xl font-semibold text-white">{selectedFeed.stream}</h2>
              </div>
              <StatusBadge status={selectedFeed.status} />
            </div>

            <div className="relative aspect-video overflow-hidden bg-[#05020a]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.3),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(34,211,238,0.18),transparent_30%)]" />
              <div className="absolute inset-0 opacity-[0.18] bg-[linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-size-[44px_44px]" />
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent" />
              <div className="absolute inset-5 rounded-[1.5rem] border border-white/10" />
              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur">
                <CircleDot
                  size={14}
                  className={selectedFeed.status === "Live" ? "animate-pulse text-red-300" : "text-cyan-300"}
                />
                {selectedFeed.status === "Live" ? "Live now" : "Recorded feed"}
              </div>
              <div className="absolute right-5 top-5 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-xs text-white/65 backdrop-blur">
                {selectedFeed.archiveLabel} • {selectedFeed.startedAt}
              </div>

              <div className="relative flex h-full items-center justify-center p-6 text-center">
                <div>
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-violet-300/25 bg-violet-500/15 shadow-2xl shadow-violet-950/60">
                    {selectedFeed.status === "Live" ? (
                      <Video size={42} className="text-violet-100" />
                    ) : isRecordingPlaying ? (
                      <PauseCircle size={46} className="text-cyan-100" />
                    ) : (
                      <PlayCircle size={46} className="text-cyan-100" />
                    )}
                  </div>
                  <p className="mt-5 text-2xl font-semibold text-white">{selectedFeed.stream}</p>
                  <p className="mt-2 text-sm text-white/50">
                    {selectedFeed.project} • {selectedFeed.center} • {selectedFeed.dateLabel}
                  </p>
                  <div className="mx-auto mt-5 h-1.5 max-w-xs overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${
                        selectedFeed.status === "Live"
                          ? "w-2/3 bg-red-300"
                          : isRecordingPlaying
                            ? "w-4/5 bg-cyan-300"
                            : "w-1/3 bg-cyan-300"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 border-t border-white/10 p-5 md:grid-cols-4">
              <FeedDetail label="Project" value={selectedFeed.project} />
              <FeedDetail label="Center" value={selectedFeed.center} />
              <FeedDetail label="Owner" value={selectedFeed.owner} />
              <FeedDetail label="Role" value={selectedFeed.role} />
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-white/45">
                {selectedFeed.status === "Live"
                  ? "Open the dedicated live viewer for full-screen monitoring and stream controls."
                  : "Recorded feed is available for client tracking within the last three days."}
              </p>
              {selectedFeed.status === "Live" ? (
                <Link
                  to={`/live/${selectedFeed.sourceFeedId || selectedFeed.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400"
                >
                  Open live viewer
                  <ArrowUpRight size={16} />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setPlaybackFeedId(isRecordingPlaying ? "" : selectedFeed.id)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  {isRecordingPlaying ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                  {isRecordingPlaying ? "Pause recording" : "View recording"}
                </button>
              )}
            </div>
          </section>

          <aside className="space-y-3">
            <div className="rounded-3xl border border-violet-200/10 bg-[#10061d]/85 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Center Wise Feeds</p>
              <div className="mt-4 grid gap-2">
                {centers.map((center) => {
                  const liveFeeds = center.feeds.filter((feed) => feed.status === "Live").length;
                  return (
                    <button
                      key={center.name}
                      type="button"
                      onClick={() => {
                        setSelectedCenter(center.name);
                        setSelectedFeedId("");
                      }}
                      className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                        selectedCenter === center.name
                          ? "border-cyan-300/35 bg-cyan-500/10"
                          : "border-white/10 bg-white/[0.035] hover:border-cyan-300/25"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <MapPin size={15} className="shrink-0 text-cyan-300" />
                        <span className="truncate text-sm font-semibold text-white">{center.name}</span>
                      </span>
                      <span className="text-xs text-white/45">{liveFeeds} live</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-violet-200/10 bg-[#10061d]/85 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Last 3 Days</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {archiveSlots.map((slot) => (
                  <button
                    key={slot.offset}
                    type="button"
                    onClick={() => {
                      setSelectedDay(slot.offset);
                      setSelectedFeedId("");
                    }}
                    className={`rounded-2xl border px-3 py-3 text-center transition ${
                      selectedDay === slot.offset
                        ? "border-violet-300/40 bg-violet-500/15 text-white"
                        : "border-white/10 bg-white/[0.035] text-white/55 hover:border-violet-300/25"
                    }`}
                  >
                    <CalendarDays size={15} className="mx-auto mb-1.5" />
                    <span className="block text-xs font-semibold">{slot.label}</span>
                    <span className="mt-1 block text-[10px] text-white/35">{formatArchiveDate(slot.offset)}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 space-y-3">
                {centerFeeds.map((feed) => (
                  <button
                    key={feed.id}
                    type="button"
                    onClick={() => setSelectedFeedId(feed.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedFeed.id === feed.id
                        ? "border-violet-300/40 bg-violet-500/15"
                        : "border-white/10 bg-white/[0.035] hover:border-violet-300/25 hover:bg-white/[0.055]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{feed.stream}</p>
                        <p className="mt-1 text-xs text-white/45">
                          {feed.owner} • {feed.center}
                        </p>
                      </div>
                      <StatusBadge status={feed.status} compact />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-white/40">
                      <span>{feed.project}</span>
                      <span>{feed.dateLabel} • {feed.startedAt}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <div className="rounded-3xl border border-violet-200/10 bg-[#10061d]/85 p-8 text-center">
          <Video size={38} className="mx-auto text-violet-300" />
          <h2 className="mt-4 text-xl font-semibold text-white">No live feeds assigned</h2>
          <p className="mt-2 text-sm text-white/45">
            Live monitoring streams will appear here when a project feed is started for this client.
          </p>
        </div>
      )}
    </section>
  );
}

function FeedMetric({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-3xl border border-violet-200/10 bg-[#12071f]/80 p-5 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/45">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055]">
          <Icon size={21} className={tone} />
        </div>
      </div>
    </div>
  );
}

function FeedDetail({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-white/35">{label}</p>
      <p className="mt-2 truncate text-sm font-semibold text-white/80">{value}</p>
    </div>
  );
}

function StatusBadge({ status, compact = false }) {
  const dotColor = status === "Live" ? "bg-red-300" : status === "Recorded" ? "bg-cyan-300" : "bg-amber-300";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${
        compact ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs"
      } font-semibold ${statusStyles[status] || "border-white/10 bg-white/5 text-white/65"}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {status}
    </span>
  );
}
