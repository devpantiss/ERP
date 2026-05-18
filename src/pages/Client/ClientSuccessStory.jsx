import { useState } from "react";
import {
  Award,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  PlayCircle,
  Quote,
  TrendingUp,
  Video,
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

const STUDENT_TESTIMONIALS = [
  {
    id: "sasmita",
    name: "Sasmita Naik",
    role: "Solar O&M Technician",
    center: "Angul Solar Energy Skill Center",
    outcome: "Placed at Vedanta Resources",
    image: "/images/client-gallery/1.png",
    text:
      "The practical sessions helped me understand workplace expectations before my interview. I joined with confidence because the training felt close to the real job.",
  },
  {
    id: "rohit",
    name: "Rohit Sahu",
    role: "Industrial Welder",
    center: "Angul Steel Skill Center",
    outcome: "Certified and shortlisted",
    image: "/images/client-gallery/7.png",
    text:
      "I came in with basic knowledge, but the lab practice and trainer feedback made my work sharper. The certification gave my family and me real confidence.",
  },
  {
    id: "ananya",
    name: "Ananya Das",
    role: "Warehouse Executive",
    center: "Paradip Port Skill Center",
    outcome: "Placed after employer connect",
    image: "/images/client-gallery/9.png",
    text:
      "The mock interviews and employer connect sessions changed how I presented myself. I could explain my skills clearly and felt ready on interview day.",
  },
  {
    id: "vikash",
    name: "Vikash Behera",
    role: "Dumper Operator",
    center: "Talcher Mining Training Center",
    outcome: "Offer letter received",
    image: "/images/client-gallery/3.png",
    text:
      "The instructors focused on safety and discipline every day. That helped me perform better during the assessment and prepare for site work.",
  },
  {
    id: "pooja",
    name: "Pooja Patra",
    role: "Furniture Assembler",
    center: "Bhubaneswar Furniture Skill Hub",
    outcome: "Certified with placement support",
    image: "/images/client-gallery/5.png",
    text:
      "I learned measurement, finishing, and workplace communication together. The placement team helped me understand what companies expect from new joiners.",
  },
  {
    id: "aman",
    name: "Aman Rout",
    role: "Electrical Maintenance Assistant",
    center: "Jharsuguda Aluminium Skill Center",
    outcome: "Placed in plant operations",
    image: "/images/client-gallery/11.png",
    text:
      "The course gave me a clear routine and hands-on practice. I now understand how to work safely and communicate better with supervisors.",
  },
];

const VIDEO_TESTIMONIALS = [
  {
    id: "sasmita-video",
    name: "Sasmita Naik",
    role: "Solar O&M Technician",
    center: "Angul Solar Energy Skill Center",
    outcome: "Placed at Vedanta Resources",
    poster: "/images/client-gallery/2.png",
    video: "",
    quote: "Training helped me speak confidently during the interview and understand real workplace expectations.",
  },
  {
    id: "rohit-video",
    name: "Rohit Sahu",
    role: "Industrial Welder",
    center: "Angul Steel Skill Center",
    outcome: "Certified and shortlisted",
    poster: "/images/client-gallery/6.png",
    video: "",
    quote: "The lab practice improved my finishing and safety discipline. I feel ready for site work now.",
  },
  {
    id: "ananya-video",
    name: "Ananya Das",
    role: "Warehouse Executive",
    center: "Paradip Port Skill Center",
    outcome: "Placed after employer connect",
    poster: "/images/client-gallery/4.png",
    video: "",
    quote: "Mock interviews helped me explain my skills clearly and face employers with confidence.",
  },
];

export default function ClientSuccessStory() {
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [videoIndex, setVideoIndex] = useState(0);
  const client = getStoredClient();
  const projects = getClientProjects(client.name);
  const summary = getClientSummary(projects);
  const featuredProject = projects[0];
  const snapshot = featuredProject ? buildClientProjectSnapshot(featuredProject) : null;
  const events = buildEvents(snapshot);
  const visibleTestimonials = [
    STUDENT_TESTIMONIALS[testimonialIndex],
    STUDENT_TESTIMONIALS[(testimonialIndex + 1) % STUDENT_TESTIMONIALS.length],
    STUDENT_TESTIMONIALS[(testimonialIndex + 2) % STUDENT_TESTIMONIALS.length],
  ];
  const selectedVideoTestimonial = VIDEO_TESTIMONIALS[videoIndex];
  const showPreviousTestimonial = () => {
    setTestimonialIndex((current) =>
      current === 0 ? STUDENT_TESTIMONIALS.length - 1 : current - 1
    );
  };
  const showNextTestimonial = () => {
    setTestimonialIndex((current) => (current + 1) % STUDENT_TESTIMONIALS.length);
  };

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

      <section className="rounded-3xl border border-violet-200/10 bg-[#12071f]/80 p-6 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionTitle eyebrow="Student Testimonials" title="Learner voices from the field" />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={showPreviousTestimonial}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-violet-500/15 hover:text-white"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={showNextTestimonial}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-violet-500/15 hover:text-white"
              aria-label="Next testimonial"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {visibleTestimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
        <div className="mt-5 flex justify-center gap-2">
          {STUDENT_TESTIMONIALS.map((testimonial, index) => (
            <button
              key={testimonial.id}
              type="button"
              onClick={() => setTestimonialIndex(index)}
              className={`h-2 rounded-full transition-all ${
                testimonialIndex === index
                  ? "w-8 bg-violet-300"
                  : "w-2 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Show testimonial ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-violet-200/10 bg-[#12071f]/80 p-6 shadow-xl shadow-black/20">
        <SectionTitle eyebrow="Achievements" title="Project achievements" />
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Achievement icon={CheckCircle2} title="Training completion" detail={`${snapshot?.completedTraining || 0} learners completed core training modules.`} />
          <Achievement icon={Award} title="Assessment readiness" detail={`${snapshot?.certified || 0} learners certified across active centers.`} />
          <Achievement icon={TrendingUp} title="Placement conversion" detail={`${snapshot?.placed || 0} learners moved into placement outcomes.`} />
          <Achievement icon={Building2} title="Center delivery" detail={`${summary.centers} centers monitored with attendance and progress indicators.`} />
        </div>
      </section>

      <section className="rounded-3xl border border-violet-200/10 bg-[#12071f]/80 p-6 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <SectionTitle eyebrow="Video Testimony" title="Learner stories on video" />
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-100">
              <Video size={14} />
              Field evidence
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-black/30">
            {selectedVideoTestimonial.video ? (
              <video
                key={selectedVideoTestimonial.id}
                src={selectedVideoTestimonial.video}
                poster={selectedVideoTestimonial.poster}
                controls
                className="aspect-video w-full bg-black object-cover"
              />
            ) : (
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={selectedVideoTestimonial.poster}
                  alt=""
                  className="h-full w-full object-cover opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-2xl shadow-black/40 backdrop-blur">
                    <PlayCircle size={38} />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-200">
                    Video testimony placeholder
                  </p>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                    Add the learner video file to activate playback. The testimony metadata and poster are already wired here.
                  </p>
                </div>
              </div>
            )}

            <div className="border-t border-white/10 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedVideoTestimonial.name}</h3>
                  <p className="mt-1 text-sm text-violet-200">{selectedVideoTestimonial.role}</p>
                  <p className="mt-1 text-xs text-white/40">{selectedVideoTestimonial.center}</p>
                </div>
                <span className="w-fit rounded-full border border-emerald-300/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200">
                  {selectedVideoTestimonial.outcome}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/60">
                "{selectedVideoTestimonial.quote}"
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {VIDEO_TESTIMONIALS.map((testimonial, index) => (
              <button
                key={testimonial.id}
                type="button"
                onClick={() => setVideoIndex(index)}
                className={`group flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                  videoIndex === index
                    ? "border-violet-300/40 bg-violet-500/15"
                    : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.04]"
                }`}
              >
                <img
                  src={testimonial.poster}
                  alt=""
                  className="h-12 w-12 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{testimonial.name}</p>
                  <p className="mt-1 truncate text-xs text-white/40">{testimonial.role}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

      <section className="rounded-3xl border border-violet-200/10 bg-[#12071f]/80 p-6 shadow-xl shadow-black/20">
        <SectionTitle eyebrow="Events" title="Events conducted" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.title} event={event} />
          ))}
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

function TestimonialCard({ testimonial }) {
  return (
    <article className="flex min-h-[320px] flex-col rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center gap-3">
        <img
          src={testimonial.image}
          alt=""
          className="h-16 w-16 rounded-2xl border border-violet-300/20 object-cover"
        />
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-white">{testimonial.name}</h3>
          <p className="mt-1 text-xs font-medium text-violet-200">{testimonial.role}</p>
          <p className="mt-1 text-xs text-white/35">{testimonial.center}</p>
        </div>
      </div>
      <div className="mt-5 flex-1 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <Quote size={20} className="text-violet-300" />
        <p className="mt-4 text-sm leading-6 text-white/65">{testimonial.text}</p>
      </div>
      <p className="mt-4 rounded-full border border-emerald-300/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200">
        {testimonial.outcome}
      </p>
    </article>
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
