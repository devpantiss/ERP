import { useState, useMemo, useEffect } from "react";
import { Users, Search } from "lucide-react";
import { SA_PROJECTS } from "./superAdminData";
import {
  ProjectCard, CenterCard, BatchCard, BackButton, PageHeader, Breadcrumb,
  usePagination, Pagination,
} from "./SuperAdminSharedComponents";

const STATUS_BADGE = {
  Active: "bg-emerald-500/10 text-emerald-400",
  Completed: "bg-sky-500/10 text-sky-400",
  Dropped: "bg-red-500/10 text-red-400",
  Placed: "bg-emerald-500/10 text-emerald-400",
  "Not Placed": "bg-slate-700/50 text-slate-400",
  Pending: "bg-amber-500/10 text-amber-400",
  "N/A": "bg-slate-700/50 text-slate-500",
};

export default function SuperAdminCandidateDetails() {
  const [projectId, setProjectId] = useState(null);
  const [centerId, setCenterId] = useState(null);
  const [batchId, setBatchId] = useState(null);
  const [search, setSearch] = useState("");

  const project = SA_PROJECTS.find((p) => p.id === projectId);
  const center = project?.centers.find((c) => c.id === centerId);
  const batch = center?.batches.find((b) => b.id === batchId);

  const candidates = useMemo(() => {
    if (!batch) return [];
    if (!search) return batch.candidates;
    const q = search.toLowerCase();
    return batch.candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.course.toLowerCase().includes(q)
    );
  }, [batch, search]);

  const pg = usePagination(candidates);

  // Reset page on search change
  useEffect(() => { pg.setPage(1); }, [search]);

  const breadcrumb = ["All Projects"];
  if (project) breadcrumb.push(project.name);
  if (center) breadcrumb.push(center.name);
  if (batch) breadcrumb.push(batch.label);

  return (
    <div className="space-y-6">
      <PageHeader icon={Users} title="Candidate Details" subtitle="Project → Center → Batch → Students" />
      <Breadcrumb items={breadcrumb} />

      {/* LEVEL 1: Projects */}
      {!project && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {SA_PROJECTS.map((p) => {
            const totalCandidates = p.centers.reduce((s, c) => s + c.batches.reduce((s2, b) => s2 + b.learners, 0), 0);
            const totalCenters = p.centers.length;
            return (
              <ProjectCard
                key={p.id}
                project={p}
                onClick={() => setProjectId(p.id)}
                stats={[
                  { label: "Centers", value: totalCenters },
                  { label: "Candidates", value: totalCandidates, color: "text-cyan-300" },
                  { label: "Batches", value: p.centers.reduce((s, c) => s + c.batches.length, 0), color: "text-violet-300" },
                ]}
              />
            );
          })}
        </div>
      )}

      {/* LEVEL 2: Centers */}
      {project && !center && (
        <>
          <BackButton onClick={() => setProjectId(null)} label="Back to projects" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {project.centers.map((c) => (
              <CenterCard
                key={c.id}
                center={c}
                onClick={() => setCenterId(c.id)}
                stats={[
                  { label: "Batches", value: c.batches.length },
                  { label: "Learners", value: c.batches.reduce((s, b) => s + b.learners, 0), color: "text-cyan-300" },
                  { label: "Active", value: c.batches.filter((b) => b.status === "Active").length, color: "text-emerald-300" },
                ]}
              />
            ))}
          </div>
        </>
      )}

      {/* LEVEL 3: Batches */}
      {center && !batch && (
        <>
          <BackButton onClick={() => setCenterId(null)} label={`Back to ${project.name} centers`} />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {center.batches.map((b) => (
              <BatchCard key={b.id} batch={b} onClick={() => { setBatchId(b.id); setSearch(""); pg.setPage(1); }} />
            ))}
          </div>
        </>
      )}

      {/* LEVEL 4: Candidate Table */}
      {batch && (
        <>
          <BackButton onClick={() => setBatchId(null)} label={`Back to ${center.name} batches`} />

          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80 backdrop-blur-sm">
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-white/[0.08] p-5">
              <p className="text-sm font-black text-white">
                {candidates.length} <span className="font-bold text-slate-500">students</span>
              </p>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64 rounded-xl border border-slate-700 bg-transparent/40 py-2.5 pl-9 pr-4 text-xs text-white/80 outline-none transition focus:border-red-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left" style={{ tableLayout: "fixed", minWidth: 960 }}>
                <colgroup>
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "17%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "11%" }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-white/[0.06] bg-[#0b1220] text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <th className="px-5 py-3.5">ID</th>
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5">Center</th>
                    <th className="px-5 py-3.5">Batch</th>
                    <th className="px-5 py-3.5">Course</th>
                    <th className="px-5 py-3.5">Enrolled</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Placement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pg.pageData.map((c) => (
                    <tr key={c.id} className="transition hover:bg-white/[0.02]">
                      <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-red-500/70 truncate">{c.id}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-700 text-[10px] font-black text-white">
                            {c.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <span className="truncate text-[13px] font-bold text-white/90">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-white/60">{c.center}</td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-black text-violet-400">
                          {c.batch}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 truncate text-xs font-medium text-white/60">{c.course}</td>
                      <td className="px-5 py-3.5 text-[11px] font-bold text-slate-500">{c.enrollmentDate}</td>
                      <td className="px-5 py-3.5">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${STATUS_BADGE[c.status]}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${STATUS_BADGE[c.placementStatus]}`}>
                          {c.placementStatus}
                        </span>
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
