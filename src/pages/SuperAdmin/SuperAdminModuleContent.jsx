import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Video,
  Image,
  HelpCircle,
  Save,
  Briefcase,
  ChevronRight,
  Layers,
  X,
} from "lucide-react";
import SlidePanel from "../../components/common/SlidePanel";
import {
  PageHeader,
  Breadcrumb,
  BackButton,
} from "./SuperAdminSharedComponents";
import { getTrainingModules } from "../../stores/selectors/trainingSelectors";
import { denormalize } from "../../mock-db/shared/normalize";
import { mockDb } from "../../mock-db/index";

/* ═══════════════════════════════════════════════════════════════
   CONFIG & HELPERS
   ═══════════════════════════════════════════════════════════════ */

function getUniqueJobRoles() {
  const batches = denormalize(mockDb.batches);
  const trades = [...new Set(batches.map((b) => b.trade))];
  // also include MODULE_CATALOG keys that might not be in batches
  const catalogTrades = ["Electrical Technician", "Industrial Welding", "General Duty Assistant"];
  const all = [...new Set([...trades, ...catalogTrades])];
  return all.map((trade) => {
    const tradeBatches = batches.filter((b) => b.trade === trade);
    return {
      trade,
      batchCount: tradeBatches.length,
      moduleCount: getTrainingModules(trade).length,
    };
  });
}

