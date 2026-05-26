import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image,
  Plus,
  Search,
  Trash2,
  Video,
  X,
} from "lucide-react";

const initialTextTestimonials = [
  {
    id: "txt-001",
    name: "Sasmita Naik",
    role: "Solar O&M Technician",
    center: "Angul Solar Energy Skill Center",
    outcome: "Placed at Vedanta Resources",
    image: "/images/client-gallery/1.png",
    imageName: "client-gallery-1.png",
    text: "The practical sessions helped me understand workplace expectations before my interview.",
    type: "Text",
  },
];

const initialVideoTestimonials = [
  {
    id: "vid-001",
    name: "Rohit Sahu",
    role: "Industrial Welder",
    center: "Angul Steel Skill Center",
    outcome: "Certified and shortlisted",
    poster: "/images/client-gallery/6.png",
    posterName: "client-gallery-6.png",
    video: "",
    videoName: "",
    quote: "The lab practice improved my finishing and safety discipline. I feel ready for site work now.",
    type: "Video",
  },
];

const emptyTextForm = {
  name: "",
  role: "",
  center: "",
  outcome: "",
  image: "",
  imageName: "",
  text: "",
};

const emptyVideoForm = {
  name: "",
  role: "",
  center: "",
  outcome: "",
  poster: "",
  posterName: "",
  video: "",
  videoName: "",
  quote: "",
};

const ROLE_THEMES = {
  admin: {
    eyebrow: "Admin Hub Style",
    accentText: "text-violet-300",
    accentTextStrong: "text-violet-200",
    accentBg: "bg-violet-500",
    accentHoverBg: "hover:bg-violet-400",
    accentSoftBg: "bg-violet-500/10",
    accentBorder: "border-violet-400/25",
    accentBorderSoft: "border-violet-400/20",
    accentFocus: "focus:border-violet-400/60",
    accentHoverBorder: "hover:border-violet-400/40",
    accentPill: "bg-violet-300",
    accentUploadHover: "hover:bg-violet-500/10",
  },
  placement: {
    eyebrow: "PlaCom Hub Style",
    accentText: "text-cyan-300",
    accentTextStrong: "text-cyan-200",
    accentBg: "bg-cyan-500",
    accentHoverBg: "hover:bg-cyan-400",
    accentSoftBg: "bg-cyan-500/10",
    accentBorder: "border-cyan-400/25",
    accentBorderSoft: "border-cyan-400/20",
    accentFocus: "focus:border-cyan-400/60",
    accentHoverBorder: "hover:border-cyan-400/40",
    accentPill: "bg-cyan-300",
    accentUploadHover: "hover:bg-cyan-500/10",
  },
  trainer: {
    eyebrow: "Teach Hub Style",
    accentText: "text-emerald-300",
    accentTextStrong: "text-emerald-200",
    accentBg: "bg-emerald-500",
    accentHoverBg: "hover:bg-emerald-400",
    accentSoftBg: "bg-emerald-500/10",
    accentBorder: "border-emerald-400/25",
    accentBorderSoft: "border-emerald-400/20",
    accentFocus: "focus:border-emerald-400/60",
    accentHoverBorder: "hover:border-emerald-400/40",
    accentPill: "bg-emerald-300",
    accentUploadHover: "hover:bg-emerald-500/10",
  },
};

const getThemeForPath = (pathname) => {
  if (pathname.startsWith("/placement-officer")) return ROLE_THEMES.placement;
  if (pathname.startsWith("/trainer")) return ROLE_THEMES.trainer;
  return ROLE_THEMES.admin;
};

