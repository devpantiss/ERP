import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  MonitorPlay,
  PlayCircle,
  Radio,
  Video,
} from "lucide-react";
import { Header } from "./ClientDashboard";
import { getClientLiveFeeds, getClientProjects, getStoredClient } from "./clientPortalData";

const statusStyles = {
  Live: "border-red-400/25 bg-red-500/10 text-red-200",
  Queued: "border-amber-400/25 bg-amber-500/10 text-amber-200",
  Recorded: "border-cyan-400/25 bg-cyan-500/10 text-cyan-200",
};

const dayOptions = [
  { offset: 0, label: "Today" },
  { offset: 1, label: "Yesterday" },
  { offset: 2, label: "2 days ago" },
];

const feedVisuals = [1, 2, 3, 4, 5, 6, 7, 9, 11];

const formatArchiveDate = (offset) => {
  const date = new Date();
  date.setDate(date.getDate() - offset);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const buildArchiveFeeds = (feeds) =>
  feeds.flatMap((feed, feedIndex) =>
    dayOptions.map((day) => {
      const isToday = day.offset === 0;
      const seed = feed.center.length + feed.project.length + feedIndex * 9 + day.offset * 5;

      return {
        ...feed,
        id: `${feed.id}-${day.offset}`,
        sourceFeedId: feed.id,
        archiveOffset: day.offset,
        dateLabel: formatArchiveDate(day.offset),
        status: isToday ? feed.status : "Recorded",
        stream: isToday ? feed.stream : `${feed.stream} recording`,
        thumbnail: `/images/client-gallery/${feedVisuals[seed % feedVisuals.length]}.png`,
        duration: isToday && feed.status === "Live" ? "Running" : `${45 + (seed % 3) * 15} min`,
      };
    })
  );

export default function ClientLiveFeed() {
  const client = getStoredClient();
  const projects = getClientProjects(client.name);
  const projectNames = useMemo(() => new Set(projects.map((project) => project.name)), [projects]);
  const feeds = useMemo(
    () => getClientLiveFeeds(client.name).filter((feed) => projectNames.has(feed.project)),
    [client.name, projectNames]
  );
  const archiveFeeds = useMemo(() => buildArchiveFeeds(feeds), [feeds]);
  const centers = useMemo(() => [...new Set(archiveFeeds.map((feed) => feed.center))], [archiveFeeds]);
  const [selectedCenter, setSelectedCenter] = useState(centers[0] || "");
  const [selectedDay, setSelectedDay] = useState(0);
  const centerFeeds = archiveFeeds.filter(
    (feed) => feed.center === selectedCenter && feed.archiveOffset === selectedDay
  );
  const [selectedFeedId, setSelectedFeedId] = useState("");
  const selectedFeed =
    centerFeeds.find((feed) => feed.id === selectedFeedId) ||
    centerFeeds[0] ||
    archiveFeeds[0];
  const liveCount = feeds.filter((feed) => feed.status === "Live").length;
  const recordedCount = archiveFeeds.filter((feed) => feed.status === "Recorded").length;

  return (
    <section className="space-y-6">
      <Header
        eyebrow="Live Feed"
        title={`${client.name} live monitoring`}
        description="View active center streams and recent recordings for projects linked to your account."
      />

      {selectedFeed ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard icon={Radio} label="Live now" value={liveCount} tone="text-red-300" />
            <SummaryCard icon={MapPin} label="Centers" value={centers.length} tone="text-cyan-300" />
            <SummaryCard icon={MonitorPlay} label="Recordings" value={recordedCount} tone="text-violet-300" />
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="overflow-hidden rounded-3xl border border-violet-200/10 bg-[#10061d]/85 shadow-xl shadow-black/20">
              <div className="flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-semibold text-white">{selectedFeed.stream}</h2>
                  <p className="mt-1 text-sm text-white/45">
                    {selectedFeed.project} • {selectedFeed.center} • {selectedFeed.dateLabel}
                  </p>
                </div>
                <StatusBadge status={selectedFeed.status} />
              </div>

              <div className="relative aspect-video overflow-hidden bg-[#05020a]">
                <img
                  src={selectedFeed.thumbnail}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-45"
                />
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(5,2,10,0.78),rgba(5,2,10,0.36)_55%,rgba(5,2,10,0.82))]" />
                <div className="relative flex h-full items-center justify-center p-6 text-center">
                  <div>
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-black/35 backdrop-blur">
                      {selectedFeed.status === "Live" ? (
                        <Video size={34} className="text-red-100" />
                      ) : (
                        <PlayCircle size={38} className="text-cyan-100" />
                      )}
                    </div>
                    <p className="mt-5 text-2xl font-semibold text-white">
                      {selectedFeed.status === "Live" ? "Live stream" : "Recorded session"}
                    </p>
                    <p className="mt-2 text-sm text-white/55">{selectedFeed.duration}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 border-t border-white/10 p-5 sm:grid-cols-3">
                <FeedDetail label="Trainer" value={selectedFeed.owner} />
                <FeedDetail label="Role" value={selectedFeed.role} />
                <FeedDetail label="Started" value={selectedFeed.startedAt} />
              </div>

              <div className="flex flex-col gap-3 border-t border-white/10 p-5 sm:flex-row sm:items-center sm:justify-end">
                {selectedFeed.status === "Live" ? (
                  <Link
                    to={`/live/${selectedFeed.sourceFeedId || selectedFeed.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400"
                  >
                    Open viewer
                    <ArrowUpRight size={16} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    <PlayCircle size={16} />
                    Play recording
                  </button>
                )}
              </div>
            </section>

            <aside className="space-y-4">
              <section className="rounded-3xl border border-violet-200/10 bg-[#10061d]/85 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Center</p>
                <div className="mt-3 grid gap-2">
                  {centers.map((center) => (
                    <button
                      key={center}
                      type="button"
                      onClick={() => {
                        setSelectedCenter(center);
                        setSelectedFeedId("");
                      }}
                      className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                        selectedCenter === center
                          ? "border-cyan-300/35 bg-cyan-500/10 text-white"
                          : "border-white/10 bg-white/[0.035] text-white/60 hover:border-cyan-300/25"
                      }`}
                    >
                      <span className="truncate text-sm font-semibold">{center}</span>
                      <MapPin size={15} className="shrink-0" />
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-violet-200/10 bg-[#10061d]/85 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Feed Date</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {dayOptions.map((day) => (
                    <button
                      key={day.offset}
                      type="button"
                      onClick={() => {
                        setSelectedDay(day.offset);
                        setSelectedFeedId("");
                      }}
                      className={`rounded-2xl border px-2 py-3 text-center transition ${
                        selectedDay === day.offset
                          ? "border-violet-300/40 bg-violet-500/15 text-white"
                          : "border-white/10 bg-white/[0.035] text-white/55 hover:border-violet-300/25"
                      }`}
                    >
                      <CalendarDays size={15} className="mx-auto mb-1.5" />
                      <span className="block text-xs font-semibold">{day.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-violet-200/10 bg-[#10061d]/85 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Available Feeds</p>
                <div className="mt-3 space-y-2">
                  {centerFeeds.map((feed) => (
                    <button
                      key={feed.id}
                      type="button"
                      onClick={() => setSelectedFeedId(feed.id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                        selectedFeed.id === feed.id
                          ? "border-violet-300/40 bg-violet-500/15"
                          : "border-white/10 bg-white/[0.035] hover:border-violet-300/25"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-white">{feed.stream}</span>
                        <span className="mt-1 block truncate text-xs text-white/40">
                          {feed.project} • {feed.startedAt}
                        </span>
                      </span>
                      <StatusBadge status={feed.status} compact />
                    </button>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </>
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

function SummaryCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-3xl border border-violet-200/10 bg-[#12071f]/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-white/45">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
        </div>
        <Icon size={20} className={tone} />
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
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border ${
        compact ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs"
      } font-semibold ${statusStyles[status] || "border-white/10 bg-white/5 text-white/65"}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {status}
    </span>
  );
}
