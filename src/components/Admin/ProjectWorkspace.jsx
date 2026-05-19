import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, Users } from "lucide-react";

export function ProjectCards({
  projects,
  onSelect,
  emptyMessage = "No projects available.",
  countLabel = "Total Employees",
}) {
  if (!projects.length) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-[#111827] p-6 text-sm text-white/60">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <button
          key={project.id || project.name}
          type="button"
          onClick={() => onSelect(project)}
          className="admin-project-card group relative overflow-hidden rounded-2xl border border-slate-700 bg-[#111827] p-5 text-left transition hover:-translate-y-1 hover:border-violet-400/45 hover:bg-[#121c2d] focus:outline-none focus:ring-2 focus:ring-violet-400/40"
        >
          <div className="admin-project-card__halo" />
          <div className="admin-project-card__surface" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="admin-project-card__icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                <BriefcaseBusiness size={19} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-white/90">{project.name}</p>
                {project.center && <p className="mt-1 truncate text-xs text-white/45">{project.center}</p>}
              </div>
            </div>
            <span className="admin-project-card__launch flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-violet-200 transition">
              <ArrowUpRight size={15} />
            </span>
          </div>

          <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-slate-800/80">
            <span className="block h-full w-2/3 rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-300 to-emerald-300" />
          </div>

          <div className="admin-project-card__stat relative mt-5 flex items-center justify-between rounded-xl border border-slate-700/70 bg-[#0b1220] px-4 py-3">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-white/55">
              <Users size={14} className="text-violet-300" />
              {countLabel}
            </span>
            <span className="text-xl font-semibold text-white">{project.employeeCount}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

export function WorkspaceHeader({ title, subtitle, selectedProject, onBack }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-white/60">{subtitle}</p>}
      </div>
      {selectedProject && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-700 bg-[#111827] px-4 py-2 text-sm font-medium text-white/80 transition hover:border-violet-400/50 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      )}
    </div>
  );
}

export function DataTable({ columns, rows, minWidth = "900px", emptyMessage = "No records found." }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700 bg-[#111827]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth }}>
          <thead className="bg-[#0b1220] text-white/60">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={column.headerClassName || "p-4 text-left"}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-700/60 transition hover:bg-white/[0.03]">
                  {columns.map((column) => (
                    <td key={column.key} className={column.cellClassName || "p-4 text-white/75"}>
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr className="border-t border-slate-700/60">
                <td colSpan={columns.length} className="p-6 text-center text-white/50">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ApprovalToggle({ checked, onChange, approveLabel = "Approve", holdLabel = "Hold" }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`inline-flex min-w-[132px] items-center justify-between whitespace-nowrap rounded-full border px-2 py-1 text-xs font-semibold transition ${
        checked
          ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
          : "border-amber-400/30 bg-amber-500/15 text-amber-200"
      }`}
      aria-pressed={checked}
    >
      <span className={`rounded-full px-2 py-1 ${checked ? "bg-emerald-400 text-slate-950" : "bg-transparent"}`}>
        {approveLabel}
      </span>
      <span className={`rounded-full px-2 py-1 ${checked ? "bg-transparent" : "bg-amber-300 text-slate-950"}`}>
        {holdLabel}
      </span>
    </button>
  );
}
