/* ═══════════════════════════════════════════════════════════════
   Super Admin — Shared Reusable UI Components
   ═══════════════════════════════════════════════════════════════ */
import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Building2,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  GraduationCap,
  MapPin,
  Users,
} from "lucide-react";

/* ── Back Button ── */
export function BackButton({ onClick, label = "Back" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-white"
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}

/* ── Project Card ── */
export function ProjectCard({ project, stats, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-6 text-left backdrop-blur-sm transition-all hover:border-red-500/30 hover:bg-[#151e2f]"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
          <FolderKanban size={20} className="text-red-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-black tracking-tight text-white">
            {project.name}
          </p>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            {project.fundingAgency} •{" "}
            <span
              className={
                project.status === "Active"
                  ? "text-emerald-400"
                  : "text-amber-400"
              }
            >
              {project.status}
            </span>
          </p>
        </div>
      </div>

      {stats && (
        <div className="mt-5 grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-slate-700/50 bg-[#0b1220] px-3 py-2 text-center"
            >
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                {s.label}
              </p>
              <p className={`mt-1 text-lg font-black ${s.color || "text-white"}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-1 text-xs font-bold text-red-500 opacity-0 transition group-hover:opacity-100">
        Open <ChevronRight size={14} />
      </div>
    </button>
  );
}

/* ── Center Card ── */
export function CenterCard({ center, stats, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 text-left backdrop-blur-sm transition-all hover:border-red-500/30 hover:bg-[#151e2f]"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10">
          <Building2 size={18} className="text-cyan-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-white">
            {center.fullName || center.name}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
            <MapPin size={10} />
            {center.name} • Managed by {center.manager}
          </p>
        </div>
      </div>

      {stats && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-slate-700/50 bg-[#0b1220] px-2.5 py-1.5 text-center"
            >
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                {s.label}
              </p>
              <p className={`mt-0.5 text-sm font-black ${s.color || "text-white"}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-red-500 opacity-0 transition group-hover:opacity-100">
        Drill down <ChevronRight size={12} />
      </div>
    </button>
  );
}

/* ── Batch Card ── */
export function BatchCard({ batch, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full overflow-hidden rounded-xl border border-slate-700/50 bg-[#111827]/80 p-4 text-left backdrop-blur-sm transition-all hover:border-red-500/30 hover:bg-[#151e2f]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
            <GraduationCap size={16} className="text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-black text-white">{batch.label}</p>
            <p className="text-[10px] text-slate-500">
              {batch.jobRole} •{" "}
              <span
                className={
                  batch.status === "Active"
                    ? "text-emerald-400"
                    : "text-slate-400"
                }
              >
                {batch.status}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm font-black text-white">
          <Users size={14} className="text-slate-500" />
          {batch.learners}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-red-500 opacity-0 transition group-hover:opacity-100">
        View students <ChevronRight size={11} />
      </div>
    </button>
  );
}

/* ── Progress Bar ── */
export function ProgressBar({ value, max = 100, label, color = "bg-red-500" }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="font-bold text-slate-400">{label}</span>
          <span className="font-black text-white">{pct}%</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-slate-700/50">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ── Page Header ── */
export function PageHeader({ icon: Icon, title, subtitle }) {
  return (
    <div>
      <h1 className="flex items-center gap-3 text-2xl font-black tracking-tighter text-slate-100">
        <Icon size={28} className="text-red-500" />
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-sm font-bold uppercase tracking-widest text-white/60">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ── Breadcrumb Trail ── */
export function Breadcrumb({ items }) {
  return (
    <div className="mb-4 flex items-center gap-1 text-xs font-bold text-slate-500">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={12} className="text-slate-600" />}
          <span className={i === items.length - 1 ? "text-red-500" : ""}>
            {item}
          </span>
        </span>
      ))}
    </div>
  );
}

/* ── Pagination Hook ── */
const ROWS_PER_PAGE = 10;

export function usePagination(data, perPage = ROWS_PER_PAGE) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / perPage));

  // Reset to page 1 when data changes (e.g. search)
  const safePageData = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * perPage;
    return data.slice(start, start + perPage);
  }, [data, page, perPage, totalPages]);

  const safePage = Math.min(page, totalPages);

  return {
    pageData: safePageData,
    page: safePage,
    totalPages,
    setPage,
    total: data.length,
    from: data.length === 0 ? 0 : (safePage - 1) * perPage + 1,
    to: Math.min(safePage * perPage, data.length),
  };
}

/* ── Pagination Controls ── */
export function Pagination({ page, totalPages, setPage, from, to, total }) {
  if (totalPages <= 1) return null;

  // Build page numbers with ellipsis
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] px-6 py-4 sm:flex-row">
      <p className="text-[11px] font-bold text-slate-500">
        Showing <span className="text-white">{from}</span>–<span className="text-white">{to}</span> of{" "}
        <span className="text-white">{total}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/50 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={14} />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="px-1 text-[11px] text-slate-600">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg text-[11px] font-black transition ${
                p === page
                  ? "border border-red-500/40 bg-red-500/15 text-red-400"
                  : "border border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/50 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
