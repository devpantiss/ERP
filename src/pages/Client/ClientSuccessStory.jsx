import { useState } from "react";
import {
  Award,
  Building2,
  CalendarDays,
  CheckCircle2,
  Film,
  GraduationCap,
  PlayCircle,
  Quote,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  buildClientProjectSnapshot,
  getClientProjects,
  getClientSummary,
  getStoredClient,
} from "./clientPortalData";

const STORY_IMAGES = [
  "/images/client-gallery/1.png",
  "/images/client-gallery/7.png",
  "/images/client-gallery/9.png",
];

const TESTIMONIAL_VIDEOS = [
  {
    id: "learner-outcome",
    title: "Learner Outcome",
    meta: "Placement journey",
    poster: "/images/client-gallery/1.png",
    src: "/videos/client-success-story.mp4",
    duration: "02:10",
  },
  {
    id: "skill-lab",
    title: "Skill Lab Practice",
    meta: "Hands-on training",
    poster: "/images/client-gallery/7.png",
    src: "/videos/client-success-story.mp4",
    duration: "01:42",
  },
  {
    id: "field-visit",
    title: "Field Demonstration",
    meta: "Equipment exposure",
    poster: "/images/client-gallery/9.png",
    src: "/videos/client-success-story.mp4",
    duration: "02:35",
  },
  {
    id: "employer-connect",
    title: "Employer Connect",
    meta: "Interview readiness",
    poster: "/images/client-gallery/3.png",
    src: "/videos/client-success-story.mp4",
    duration: "01:58",
  },
  {
    id: "certification",
    title: "Certification Moment",
    meta: "Assessment success",
    poster: "/images/client-gallery/5.png",
    src: "/videos/client-success-story.mp4",
    duration: "01:25",
  },
  {
    id: "community-impact",
    title: "Community Impact",
    meta: "Batch achievement",
    poster: "/images/client-gallery/11.png",
    src: "/videos/client-success-story.mp4",
    duration: "02:04",
  },
];

