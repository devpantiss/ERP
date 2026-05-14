import { useState, useEffect } from "react";
import { Megaphone, UserPlus, UserMinus, Users, Search, ChevronRight } from "lucide-react";
import { SA_PROJECTS } from "./superAdminData";
import {
  ProjectCard, BackButton, PageHeader, Breadcrumb, ProgressBar,
  usePagination, Pagination,
} from "./SuperAdminSharedComponents";

const MOB_STATUS_BADGE = {
  Enrolled: "bg-emerald-500/10 text-emerald-400",
  Dropped: "bg-red-500/10 text-red-400",
  Pending: "bg-amber-500/10 text-amber-400",
};

const formatPhone = (seed) =>
  `+91 ${9870000000 + ((seed * 7919) % 9999999)}`.replace(/(\d{2})(\d{5})(\d{5})/, "$1 $2 $3");

export default function SuperAdminMobilization() {
  const [projectId, setProjectId] = useState(null);
  const [centerId, setCenterId] = useState(null);
  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("All");
  const [courseFilter, setCourseFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const project = SA_PROJECTS.find((p) => p.id === projectId);
  const center = project?.centers.find((c) => c.id === centerId);

  const mobilizedList = buildMobilizedList(center);
  const filtered = filterMobilizedList(mobilizedList, { search, batchFilter, courseFilter, statusFilter });
  const batchOptions = ["All", ...new Set(mobilizedList.map((c) => c.batch))];
  const courseOptions = ["All", ...new Set(mobilizedList.map((c) => c.course))];
  const statusOptions = ["All", ...new Set(mobilizedList.map((c) => c.mobStatus))];

  const pg = usePagination(filtered);
  useEffect(() => { pg.setPage(1); }, [search, centerId, batchFilter, courseFilter, statusFilter]);

  const breadcrumb = ["All Projects"];
  if (project) breadcrumb.push(project.name);
  if (center) breadcrumb.push(center.name);

  return (
    <div className="space-y-6">
      <PageHeader icon={Megaphone} title="Mobilization Overview" subtitle="Project → Center → Mobilized Candidates" />
      <Breadcrumb items={breadcrumb} />

      {/* LEVEL 1: Projects */}
      {!project && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {SA_PROJECTS.map((p) => {
            const totMob = p.centers.reduce((s, c) => s + c.mobilization.mobilized, 0);
            const totEnr = p.centers.reduce((s, c) => s + c.mobilization.enrolled, 0);
            const totDrop = p.centers.reduce((s, c) => s + c.mobilization.dropoffs, 0);
            return (
              <ProjectCard
                key={p.id}
                project={p}
                onClick={() => setProjectId(p.id)}
                stats={[
                  { label: "Mobilized", value: totMob, color: "text-cyan-300" },
                  { label: "Enrolled", value: totEnr, color: "text-emerald-300" },
                  { label: "Drop-offs", value: totDrop, color: "text-red-400" },
                ]}
              />
            );
          })}
        </div>
      )}

      {/* LEVEL 2: Center-wise mobilization */}
      {project && !center && (
        <>
          <BackButton onClick={() => setProjectId(null)} label="Back to projects" />

          {/* Summary strip */}
          {(() => {
            const totMob = project.centers.reduce((s, c) => s + c.mobilization.mobilized, 0);
            const totEnr = project.centers.reduce((s, c) => s + c.mobilization.enrolled, 0);
            const totDrop = project.centers.reduce((s, c) => s + c.mobilization.dropoffs, 0);
            return (
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { label: "Total Mobilized", value: totMob, icon: Users, color: "text-cyan-400", bg: "bg-cyan-500/10" },
                  { label: "Total Enrolled", value: totEnr, icon: UserPlus, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                  { label: "Total Drop-offs", value: totDrop, icon: UserMinus, color: "text-red-400", bg: "bg-red-500/10" },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{s.label}</span>
                      <div className={`rounded-xl p-2 ${s.bg}`}><s.icon size={16} className={s.color} /></div>
                    </div>
                    <p className={`mt-3 text-3xl font-black ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Per-center cards — now clickable to drill into candidate list */}
          <div className="grid gap-5 md:grid-cols-2">
            {project.centers.map((c) => {
              const { mobilized, enrolled, dropoffs } = c.mobilization;
              const conversionRate = Math.round((enrolled / mobilized) * 100);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { setCenterId(c.id); setSearch(""); setBatchFilter("All"); setCourseFilter("All"); setStatusFilter("All"); }}
                  className="group w-full rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-6 text-left backdrop-blur-sm transition-all hover:border-red-500/30 hover:bg-[#151e2f]"
                >
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10">
                      <Megaphone size={18} className="text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{c.fullName}</p>
                      <p className="text-[10px] text-slate-500">Managed by {c.manager}</p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="mb-5 grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-slate-700/50 bg-[#0b1220] px-3 py-2.5 text-center">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Mobilized</p>
                      <p className="mt-0.5 text-lg font-black text-cyan-300">{mobilized}</p>
                    </div>
                    <div className="rounded-xl border border-slate-700/50 bg-[#0b1220] px-3 py-2.5 text-center">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Enrolled</p>
                      <p className="mt-0.5 text-lg font-black text-emerald-300">{enrolled}</p>
                    </div>
                    <div className="rounded-xl border border-slate-700/50 bg-[#0b1220] px-3 py-2.5 text-center">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Drop-offs</p>
                      <p className="mt-0.5 text-lg font-black text-red-400">{dropoffs}</p>
                    </div>
                  </div>

                  {/* Bars */}
                  <div className="space-y-3">
                    <ProgressBar label="Conversion Rate" value={conversionRate} color="bg-emerald-500" />
                    <div>
                      <p className="mb-1.5 text-[11px] font-bold text-slate-400">Distribution</p>
                      <div className="flex h-5 overflow-hidden rounded-full">
                        <div className="bg-emerald-500 transition-all" style={{ width: `${(enrolled / mobilized) * 100}%` }} />
                        <div className="bg-red-500 transition-all" style={{ width: `${(dropoffs / mobilized) * 100}%` }} />
                        <div className="flex-1 bg-slate-700/50" />
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-[10px]">
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Enrolled</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Dropped</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-600" /> Pending</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-red-500 opacity-0 transition group-hover:opacity-100">
                    View mobilized list <ChevronRight size={12} />
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* LEVEL 3: Mobilized Candidates List */}
      {center && (
        <>
          <BackButton onClick={() => setCenterId(null)} label={`Back to ${project.name} centers`} />

          {/* Center summary strip */}
          {(() => {
            const { mobilized, enrolled, dropoffs } = center.mobilization;
            const pending = mobilized - enrolled - dropoffs;
            return (
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  { label: "Total Mobilized", value: mobilized, color: "text-cyan-300" },
                  { label: "Enrolled", value: enrolled, color: "text-emerald-300" },
                  { label: "Drop-offs", value: dropoffs, color: "text-red-400" },
                  { label: "Pending", value: Math.max(0, pending), color: "text-amber-300" },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-4 text-center backdrop-blur-sm">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{s.label}</p>
                    <p className={`mt-1 text-xl font-black ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Mobilized candidates table */}
          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/[0.08] p-5">
              <p className="text-sm font-black text-white">
                {filtered.length} <span className="font-bold text-slate-500">mobilized candidates</span>
              </p>
              <div className="flex flex-wrap items-center justify-end gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by name, status..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64 rounded-xl border border-slate-700 bg-transparent/40 py-2.5 pl-9 pr-4 text-xs text-white/80 outline-none transition focus:border-red-500"
                  />
                </div>
                <TableFilter value={batchFilter} onChange={setBatchFilter} options={batchOptions} allLabel="All Batches" />
                <TableFilter value={courseFilter} onChange={setCourseFilter} options={courseOptions} allLabel="All Job Roles" />
                <TableFilter value={statusFilter} onChange={setStatusFilter} options={statusOptions} allLabel="All Status" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left" style={{ tableLayout: "fixed", minWidth: 960 }}>
                <colgroup>
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "17%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "14%" }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-white/[0.06] bg-[#0b1220] text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <th className="px-5 py-3.5">ID</th>
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5">Phone</th>
                    <th className="px-5 py-3.5">Batch</th>
                    <th className="px-5 py-3.5">Course</th>
                    <th className="px-5 py-3.5">Mob. Date</th>
                    <th className="px-5 py-3.5">Enrollment</th>
                    <th className="px-5 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pg.pageData.map((c) => (
                    <tr key={c.id} className="transition hover:bg-white/[0.02]">
                      <td className="truncate px-5 py-3.5 font-mono text-[11px] font-bold text-red-500/70">{c.id}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-700 text-[10px] font-black text-white">
                            {c.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <span className="truncate text-[13px] font-bold text-white/90">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-white/60">{c.phone}</td>
                      <td className="px-5 py-3.5">
                        {c.batch === "—" ? (
                          <span className="text-xs text-slate-500">—</span>
                        ) : (
                          <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-black text-violet-400">{c.batch}</span>
                        )}
                      </td>
                      <td className="truncate px-5 py-3.5 text-xs text-white/60">{c.course}</td>
                      <td className="px-5 py-3.5 text-[11px] font-bold text-slate-500">{c.mobilizationDate}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-black uppercase ${c.mobStatus === "Enrolled" ? "text-emerald-400" : c.mobStatus === "Dropped" ? "text-red-400" : "text-amber-400"}`}>
                          {c.mobStatus === "Enrolled" ? "✓ Enrolled" : c.mobStatus === "Dropped" ? "✗ Dropped" : "⏳ Pending"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${MOB_STATUS_BADGE[c.mobStatus]}`}>
                          {c.mobStatus}
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

function buildMobilizedList(center) {
  if (!center) return [];
  const { mobilized, enrolled, dropoffs } = center.mobilization;
  const batchCandidates = center.batches.flatMap((batch) => batch.candidates);

  const list = batchCandidates.map((candidate, index) => ({
    id: `MOB-${center.name.slice(0, 3).toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
    name: candidate.name,
    center: center.name,
    batch: candidate.batch,
    course: candidate.course,
    mobilizationDate: candidate.enrollmentDate,
    mobStatus: candidate.status === "Dropped" ? "Dropped" : "Enrolled",
    phone: formatPhone(index + 1),
  }));

  const pending = mobilized - enrolled - dropoffs;
  const extraNames = [
    "Tapan Rout", "Prakash Majhi", "Kabita Das", "Lopamudra Deo", "Dinesh Pradhan",
    "Rina Pattnaik", "Aparna Sethy", "Rahul Pradhan", "Subrat Jena", "Ranjita Mohanta",
    "Monalisa Mohanty", "Sneha Swain", "Priyanka Behera", "Nihar Ranjan", "Pallavi Nayak",
    "Sanjay Das", "Aditya Sahu", "Bikash Naik", "Suresh Naik", "Ritu Mohapatra",
  ];

  for (let index = 0; index < Math.max(0, pending); index++) {
    list.push({
      id: `MOB-${center.name.slice(0, 3).toUpperCase()}-P${String(index + 1).padStart(3, "0")}`,
      name: extraNames[index % extraNames.length],
      center: center.name,
      batch: "—",
      course: "—",
      mobilizationDate: `2025-${String(3 + (index % 8)).padStart(2, "0")}-${String(1 + (index % 28)).padStart(2, "0")}`,
      mobStatus: "Pending",
      phone: formatPhone(batchCandidates.length + index + 1),
    });
  }

  return list;
}

function filterMobilizedList(candidates, filters) {
  const query = filters.search.toLowerCase();
  return candidates.filter((candidate) => {
    const matchesSearch =
      !query ||
      candidate.name.toLowerCase().includes(query) ||
      candidate.mobStatus.toLowerCase().includes(query) ||
      candidate.batch.toLowerCase().includes(query) ||
      candidate.course.toLowerCase().includes(query) ||
      candidate.center.toLowerCase().includes(query);
    const matchesBatch = filters.batchFilter === "All" || candidate.batch === filters.batchFilter;
    const matchesCourse = filters.courseFilter === "All" || candidate.course === filters.courseFilter;
    const matchesStatus = filters.statusFilter === "All" || candidate.mobStatus === filters.statusFilter;
    return matchesSearch && matchesBatch && matchesCourse && matchesStatus;
  });
}

function TableFilter({ value, onChange, options, allLabel }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2.5 text-xs text-white/80 outline-none transition focus:border-red-500"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option === "All" ? allLabel : option}
        </option>
      ))}
    </select>
  );
}
