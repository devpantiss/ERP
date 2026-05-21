import { useEffect, useMemo, useState } from "react";
import { Activity, GraduationCap, Search, UserRound } from "lucide-react";
import {
  ProjectCard, CenterCard, BackButton, PageHeader, Breadcrumb, ProgressBar,
  usePagination, Pagination,
} from "./SuperAdminSharedComponents";
import { useProjectStore } from "../../stores/projectStore";
import { selectSuperAdminProjectHierarchy } from "../../stores/selectors/superAdminSelectors";

export default function SuperAdminTrainingTracking() {
  const { records: projects, fetchAll } = useProjectStore();
  const [projectId, setProjectId] = useState(null);
  const [centerId, setCenterId] = useState(null);
  const [batchId, setBatchId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const projectHierarchy = useMemo(() => selectSuperAdminProjectHierarchy(projects), [projects]);
  const project = projectHierarchy.find((p) => p.id === projectId);
  const center = project?.centers.find((c) => c.id === centerId);
  const selectedBatch = center?.batches.find((b) => b.id === batchId) || center?.batches[0];

  const allStudents = selectedBatch?.candidates || [];
  const q = search.toLowerCase();
  const filtered = search
    ? allStudents.filter(
      (s) => s.name.toLowerCase().includes(q) || s.batch.toLowerCase().includes(q)
    )
    : allStudents;

  const pg = usePagination(filtered);

  const breadcrumb = ["All Projects"];
  if (project) breadcrumb.push(project.name);
  if (center) breadcrumb.push(center.name);
  if (selectedBatch) breadcrumb.push(selectedBatch.label);

  return (
    <div className="space-y-6">
      <PageHeader icon={Activity} title="Training Tracking" subtitle="Project → Center → Training progress + Students" />
      <Breadcrumb items={breadcrumb} />

      {/* LEVEL 1: Projects */}
      {!project && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projectHierarchy.map((p) => {
            const totalModules = p.centers.reduce((s, c) => s + c.totalModules, 0);
            const completedModules = p.centers.reduce((s, c) => s + c.completedModules, 0);
            const pct = Math.round((completedModules / totalModules) * 100);
            return (
              <ProjectCard
                key={p.id}
                project={p}
                onClick={() => {
                  setProjectId(p.id);
                  setCenterId(null);
                  setBatchId(null);
                  setSearch("");
                }}
                stats={[
                  { label: "Centers", value: p.centers.length },
                  { label: "Modules", value: `${completedModules}/${totalModules}` },
                  { label: "Progress", value: `${pct}%`, color: pct >= 70 ? "text-emerald-300" : "text-amber-300" },
                ]}
              />
            );
          })}
        </div>
      )}

      {/* LEVEL 2: Centers */}
      {project && !center && (
        <>
          <BackButton
            onClick={() => {
              setProjectId(null);
              setCenterId(null);
              setBatchId(null);
              setSearch("");
            }}
            label="Back to projects"
          />
          <div className="grid gap-4 md:grid-cols-2">
            {project.centers.map((c) => {
              const pct = Math.round((c.completedModules / c.totalModules) * 100);
              return (
                <CenterCard
                  key={c.id}
                  center={c}
                  onClick={() => {
                    setCenterId(c.id);
                    setBatchId(c.batches[0]?.id || null);
                    setSearch("");
                    pg.setPage(1);
                  }}
                  stats={[
                    { label: "Modules", value: `${c.completedModules}/${c.totalModules}` },
                    { label: "Progress", value: `${pct}%`, color: pct >= 70 ? "text-emerald-300" : "text-amber-300" },
                    { label: "Batches", value: c.batches.length },
                  ]}
                />
              );
            })}
          </div>
        </>
      )}

      {/* LEVEL 3: Training Overview + Student Table */}
      {center && (
        <>
          <BackButton
            onClick={() => {
              setCenterId(null);
              setBatchId(null);
              setSearch("");
            }}
            label={`Back to ${project.name} centers`}
          />

          {/* Center progress overview */}
          <div className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white">{center.fullName}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {center.completedModules} of {center.totalModules} modules completed
                </p>
              </div>
              <span className="text-2xl font-black text-emerald-400">
                {Math.round((center.completedModules / center.totalModules) * 100)}%
              </span>
            </div>
            <ProgressBar value={center.completedModules} max={center.totalModules} color="bg-emerald-500" />

            {/* Per-batch progress */}
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {center.batches.map((b) => {
                const avgModule = Math.round(b.candidates.reduce((s, c) => s + c.moduleCompletion, 0) / b.candidates.length);
                const isActive = selectedBatch?.id === b.id;
                return (
                  <button
                    type="button"
                    key={b.id}
                    onClick={() => {
                      setBatchId(b.id);
                      setSearch("");
                      pg.setPage(1);
                    }}
                    className={`rounded-xl border p-4 text-left transition ${
                      isActive
                        ? "border-red-500/50 bg-red-500/10 shadow-lg shadow-red-950/20"
                        : "border-slate-700/50 bg-[#0b1220] hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black text-white">{b.label}</p>
                        <p className="mt-1 truncate text-[10px] text-slate-500">{b.jobRole} • {b.learners} learners</p>
                        <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-2 py-1 text-[10px] font-bold text-cyan-300">
                          <UserRound size={11} /> {b.trainer}
                        </p>
                      </div>
                      <GraduationCap size={17} className={isActive ? "text-red-400" : "text-slate-500"} />
                    </div>
                    <div className="mt-3">
                      <ProgressBar value={avgModule} label="Avg. Module" color={avgModule >= 70 ? "bg-emerald-500" : "bg-amber-500"} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student Training Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80 backdrop-blur-sm">
            <div className="flex flex-col gap-4 border-b border-white/[0.08] p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-black text-white">
                  {selectedBatch?.label} • {filtered.length} students
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-300">
                    <UserRound size={12} /> Trainer: {selectedBatch?.trainer}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-violet-300">
                    <GraduationCap size={12} /> {selectedBatch?.jobRole}
                  </span>
                </div>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    pg.setPage(1);
                  }}
                  className="w-56 rounded-xl border border-slate-700 bg-transparent/40 py-2.5 pl-9 pr-4 text-xs text-white/80 outline-none transition focus:border-red-500"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left" style={{ tableLayout: "fixed", minWidth: 900 }}>
                <colgroup>
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "18%" }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-white/[0.06] bg-[#0b1220] text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5">Batch</th>
                    <th className="px-5 py-3.5">Theory Hours</th>
                    <th className="px-5 py-3.5">Practical Hours</th>
                    <th className="px-5 py-3.5">Attendance</th>
                    <th className="px-5 py-3.5">Module %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pg.pageData.map((s) => (
                    <tr key={s.id} className="transition hover:bg-white/[0.02]">
                      <td className="px-5 py-3.5 truncate text-[13px] font-bold text-white/90">{s.name}</td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-black text-violet-400">{s.batch}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold text-white">{s.theoryHours}</span>
                        <span className="text-[10px] text-slate-500">/{s.totalTheory}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold text-white">{s.practicalHours}</span>
                        <span className="text-[10px] text-slate-500">/{s.totalPractical}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-black ${s.attendance >= 85 ? "text-emerald-400" : s.attendance >= 70 ? "text-amber-400" : "text-red-400"}`}>
                          {s.attendance}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-700/50">
                            <div
                              className={`h-full rounded-full ${s.moduleCompletion >= 70 ? "bg-emerald-500" : s.moduleCompletion >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ width: `${s.moduleCompletion}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-black text-white">{s.moduleCompletion}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination {...pg} />
          </div>
        </>
      )}
    </div>
  );
}