export default function AdminTestimonials() {
  const { pathname } = useLocation();
  const theme = getThemeForPath(pathname);
  const [activeType, setActiveType] = useState("Text");
  const [textForm, setTextForm] = useState(emptyTextForm);
  const [videoForm, setVideoForm] = useState(emptyVideoForm);
  const [textTestimonials, setTextTestimonials] = useState(initialTextTestimonials);
  const [videoTestimonials, setVideoTestimonials] = useState(initialVideoTestimonials);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [videoIndex, setVideoIndex] = useState(0);

  const filterTestimonials = (items) => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (!query) return true;
      return (
        item.name.toLowerCase().includes(query) ||
        item.role.toLowerCase().includes(query) ||
        item.center.toLowerCase().includes(query) ||
        item.outcome.toLowerCase().includes(query)
      );
    });
  };

  const allTestimonials = useMemo(
    () => [...textTestimonials, ...videoTestimonials],
    [textTestimonials, videoTestimonials]
  );
  const filteredTextTestimonials = useMemo(
    () => filterTestimonials(textTestimonials),
    [search, textTestimonials]
  );
  const filteredVideoTestimonials = useMemo(
    () => filterTestimonials(videoTestimonials),
    [search, videoTestimonials]
  );

  const form = activeType === "Text" ? textForm : videoForm;
  const canSubmit =
    form.name &&
    form.role &&
    form.center &&
    form.outcome &&
    (activeType === "Text" ? form.text && form.image : form.quote && form.poster);

  const updateForm = (field, value) => {
    if (activeType === "Text") {
      setTextForm((current) => ({ ...current, [field]: value }));
    } else {
      setVideoForm((current) => ({ ...current, [field]: value }));
    }
  };

  const handleFile = (field, file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateForm(field, url);
    updateForm(`${field}Name`, file.name);
  };

  const addTestimonial = () => {
    if (!canSubmit) return;

    if (activeType === "Text") {
      setTextTestimonials((current) => [
        { ...textForm, id: `txt-${Date.now()}`, type: "Text" },
        ...current,
      ]);
      setTextForm(emptyTextForm);
      setShowForm(false);
      return;
    }

    setVideoTestimonials((current) => [
      { ...videoForm, id: `vid-${Date.now()}`, type: "Video" },
      ...current,
    ]);
    setVideoForm(emptyVideoForm);
    setShowForm(false);
  };

  const removeTestimonial = (testimonial) => {
    if (testimonial.type === "Text") {
      setTextTestimonials((current) => current.filter((item) => item.id !== testimonial.id));
    } else {
      setVideoTestimonials((current) => current.filter((item) => item.id !== testimonial.id));
    }
  };

  return (
    <section className="space-y-6 text-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${theme.accentBorder} ${theme.accentSoftBg} ${theme.accentText}`}>
            <Award size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-100">Testimonials</h1>
            <p className="mt-1 text-sm text-white/55">
              Add textual and video testimonies using the same fields shown on the client success story page.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:min-w-[420px]">
          <SummaryCard label="Text" value={textTestimonials.length} />
          <SummaryCard label="Video" value={videoTestimonials.length} tone={theme.accentText} />
          <SummaryCard label="Total" value={allTestimonials.length} tone="text-emerald-300" />
        </div>
      </div>

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-700 bg-[#111827] p-5 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setTextIndex(0);
              setVideoIndex(0);
            }}
            placeholder="Search testimonial"
            className={`w-full rounded-xl border border-slate-700 bg-[#0b1220] py-3 pl-10 pr-4 text-sm font-bold text-white outline-none transition placeholder:text-slate-600 ${theme.accentFocus}`}
          />
        </label>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className={`inline-flex items-center justify-center gap-2 rounded-xl ${theme.accentBg} px-5 py-3 text-sm font-black text-white transition ${theme.accentHoverBg}`}
        >
          <Plus size={16} />
          Add Testimony
        </button>
      </section>

      <TestimonialCarousel
        title="Textual Testimonies"
        subtitle="Learner stories shown in the client testimonial carousel."
        icon={FileText}
        items={filteredTextTestimonials}
        activeIndex={textIndex}
        onIndexChange={setTextIndex}
        onRemove={removeTestimonial}
        theme={theme}
      />

      <TestimonialCarousel
        title="Video Testimonies"
        subtitle="Video stories shown in the client video testimony row."
        icon={Video}
        items={filteredVideoTestimonials}
        activeIndex={videoIndex}
        onIndexChange={setVideoIndex}
        onRemove={removeTestimonial}
        theme={theme}
      />

      {showForm && (
        <SlideOver title="Add Testimony" subtitle="Use the same structure as the client success story page." onClose={() => setShowForm(false)} theme={theme}>
          <div className="flex rounded-xl border border-slate-700 bg-[#0b1220] p-1">
            {["Text", "Video"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setActiveType(type)}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-black transition ${
                  activeType === type ? `${theme.accentBg} text-white` : "text-white/55 hover:text-white"
                }`}
              >
                {type} Testimony
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Learner Name" value={form.name} onChange={(value) => updateForm("name", value)} placeholder="Sasmita Naik" theme={theme} />
            <Field label="Role / Trade" value={form.role} onChange={(value) => updateForm("role", value)} placeholder="Solar O&M Technician" theme={theme} />
            <Field label="Center" value={form.center} onChange={(value) => updateForm("center", value)} placeholder="Angul Solar Energy Skill Center" theme={theme} />
            <Field label="Outcome" value={form.outcome} onChange={(value) => updateForm("outcome", value)} placeholder="Placed at Vedanta Resources" theme={theme} />
          </div>

          {activeType === "Text" ? (
            <>
              <UploadField
                label="Learner Image"
                icon={Image}
                accept="image/*"
                fileName={textForm.imageName}
                preview={textForm.image}
                onChange={(file) => handleFile("image", file)}
                theme={theme}
              />
              <TextArea
                label="Testimonial Text"
                value={textForm.text}
                onChange={(value) => updateForm("text", value)}
                placeholder="Write the learner's success story in their words..."
                theme={theme}
              />
            </>
          ) : (
            <>
              <UploadField
                label="Video Poster"
                icon={Image}
                accept="image/*"
                fileName={videoForm.posterName}
                preview={videoForm.poster}
                onChange={(file) => handleFile("poster", file)}
                theme={theme}
              />
              <UploadField
                label="Video Testimony"
                icon={Video}
                accept="video/*"
                fileName={videoForm.videoName}
                preview={videoForm.video}
                onChange={(file) => handleFile("video", file)}
                theme={theme}
              />
              <TextArea
                label="Video Quote"
                value={videoForm.quote}
                onChange={(value) => updateForm("quote", value)}
                placeholder="Short quote shown below the video player..."
                theme={theme}
              />
            </>
          )}

          <button
            type="button"
            onClick={addTestimonial}
            disabled={!canSubmit}
            className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl ${theme.accentBg} px-5 py-3 text-sm font-black text-white transition ${theme.accentHoverBg} disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400`}
          >
            <Plus size={16} />
            Add {activeType} Testimony
          </button>
        </SlideOver>
      )}
    </section>
  );
}