export default function ClientSuccessStory() {
  const [activeVideo, setActiveVideo] = useState(TESTIMONIAL_VIDEOS[0]);
  const client = getStoredClient();
  const projects = getClientProjects(client.name);
  const summary = getClientSummary(projects);
  const featuredProject = projects[0];
  const snapshot = featuredProject ? buildClientProjectSnapshot(featuredProject) : null;
  const events = buildEvents(snapshot);

  return (
    <section className="space-y-7">
      <section className="overflow-hidden rounded-3xl border border-violet-200/10 bg-[#12071f]/80 shadow-xl shadow-black/20">
        <div className="grid gap-0 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
              Success Story
            </p>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-white md:text-5xl">
              Skills training converted into measurable employment outcomes.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-white/55 md:text-base">
              A concise client-facing testimonial view covering project achievements, delivery events,
              learner progress, placement outcomes, and visual evidence from the field.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <HeroMetric label="Project" value={featuredProject?.name || "Portfolio"} />
              <HeroMetric label="Centers" value={summary.centers} />
              <HeroMetric label="Health" value={`${summary.health}%`} />
            </div>
          </div>

          <div className="grid min-h-[360px] grid-cols-2 gap-2 bg-black/20 p-2">
            <img
              src={STORY_IMAGES[2]}
              alt=""
              className="col-span-2 h-56 w-full rounded-2xl object-cover md:h-72 xl:h-full"
            />
            <img src={STORY_IMAGES[0]} alt="" className="h-36 w-full rounded-2xl object-cover xl:hidden" />
            <img src={STORY_IMAGES[1]} alt="" className="h-36 w-full rounded-2xl object-cover xl:hidden" />
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Learners Covered" value={summary.candidates} />
        <StatCard icon={GraduationCap} label="Certified" value={snapshot?.certified || 0} />
        <StatCard icon={TrendingUp} label="Placed" value={snapshot?.placed || 0} />
        <StatCard icon={Target} label="Placement Rate" value={`${summary.placementRate}%`} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl border border-violet-200/10 bg-[#12071f]/80 p-6 shadow-xl shadow-black/20">
          <Quote size={28} className="text-violet-300" />
          <blockquote className="mt-5 text-2xl font-semibold leading-snug text-white">
            The project created a clear pathway from classroom learning to workplace readiness, with
            visible confidence among learners and stronger center-level delivery discipline.
          </blockquote>
          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="font-semibold text-white">{client.contact}</p>
            <p className="mt-1 text-sm text-white/40">{client.designation}, {client.name}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-violet-200/10 bg-[#12071f]/80 p-6 shadow-xl shadow-black/20">
          <SectionTitle eyebrow="Achievements" title="Project achievements" />
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Achievement icon={CheckCircle2} title="Training completion" detail={`${snapshot?.completedTraining || 0} learners completed core training modules.`} />
            <Achievement icon={Award} title="Assessment readiness" detail={`${snapshot?.certified || 0} learners certified across active centers.`} />
            <Achievement icon={TrendingUp} title="Placement conversion" detail={`${snapshot?.placed || 0} learners moved into placement outcomes.`} />
            <Achievement icon={Building2} title="Center delivery" detail={`${summary.centers} centers monitored with attendance and progress indicators.`} />
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-violet-200/10 bg-[#12071f]/80 p-6 shadow-xl shadow-black/20">
        <SectionTitle eyebrow="Events" title="Events conducted" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.title} event={event} />
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-violet-200/10 bg-[#12071f]/80 shadow-xl shadow-black/20">
        <div className="border-b border-white/10 p-6">
          <SectionTitle eyebrow="Video Testimonial" title="Story carousel" />
        </div>
        <div className="relative bg-black">
          <video
            key={activeVideo.id}
            controls
            preload="metadata"
            poster={activeVideo.poster}
            className="aspect-video w-full bg-black object-contain"
          >
            <source src={activeVideo.src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl border border-white/15 bg-black/60 px-4 py-3 backdrop-blur">
            <p className="text-sm font-semibold text-white">{activeVideo.title}</p>
            <p className="mt-1 text-xs text-white/45">{activeVideo.meta}</p>
          </div>
        </div>

        <div className="p-5">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {TESTIMONIAL_VIDEOS.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                isActive={activeVideo.id === video.id}
                onSelect={() => setActiveVideo(video)}
              />
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}

function buildEvents(snapshot) {
  if (!snapshot?.centers?.length) {
    return [
      { title: "Mobilization Drive", location: "Project center", date: "Ongoing", detail: "Community outreach and learner onboarding." },
      { title: "Practical Training", location: "Skill lab", date: "Ongoing", detail: "Hands-on skill demonstrations and assessment preparation." },
      { title: "Placement Connect", location: "Employer desk", date: "Ongoing", detail: "Employer engagement and interview readiness." },
    ];
  }

  return snapshot.centers.slice(0, 3).map((center, index) => ({
    title: ["Mobilization Drive", "Practical Training Session", "Placement Readiness Camp"][index] || "Center Event",
    location: center.location,
    date: ["12 May 2026", "18 May 2026", "24 May 2026"][index] || "May 2026",
    detail: `${center.jobRoles.slice(0, 2).join(" and ")} learners supported through ${center.batches.length} active batches.`,
  }));
}

function SectionTitle({ eyebrow, title }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
    </div>
  );
}

function HeroMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-white/40">{label}</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
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

function Achievement({ icon: Icon, title, detail }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <Icon size={19} className="text-violet-300" />
      <p className="mt-4 font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-white/45">{detail}</p>
    </div>
  );
}

function EventCard({ event }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200">
        <CalendarDays size={18} />
      </div>
      <h3 className="text-lg font-semibold text-white">{event.title}</h3>
      <p className="mt-1 text-sm text-violet-200">{event.location} • {event.date}</p>
      <p className="mt-3 text-sm leading-6 text-white/45">{event.detail}</p>
    </article>
  );
}

function VideoCard({ video, isActive, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group w-56 shrink-0 overflow-hidden rounded-2xl border text-left transition focus:outline-none focus:ring-2 focus:ring-violet-300/50 ${
        isActive
          ? "border-violet-300/60 bg-violet-500/15"
          : "border-white/10 bg-black/20 hover:border-violet-300/35 hover:bg-violet-500/10"
      }`}
    >
      <div className="relative aspect-video overflow-hidden bg-black">
        <img
          src={video.poster}
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#12071f]">
          <PlayCircle size={17} />
        </div>
        <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-2 py-1 text-[11px] font-semibold text-white">
          {video.duration}
        </span>
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-white">{video.title}</p>
        <p className="mt-1 text-xs text-white/40">{video.meta}</p>
      </div>
    </button>
  );
}