const EMPTY_CONTENT = {
  videoUrl: "",
  activityImage: null,
  activityImagePreview: "",
  quizQuestions: [""],
  projectVideoUrl: "",
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function SuperAdminModuleContent() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  // moduleContent: { [trade]: { [moduleTitle]: { videoUrl, activityImage, quizQuestions, projectVideoUrl } } }
  const [moduleContent, setModuleContent] = useState({});

  // form state for slide panel
  const [form, setForm] = useState({ ...EMPTY_CONTENT });

  const jobRoles = useMemo(() => getUniqueJobRoles(), []);
  const modules = selectedRole ? getTrainingModules(selectedRole) : [];

  /* ── Open panel for a module ── */
  const openEditor = (moduleName) => {
    setSelectedModule(moduleName);
    const existing = moduleContent[selectedRole]?.[moduleName];
    if (existing) {
      setForm({
        videoUrl: existing.videoUrl || "",
        activityImage: null,
        activityImagePreview: existing.activityImagePreview || "",
        quizQuestions: existing.quizQuestions?.length ? [...existing.quizQuestions] : [""],
        projectVideoUrl: existing.projectVideoUrl || "",
      });
    } else {
      setForm({ ...EMPTY_CONTENT, quizQuestions: [""] });
    }
    setPanelOpen(true);
    setSaved(false);
  };

  /* ── Save content ── */
  const handleSave = () => {
    setModuleContent((prev) => ({
      ...prev,
      [selectedRole]: {
        ...(prev[selectedRole] || {}),
        [selectedModule]: { ...form },
      },
    }));
    setSaved(true);
    setTimeout(() => {
      setPanelOpen(false);
      setSaved(false);
    }, 900);
  };

  /* ── Quiz helpers ── */
  const addQuestion = () =>
    setForm((f) => ({ ...f, quizQuestions: [...f.quizQuestions, ""] }));

  const updateQuestion = (index, value) =>
    setForm((f) => ({
      ...f,
      quizQuestions: f.quizQuestions.map((q, i) => (i === index ? value : q)),
    }));

  const removeQuestion = (index) =>
    setForm((f) => ({
      ...f,
      quizQuestions: f.quizQuestions.filter((_, i) => i !== index),
    }));

  /* ── Activity image upload ── */
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({
      ...f,
      activityImage: file,
      activityImagePreview: URL.createObjectURL(file),
    }));
  };

  const removeImage = () => {
    setForm((f) => ({ ...f, activityImage: null, activityImagePreview: "" }));
  };

  /* ── Content status check for a module ── */
  const getContentStatus = (moduleName) => {
    const content = moduleContent[selectedRole]?.[moduleName];
    if (!content) return "empty";
    const filled = [
      content.videoUrl,
      content.activityImagePreview,
      content.quizQuestions?.some((q) => q.trim()),
      content.projectVideoUrl,
    ].filter(Boolean).length;
    if (filled === 4) return "complete";
    if (filled > 0) return "partial";
    return "empty";
  };

  /* ── Breadcrumb ── */
  const breadcrumb = ["Module Content"];
  if (selectedRole) breadcrumb.push(selectedRole);

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BookOpen}
        title="Module Content Manager"
        subtitle="Add & manage training content for each job role's modules"
      />
      <Breadcrumb items={breadcrumb} />

      {/* ── LEVEL 1: Job Role Selection ── */}
      {!selectedRole && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {jobRoles.map((role) => (
            <JobRoleCard
              key={role.trade}
              role={role}
              contentCount={
                Object.keys(moduleContent[role.trade] || {}).length
              }
              onClick={() => setSelectedRole(role.trade)}
            />
          ))}
        </div>
      )}

      {/* ── LEVEL 2: Module Grid ── */}
      {selectedRole && (
        <>
          <BackButton
            onClick={() => {
              setSelectedRole(null);
              setSelectedModule(null);
            }}
            label="Back to Job Roles"
          />

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Modules"
              value={modules.length}
              color="text-white"
            />
            <StatCard
              label="Content Added"
              value={Object.keys(moduleContent[selectedRole] || {}).length}
              color="text-emerald-400"
            />
            <StatCard
              label="Complete"
              value={
                modules.filter((m) => getContentStatus(m) === "complete").length
              }
              color="text-emerald-400"
            />
            <StatCard
              label="Pending"
              value={
                modules.filter((m) => getContentStatus(m) === "empty").length
              }
              color="text-amber-400"
            />
          </div>

          {/* Module cards */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((moduleName, index) => {
              const status = getContentStatus(moduleName);
              return (
                <ModuleCard
                  key={moduleName}
                  index={index + 1}
                  title={moduleName}
                  status={status}
                  content={moduleContent[selectedRole]?.[moduleName]}
                  onClick={() => openEditor(moduleName)}
                />
              );
            })}
          </div>
        </>
      )}

      {/* ── SLIDE PANEL: Content Editor ── */}
      <SlidePanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={`Edit Content — ${selectedModule}`}
        width="lg"
      >
        <div className="space-y-6">
          {/* Success banner */}
          {saved && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400 animate-pulse">
              <CheckCircle2 size={18} />
              Content saved successfully!
            </div>
          )}

          {/* ── Module Video URL ── */}
          <FieldSection
            icon={Video}
            title="Module Video"
            subtitle="YouTube / Vimeo embed URL for the main module lesson"
          >
            <input
              type="url"
              placeholder="https://www.youtube.com/embed/..."
              value={form.videoUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, videoUrl: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-700 bg-[#0b1220] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30"
            />
            {form.videoUrl && (
              <div className="mt-3 overflow-hidden rounded-lg border border-slate-700">
                <iframe
                  src={form.videoUrl}
                  className="h-48 w-full"
                  allowFullScreen
                  title="Module video preview"
                />
              </div>
            )}
          </FieldSection>

          {/* ── Activity Image ── */}
          <FieldSection
            icon={Image}
            title="Activity Demonstration"
            subtitle="Upload an image demonstrating the hands-on activity"
          >
            {!form.activityImagePreview ? (
              <label className="group relative flex h-40 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-[#0b1220] transition hover:border-red-500/40">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <div className="flex flex-col items-center gap-2 text-slate-500 transition group-hover:text-red-400">
                  <Upload size={28} />
                  <span className="text-xs font-medium">
                    Click to upload activity image
                  </span>
                </div>
              </label>
            ) : (
              <div className="relative overflow-hidden rounded-xl border border-slate-700">
                <img
                  src={form.activityImagePreview}
                  alt="Activity preview"
                  className="h-48 w-full object-cover"
                />
                <button
                  onClick={removeImage}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-red-400 transition hover:bg-red-500 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </FieldSection>

          {/* ── Quiz Questions ── */}
          <FieldSection
            icon={HelpCircle}
            title="Quiz Questions"
            subtitle="Add assessment questions for this module"
          >
            <div className="space-y-3">
              {form.quizQuestions.map((q, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-3 text-[11px] font-black text-slate-500 shrink-0 w-6 text-right">
                    {i + 1}.
                  </span>
                  <input
                    type="text"
                    placeholder={`Enter question ${i + 1}...`}
                    value={q}
                    onChange={(e) => updateQuestion(i, e.target.value)}
                    className="flex-1 rounded-lg border border-slate-700 bg-[#0b1220] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30"
                  />
                  {form.quizQuestions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(i)}
                      className="mt-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addQuestion}
                className="flex items-center gap-2 rounded-lg border border-dashed border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-400 transition hover:border-red-500/40 hover:text-red-400"
              >
                <Plus size={14} />
                Add Question
              </button>
            </div>
          </FieldSection>

          {/* ── Project Video URL ── */}
          <FieldSection
            icon={Video}
            title="Project Video"
            subtitle="YouTube / Vimeo embed URL for the project demonstration"
          >
            <input
              type="url"
              placeholder="https://www.youtube.com/embed/..."
              value={form.projectVideoUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, projectVideoUrl: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-700 bg-[#0b1220] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30"
            />
            {form.projectVideoUrl && (
              <div className="mt-3 overflow-hidden rounded-lg border border-slate-700">
                <iframe
                  src={form.projectVideoUrl}
                  className="h-48 w-full"
                  allowFullScreen
                  title="Project video preview"
                />
              </div>
            )}
          </FieldSection>

          {/* ── Actions ── */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-700/50 pt-5">
            <button
              onClick={() => setPanelOpen(false)}
              className="rounded-lg border border-slate-700 bg-transparent px-5 py-2.5 text-sm font-bold text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-red-400"
            >
              <Save size={16} />
              Save Content
            </button>
          </div>
        </div>
      </SlidePanel>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

/* ── Job Role Card ── */
function JobRoleCard({ role, contentCount, onClick }) {
  const pct = role.moduleCount
    ? Math.round((contentCount / role.moduleCount) * 100)
    : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-6 text-left backdrop-blur-sm transition-all hover:border-red-500/30 hover:bg-[#151e2f]"
    >
      {/* Accent gradient */}
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-red-500/5 blur-2xl transition group-hover:bg-red-500/10" />

      <div className="relative flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
          <Briefcase size={22} className="text-red-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-black tracking-tight text-white">
            {role.trade}
          </p>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            {role.batchCount} Batch{role.batchCount !== 1 && "es"} •{" "}
            {role.moduleCount} Modules
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="relative mt-5">
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="font-bold text-slate-400">Content Progress</span>
          <span className="font-black text-white">{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-700/50">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              pct === 100
                ? "bg-emerald-500"
                : pct > 0
                ? "bg-amber-500"
                : "bg-slate-600"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="relative mt-4 flex items-center gap-1 text-xs font-bold text-red-500 opacity-0 transition group-hover:opacity-100">
        Manage Modules <ChevronRight size={14} />
      </div>
    </button>
  );
}

/* ── Module Card ── */
function ModuleCard({ index, title, status, content, onClick }) {
  const statusConfig = {
    complete: {
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      label: "Complete",
    },
    partial: {
      icon: AlertCircle,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      label: "Partial",
    },
    empty: {
      icon: AlertCircle,
      color: "text-slate-500",
      bg: "bg-slate-700/30 border-slate-700/50",
      label: "No Content",
    },
  };

  const cfg = statusConfig[status];
  const StatusIcon = cfg.icon;

  // Count filled sections
  const sections = content
    ? [
        { label: "Video", filled: !!content.videoUrl },
        { label: "Activity", filled: !!content.activityImagePreview },
        {
          label: "Quiz",
          filled: content.quizQuestions?.some((q) => q.trim()),
        },
        { label: "Project", filled: !!content.projectVideoUrl },
      ]
    : [
        { label: "Video", filled: false },
        { label: "Activity", filled: false },
        { label: "Quiz", filled: false },
        { label: "Project", filled: false },
      ];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full overflow-hidden rounded-xl border border-slate-700/50 bg-[#111827]/80 p-5 text-left backdrop-blur-sm transition-all hover:border-red-500/30 hover:bg-[#151e2f]"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700/50 text-sm font-black text-white">
            {String(index).padStart(2, "0")}
          </div>
          <div>
            <p className="text-sm font-black text-white">{title}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <StatusIcon size={12} className={cfg.color} />
              <span className={`text-[10px] font-bold ${cfg.color}`}>
                {cfg.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section indicators */}
      <div className="mt-4 grid grid-cols-4 gap-1.5">
        {sections.map((s) => (
          <div
            key={s.label}
            className={`rounded-lg border px-2 py-1.5 text-center ${
              s.filled
                ? "border-emerald-500/20 bg-emerald-500/10"
                : "border-slate-700/50 bg-slate-800/50"
            }`}
          >
            <p
              className={`text-[9px] font-bold uppercase tracking-wider ${
                s.filled ? "text-emerald-400" : "text-slate-600"
              }`}
            >
              {s.label}
            </p>
            {s.filled ? (
              <CheckCircle2
                size={12}
                className="mx-auto mt-1 text-emerald-400"
              />
            ) : (
              <div className="mx-auto mt-1 h-3 w-3 rounded-full border border-slate-600" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-red-500 opacity-0 transition group-hover:opacity-100">
        {status === "empty" ? "Add Content" : "Edit Content"}{" "}
        <ChevronRight size={11} />
      </div>
    </button>
  );
}

/* ── Stat Card ── */
function StatCard({ label, value, color = "text-white" }) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-[#111827]/80 p-4 text-center backdrop-blur-sm">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}

/* ── Field Section ── */
function FieldSection({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-[#0f172a]/60 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
          <Icon size={16} className="text-red-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">{title}</p>
          <p className="text-[11px] text-slate-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