function TestimonialCarousel({ title, subtitle, icon: Icon, items, activeIndex, onIndexChange, onRemove, theme }) {
  const visibleItems = items.length
    ? [0, 1, 2].map((offset) => items[(activeIndex + offset) % items.length]).filter(Boolean)
    : [];
  const canMove = items.length > 1;

  const move = (direction) => {
    if (!canMove) return;
    onIndexChange((current) => {
      if (direction === "previous") return current === 0 ? items.length - 1 : current - 1;
      return (current + 1) % items.length;
    });
  };

  return (
    <section className="rounded-2xl border border-slate-700 bg-[#111827] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${theme.accentBorder} ${theme.accentSoftBg} ${theme.accentText}`}>
            <Icon size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-white/80">{title}</h2>
            <p className="mt-1 text-xs text-white/45">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-slate-700 bg-[#0b1220] px-3 py-2 text-xs font-black text-white/55">
            {items.length} item(s)
          </span>
          <button
            type="button"
            onClick={() => move("previous")}
            disabled={!canMove}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-[#0b1220] text-white/70 transition ${theme.accentHoverBorder} hover:text-white disabled:cursor-not-allowed disabled:opacity-35`}
            aria-label={`Previous ${title}`}
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => move("next")}
            disabled={!canMove}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-[#0b1220] text-white/70 transition ${theme.accentHoverBorder} hover:text-white disabled:cursor-not-allowed disabled:opacity-35`}
            aria-label={`Next ${title}`}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {visibleItems.map((testimonial) => (
          <TestimonialPreview
            key={testimonial.id}
            testimonial={testimonial}
            onRemove={() => onRemove(testimonial)}
            theme={theme}
          />
        ))}
        {!visibleItems.length && (
          <div className="rounded-2xl border border-slate-700 bg-[#0b1220] p-8 text-center text-sm font-bold text-white/45 lg:col-span-3">
            No testimonials match the search.
          </div>
        )}
      </div>

      {items.length > 1 && (
        <div className="mt-5 flex justify-center gap-2">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onIndexChange(index)}
              className={`h-2 rounded-full transition-all ${
                activeIndex === index ? `w-8 ${theme.accentPill}` : "w-2 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Show ${title} ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function SlideOver({ title, subtitle, children, onClose, theme }) {
  return (
    <div className="fixed inset-0 z-[9999] flex justify-end bg-black/55" onMouseDown={onClose}>
      <aside
        className="h-full w-full max-w-2xl overflow-y-auto border-l border-slate-700 bg-[#111827] p-6 shadow-2xl shadow-black/70"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-700/50 pb-5">
          <div>
            <p className={`text-xs font-black uppercase tracking-[0.18em] ${theme.accentText}`}>{theme.eyebrow}</p>
            <h2 className="mt-1 text-2xl font-black text-white">{title}</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close testimonial form"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}

function SummaryCard({ label, value, tone = "text-white" }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-[#111827] px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/40">{label}</p>
      <p className={`mt-1 text-xl font-black ${tone}`}>{value}</p>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, theme }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-white/45">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-slate-700 bg-[#0b1220] px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:text-slate-600 ${theme.accentFocus}`}
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder, theme }) {
  return (
    <label className="mt-4 block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-white/45">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={5}
        className={`w-full resize-none rounded-xl border border-slate-700 bg-[#0b1220] px-4 py-3 text-sm font-bold leading-6 text-white outline-none transition placeholder:text-slate-600 ${theme.accentFocus}`}
      />
    </label>
  );
}

function UploadField({ label, icon: Icon, accept, fileName, preview, onChange, theme }) {
  const isVideo = accept.includes("video");

  return (
    <div className="mt-4 rounded-xl border border-slate-700 bg-[#0b1220] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${theme.accentBorderSoft} ${theme.accentSoftBg} ${theme.accentText}`}>
            <Icon size={18} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">{label}</p>
            <p className="mt-1 max-w-[240px] truncate text-xs font-bold text-white/65">{fileName || "No file selected"}</p>
          </div>
        </div>
        <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border ${theme.accentBorder} px-3 py-2 text-xs font-black ${theme.accentTextStrong} transition ${theme.accentUploadHover}`}>
          Upload
          <input type="file" accept={accept} className="hidden" onChange={(event) => onChange(event.target.files?.[0])} />
        </label>
      </div>
      {preview && (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-700 bg-black/30">
          {isVideo ? (
            <video src={preview} controls className="aspect-video w-full object-cover" />
          ) : (
            <img src={preview} alt="" className="h-44 w-full object-cover" />
          )}
        </div>
      )}
    </div>
  );
}

function TestimonialPreview({ testimonial, onRemove, theme }) {
  const isVideo = testimonial.type === "Video";

  return (
    <article className="rounded-2xl border border-slate-700 bg-[#0b1220] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${theme.accentBorderSoft} ${theme.accentSoftBg} ${theme.accentText}`}>
            {isVideo ? <Video size={18} /> : <FileText size={18} />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">{testimonial.name}</p>
            <p className={`mt-1 truncate text-xs font-bold ${theme.accentTextStrong}`}>{testimonial.role}</p>
            <p className="mt-1 truncate text-xs text-white/40">{testimonial.center}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg border border-red-400/20 p-2 text-red-300 transition hover:bg-red-500/10"
          aria-label="Remove testimonial"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-700 bg-black/30">
        {isVideo && testimonial.video ? (
          <video src={testimonial.video} poster={testimonial.poster} controls className="aspect-video w-full object-cover" />
        ) : (
          <img
            src={isVideo ? testimonial.poster : testimonial.image}
            alt=""
            className="h-44 w-full object-cover"
          />
        )}
      </div>

      <p className="mt-4 text-sm leading-6 text-white/60">
        {isVideo ? testimonial.quote : testimonial.text}
      </p>
      <p className="mt-4 rounded-full border border-emerald-300/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200">
        {testimonial.outcome}
      </p>
    </article>
  );
}
