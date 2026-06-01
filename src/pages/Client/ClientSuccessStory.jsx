import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  PlayCircle,
  Quote,
  Video,
  X,
} from "lucide-react";
import { getClientProjects, getStoredClient } from "./clientPortalData";

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
  const [selectedVideo, setSelectedVideo] = useState(null);
  const client = getStoredClient();
  const projects = getClientProjects(client.name);
  const visibleTestimonials = [
    STUDENT_TESTIMONIALS[testimonialIndex],
    STUDENT_TESTIMONIALS[(testimonialIndex + 1) % STUDENT_TESTIMONIALS.length],
    STUDENT_TESTIMONIALS[(testimonialIndex + 2) % STUDENT_TESTIMONIALS.length],
  ];
  const activeVideos = [
    VIDEO_TESTIMONIALS[videoIndex],
    VIDEO_TESTIMONIALS[(videoIndex + 1) % VIDEO_TESTIMONIALS.length],
  ];
  const showPreviousTestimonial = () => {
    setTestimonialIndex((current) =>
      current === 0 ? STUDENT_TESTIMONIALS.length - 1 : current - 1
    );
  };
  const showNextTestimonial = () => {
    setTestimonialIndex((current) => (current + 1) % STUDENT_TESTIMONIALS.length);
  };
  const showPreviousVideo = () => {
    setVideoIndex((current) => (current === 0 ? VIDEO_TESTIMONIALS.length - 1 : current - 1));
  };
  const showNextVideo = () => {
    setVideoIndex((current) => (current + 1) % VIDEO_TESTIMONIALS.length);
  };

  return (
    <section className="space-y-7">
      <section className="rounded-3xl border border-violet-200/10 bg-[#12071f]/80 p-6 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionTitle eyebrow="Text Testimony" title={`${client.name} learner voices`} />
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
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionTitle eyebrow="Video Testimony" title="Learner video slider" />
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-100">
              <Video size={14} />
              Zoho overlay playback
            </div>
            <button
              type="button"
              onClick={showPreviousVideo}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-violet-500/15 hover:text-white"
              aria-label="Previous video testimony"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={showNextVideo}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-violet-500/15 hover:text-white"
              aria-label="Next video testimony"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {activeVideos.map((testimonial) => (
            <VideoTestimonySlide
              key={testimonial.id}
              testimonial={testimonial}
              onOpen={() => setSelectedVideo(testimonial)}
            />
          ))}
        </div>

        <div className="mt-5 flex justify-center gap-2">
          {VIDEO_TESTIMONIALS.map((testimonial, index) => (
            <button
              key={testimonial.id}
              type="button"
              onClick={() => setVideoIndex(index)}
              className={`h-2 rounded-full transition-all ${
                videoIndex === index ? "w-8 bg-violet-300" : "w-2 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Show video testimony ${index + 1}`}
            />
          ))}
          </div>
        </section>

      <VideoTestimonyOverlay testimonial={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </section>
  );
}

function SectionTitle({ eyebrow, title }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
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

function VideoTestimonySlide({ testimonial, onOpen }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-black/25 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:border-violet-300/35">
      <button type="button" onClick={onOpen} className="relative block h-64 w-full overflow-hidden text-left sm:h-72">
        <img src={testimonial.poster} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          Video testimony
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white shadow-2xl shadow-black/40 backdrop-blur transition group-hover:scale-105 group-hover:bg-violet-500/25">
            <PlayCircle size={34} />
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-xl font-semibold text-white">{testimonial.name}</h3>
          <p className="mt-1 text-sm text-violet-200">{testimonial.role}</p>
        </div>
      </button>
      <div className="border-t border-white/10 p-5">
        <p className="text-sm leading-6 text-white/60">"{testimonial.quote}"</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-white/40">{testimonial.center}</p>
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-2 rounded-xl border border-violet-400/25 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-100 transition hover:bg-violet-500/20"
          >
            <Eye size={14} />
            View
          </button>
        </div>
      </div>
    </article>
  );
}

function VideoTestimonyOverlay({ testimonial, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!testimonial) {
      setVisible(false);
      return undefined;
    }

    const frame = requestAnimationFrame(() => setVisible(true));
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [testimonial, onClose]);

  if (!testimonial || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-end" onClick={onClose}>
      <div className={`absolute inset-0 bg-black/50 backdrop-blur-[3px] transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`} />
      <aside
        className={`relative flex h-full w-full max-w-[680px] flex-col border-l border-violet-500/25 bg-[#080d1a] text-white shadow-[-24px_0_70px_rgba(0,0,0,0.55)] transition-transform duration-300 ease-out ${visible ? "translate-x-0" : "translate-x-full"}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#0b1220] px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Zoho Projects Style Video Review</p>
            <h3 className="mt-1 truncate text-xl font-semibold text-white">{testimonial.name}</h3>
            <p className="mt-1 truncate text-sm text-slate-400">{testimonial.role} • {testimonial.center}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-slate-400 transition hover:bg-white/[0.1] hover:text-white"
            aria-label="Close video testimony"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#070b16] p-5">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
            {testimonial.video ? (
              <video src={testimonial.video} poster={testimonial.poster} controls autoPlay className="aspect-video w-full bg-black object-cover" />
            ) : (
              <div className="relative aspect-video">
                <img src={testimonial.poster} alt="" className="h-full w-full object-cover opacity-75" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white shadow-2xl shadow-black/40 backdrop-blur">
                    <PlayCircle size={40} />
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm leading-6 text-white/70">"{testimonial.quote}"</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-emerald-300/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200">
                {testimonial.outcome}
              </span>
              <span className="rounded-full border border-violet-300/20 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-100">
                {testimonial.center}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/10 bg-[#0b1220] px-5 py-3">
          {testimonial.video ? (
            <a
              href={testimonial.video}
              download
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.1] hover:text-white"
            >
              <Download size={15} />
              Download
            </a>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.1] hover:text-white"
          >
            Close
          </button>
        </div>
      </aside>
    </div>,
    document.body
  );
}
