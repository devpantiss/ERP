import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Download,
  Eye,
  GraduationCap,
  MapPin,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { Header, Stat } from "./ClientDashboard";
import {
  buildClientProjectSnapshot,
  getClientProjects,
  getProjectSummary,
  getStoredClient,
} from "./clientPortalData";

export default function ClientProjects() {
  const client = getStoredClient();
  const projects = getClientProjects(client.name);

  return (
    <section className="space-y-7">
      <Header
        eyebrow="Project Portfolio"
        title={`${client.name} projects`}
        description="Track every project mapped to this client account with center-level delivery, attendance, placement, and grievance indicators."
      />

      <div className="grid gap-5">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}

export function ClientProjectDetail() {
  const { projectId } = useParams();
  const client = getStoredClient();
  const project = getClientProjects(client.name).find((item) => item.id === projectId);
  const [selectedCenterId, setSelectedCenterId] = useState("");

  if (!project) {
    return (
      <section className="space-y-5">
        <Link to="/client/projects" className="inline-flex items-center gap-2 text-sm text-violet-200">
          <ArrowLeft size={16} />
          Back to projects
        </Link>
        <Header
          eyebrow="Project not found"
          title="This project is not available for your client account."
          description="Use the Projects page to open a project assigned to your organization."
        />
      </section>
    );
  }

  const snapshot = buildClientProjectSnapshot(project);
  const summary = snapshot.summary;
  const selectedCenter =
    snapshot.centers.find((center) => center.id === (selectedCenterId || snapshot.centers[0]?.id)) ||
    snapshot.centers[0];

  return (
    <section className="space-y-7">
      <Link to="/client/projects" className="inline-flex items-center gap-2 text-sm text-violet-200">
        <ArrowLeft size={16} />
        Back to projects
      </Link>

      <Header
        eyebrow={project.fundingAgency}
        title={project.name}
        description={`Delivery window: ${formatDate(project.startDate)} to ${formatDate(project.endDate)}. Current status: ${project.status}.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Building2} label="Centers" value={summary.centers} />
        <Stat icon={GraduationCap} label="Active Batches" value={snapshot.totalBatches} />
        <Stat icon={Users} label="Learners" value={summary.candidates} />
        <Stat icon={Target} label="Placement Rate" value={`${summary.placementRate}%`} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Training completed" value={snapshot.completedTraining} caption="Learners with completed modules" icon={CheckCircle2} />
        <MetricCard label="Certified" value={snapshot.certified} caption="Assessment cleared" icon={Award} />
        <MetricCard label="Placed" value={snapshot.placed} caption="Offer or joining completed" icon={TrendingUp} />
        <MetricCard label="Open issues" value={summary.grievances} caption="Center-level operational risks" icon={CircleAlert} />
      </div>

      {selectedCenter && (
        <section className="rounded-3xl border border-violet-200/10 bg-[#12071f]/80 p-5 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
                Center Summary
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{selectedCenter.name}</h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-white/45">
                <MapPin size={15} className="text-violet-300" />
                {selectedCenter.location} • Managed by {selectedCenter.manager}
              </p>
            </div>
            <div className="w-full max-w-sm">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-white/40">
                Choose center
              </label>
              <select
                value={selectedCenterId}
                onChange={(event) => setSelectedCenterId(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-violet-300/20 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-violet-300/50"
              >
                {snapshot.centers.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <Mini label="Batches" value={selectedCenter.batches.length} />
            <Mini label="Attendance" value={`${selectedCenter.attendanceRate}%`} />
            <Mini label="Placement" value={`${selectedCenter.placementRate}%`} />
            <Mini label="Issues" value={selectedCenter.grievances} />
          </div>
        </section>
      )}

      {selectedCenter && (
        <div className="space-y-5">
          <section className="rounded-3xl border border-violet-200/10 bg-[#12071f]/80 p-5 shadow-xl shadow-black/20">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
                  Center Batch Details
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{selectedCenter.name}</h2>
                <p className="mt-1 text-sm text-white/45">
                  Batch-wise learners, certification, placement, attendance, and assessment status.
                </p>
              </div>
              <Health value={selectedCenter.health} />
            </div>

            <div className="mt-5 space-y-3">
              {selectedCenter.batches.map((batch) => (
                <div key={batch.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{batch.label}</p>
                      <p className="mt-1 text-xs text-white/40">{batch.track} track</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <Mini label="Learners" value={batch.size} compact />
                      <Mini label="Certified" value={batch.certified} compact />
                      <Mini label="Placed" value={batch.placed} compact />
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Progress label="Attendance" value={batch.attendanceRate} />
                    <Progress label="Assessment" value={batch.assessmentRate} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <CenterGallery project={project} center={selectedCenter} />
        </div>
      )}
    </section>
  );
}

const CLIENT_GALLERY_ASSETS = [
  {
    src: "/images/client-gallery/1.png",
    title: "Enrollment documentation",
    category: "Enrollment",
    stage: "Mobilization",
  },
  {
    src: "/images/client-gallery/2.png",
    title: "Classroom delivery",
    category: "Training",
    stage: "Learning",
  },
  {
    src: "/images/client-gallery/3.png",
    title: "Practical lab session",
    category: "Training",
    stage: "Assessment",
  },
  {
    src: "/images/client-gallery/4.png",
    title: "Candidate counselling",
    category: "Enrollment",
    stage: "Verification",
  },
  {
    src: "/images/client-gallery/5.png",
    title: "Employer connect",
    category: "Placements",
    stage: "Interview",
  },
  {
    src: "/images/client-gallery/6.png",
    title: "Certification review",
    category: "Compliance",
    stage: "Evidence",
  },
  {
    src: "/images/client-gallery/7.png",
    title: "Placement readiness",
    category: "Placements",
    stage: "Readiness",
  },
  {
    src: "/images/client-gallery/9.png",
    title: "Center operations",
    category: "Compliance",
    stage: "Monitoring",
  },
  {
    src: "/images/client-gallery/11.png",
    title: "Field visit documentation",
    category: "Training",
    stage: "Review",
  },
];

function buildClientGalleryItems(project, center) {
  return CLIENT_GALLERY_ASSETS.map((asset, index) => ({
    ...asset,
    id: `${project.id}-${center.id}-client-gallery-${index}`,
    projectName: project.name,
    centerName: center.name,
    location: center.location,
    capturedBy:
      index % 3 === 0
        ? center.manager
        : index % 3 === 1
          ? "Training team"
          : "Client reporting team",
    capturedOn: formatDate(
      new Date(
        2026,
        (index + center.name.length) % 12,
        4 + ((index * 3 + center.location.length) % 21)
      )
        .toISOString()
        .slice(0, 10)
    ),
  }));
}

function CenterGallery({ project, center }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const galleryItems = useMemo(
    () => buildClientGalleryItems(project, center),
    [project, center]
  );
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(galleryItems.map((item) => item.category)))],
    [galleryItems]
  );
  const visibleItems = useMemo(
    () =>
      activeCategory === "All"
        ? galleryItems
        : galleryItems.filter((item) => item.category === activeCategory),
    [activeCategory, galleryItems]
  );

  return (
    <section className="rounded-3xl border border-violet-200/10 bg-[#12071f]/80 p-5 shadow-xl shadow-black/20">
      <div className="mb-5 flex flex-col gap-4 border-b border-violet-200/10 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
            <Sparkles size={14} />
            Project gallery
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-white">Report Evidence Gallery</h2>
          <p className="mt-1 text-sm text-white/45">
            {project.name} • {center.name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                activeCategory === category
                  ? "border-violet-400/40 bg-violet-500 text-white"
                  : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid auto-rows-[190px] gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visibleItems.map((item, index) => (
          <button
            type="button"
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className={`group relative overflow-hidden rounded-[20px] border border-white/10 bg-black/20 text-left shadow-[0_18px_50px_rgba(2,6,23,0.28)] transition hover:-translate-y-0.5 hover:border-violet-400/40 focus:outline-none focus:ring-2 focus:ring-violet-300/50 ${
              index === 0 ? "md:col-span-2 md:row-span-2" : ""
            }`}
          >
            <img
              src={item.src}
              alt={`${item.title} for ${item.centerName}`}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <span className="absolute left-3 top-3 rounded-full border border-black/20 bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
              {item.category}
            </span>
            <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
              <Eye size={15} />
            </span>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-4">
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-1 text-xs text-slate-300">
                {item.stage} • {item.capturedOn}
              </p>
            </div>
          </button>
        ))}
      </div>

      <ClientGalleryDrawer item={selectedItem} onClose={() => setSelectedItem(null)} />
    </section>
  );
}

function ClientGalleryDrawer({ item, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!item) {
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
  }, [item, onClose]);

  if (!item || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-end" onClick={onClose}>
      <div
        className={`absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`relative flex h-full w-full max-w-[560px] flex-col border-l border-violet-500/25 bg-[#080d1a] text-white shadow-[-24px_0_70px_rgba(0,0,0,0.55)] transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#0b1220] px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-violet-400/25 bg-violet-500/10 text-violet-200">
              <Eye size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-0.5 truncate text-xs text-slate-400">
                {item.projectName} • {item.centerName}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={item.src}
              download
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 text-xs font-semibold text-slate-200 transition hover:border-violet-400/35 hover:bg-violet-500/15 hover:text-white"
            >
              <Download size={14} />
              Download
            </a>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-slate-400 transition hover:bg-white/[0.1] hover:text-white"
              aria-label="Close gallery preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-white/10 bg-[#0b1220] px-5 py-2.5">
          <span className="rounded-md border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-200">
            {item.category}
          </span>
          <span className="text-xs text-slate-600">•</span>
          <span className="text-xs font-medium text-slate-400">{item.stage}</span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#070b16]">
          <div className="p-5">
            <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-white/10 bg-black/25 p-3">
              <img
                src={item.src}
                alt={`${item.title} preview`}
                className="max-h-[52vh] w-auto max-w-full rounded-lg object-contain shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
              />
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#080d1a] p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <ClientGalleryMetaRow label="Captured on" value={item.capturedOn} />
              <ClientGalleryMetaRow label="Location" value={item.location} />
              <ClientGalleryMetaRow label="Captured by" value={item.capturedBy} />
              <ClientGalleryMetaRow label="Project" value={item.projectName} />
              <ClientGalleryMetaRow label="Center" value={item.centerName} />
              <ClientGalleryMetaRow label="Stage" value={item.stage} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/10 bg-[#0b1220] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.1] hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ClientGalleryMetaRow({ label, value }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function ProjectCard({ project }) {
  const summary = getProjectSummary(project);

  return (
    <Link
      to={`/client/projects/${project.id}`}
      className="rounded-3xl border border-violet-200/10 bg-[#12071f]/80 p-5 shadow-xl shadow-black/20 transition hover:border-violet-300/35 hover:bg-violet-500/10"
    >
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
            {project.fundingAgency}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{project.name}</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-white/45">
            <CalendarDays size={15} />
            {formatDate(project.startDate)} - {formatDate(project.endDate)}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-2xl border border-violet-300/20 px-4 py-2 text-sm text-violet-200">
          Open project
          <ArrowUpRight size={16} />
        </span>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Mini label="Centers" value={summary.centers} />
        <Mini label="Candidates" value={summary.candidates} />
        <Mini label="Attendance" value={`${summary.attendanceRate}%`} />
        <Mini label="Placement" value={`${summary.placementRate}%`} />
      </div>
    </Link>
  );
}

function MetricCard({ icon: Icon, label, value, caption }) {
  return (
    <div className="rounded-3xl border border-violet-200/10 bg-white/[0.04] p-5">
      <Icon size={20} className="mb-4 text-violet-300" />
      <p className="text-2xl font-semibold text-white">{formatNumber(value)}</p>
      <p className="mt-1 text-sm text-white/55">{label}</p>
      <p className="mt-1 text-xs text-white/35">{caption}</p>
    </div>
  );
}

function Mini({ label, value, compact = false }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-black/20 ${compact ? "px-3 py-2" : "p-4"}`}>
      <p className={`${compact ? "text-sm" : "text-xl"} font-semibold text-white`}>{value}</p>
      <p className="text-xs text-white/40">{label}</p>
    </div>
  );
}

function Progress({ label, value }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-white/45">{label}</span>
        <span className="font-semibold text-white">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

function Health({ value }) {
  return (
    <span className="inline-flex rounded-full border border-violet-300/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
      {value}%
    </span>
  );
}

function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(value);
}
