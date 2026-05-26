import { useState, useMemo, useEffect } from "react";
import { Briefcase, Search, CalendarDays, Users, ChevronRight, Trophy, Building2, FileText, ExternalLink } from "lucide-react";
import SlidePanel from "../../components/common/SlidePanel";
import { ProjectCard, BackButton, PageHeader, Breadcrumb, usePagination, Pagination } from "./SuperAdminSharedComponents";
import { usePlacementStore } from "../../stores/placementStore";
import { useProjectStore } from "../../stores/projectStore";
import {
  selectSuperAdminPlacementDrives,
  selectSuperAdminProjectHierarchy,
} from "../../stores/selectors/superAdminSelectors";

const STATUS_BADGE = {
  Selected: "bg-emerald-500/10 text-emerald-400",
  Rejected: "bg-red-500/10 text-red-400",
  Pending: "bg-amber-500/10 text-amber-400",
};

const SAMPLE_DOCUMENT_URL = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

const buildPlacementDriveDocuments = (drive) => [
  {
    key: "invitation",
    label: "Employer Invitation",
    name: `${drive.company || "company"}-drive-invitation.pdf`,
    url: SAMPLE_DOCUMENT_URL,
    uploadedOn: drive.date,
  },
  {
    key: "attendance",
    label: "Candidate Attendance Sheet",
    name: `${drive.driveName || "placement-drive"}-attendance.pdf`,
    url: SAMPLE_DOCUMENT_URL,
    uploadedOn: drive.date,
  },
  {
    key: "selection",
    label: "Selection List",
    name: `${drive.company || "company"}-selection-list.pdf`,
    url: SAMPLE_DOCUMENT_URL,
    uploadedOn: drive.date,
  },
  {
    key: "offer",
    label: "Offer Letter Bundle",
    name: `${drive.company || "company"}-offer-letters.pdf`,
    url: SAMPLE_DOCUMENT_URL,
    uploadedOn: drive.date,
  },
];

export default function SuperAdminPlacementDrives() {
  const { records: projectRecords, fetchAll: fetchProjects } = useProjectStore();
  const { drives: driveRecords, fetchDrives } = usePlacementStore();
  const [projectId, setProjectId] = useState(null);
  const [driveId, setDriveId] = useState(null);
  const [search, setSearch] = useState("");
  const [documentDrive, setDocumentDrive] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchDrives();
  }, [fetchDrives, fetchProjects]);

  const projects = useMemo(() => selectSuperAdminProjectHierarchy(projectRecords), [projectRecords]);
  const placementDrives = useMemo(() => selectSuperAdminPlacementDrives(driveRecords), [driveRecords]);
  const project = projects.find((p) => p.id === projectId);
  const drives = useMemo(() => {
    if (!project) return [];
    return placementDrives.filter((d) => d.projectId === project.id);
  }, [placementDrives, project]);
  const drive = placementDrives.find((d) => d.id === driveId);

  const students = useMemo(() => {
    if (!drive?.students) return [];
    if (!search) return drive.students;
    const q = search.toLowerCase();
    return drive.students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.center.toLowerCase().includes(q) || s.course.toLowerCase().includes(q)
    );
  }, [drive, search]);
  const placedCandidates = useMemo(
    () => (drive?.students || []).filter((student) => student.status === "Selected"),
    [drive]
  );

  const pg = usePagination(students);
  const resetPage = pg.setPage;
  useEffect(() => { resetPage(1); }, [resetPage, search]);

  const breadcrumb = ["All Projects"];
  if (project) breadcrumb.push(project.name);
  if (drive) breadcrumb.push(drive.driveName);

  return (
    <div className="space-y-6">
      <PageHeader icon={Briefcase} title="Placement Drives" subtitle="Project → Drive → Students" />
      <Breadcrumb items={breadcrumb} />

      {/* LEVEL 1: Projects */}
      {!project && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => {
            const pDrives = placementDrives.filter((d) => d.projectId === p.id);
            const totalSelected = pDrives.reduce((s, d) => s + d.selected, 0);
            return (
              <ProjectCard
                key={p.id}
                project={p}
                onClick={() => setProjectId(p.id)}
                stats={[
                  { label: "Drives", value: pDrives.length },
                  { label: "Participated", value: pDrives.reduce((s, d) => s + d.participated, 0), color: "text-cyan-300" },
                  { label: "Selected", value: totalSelected, color: "text-emerald-300" },
                ]}
              />
            );
          })}
        </div>
      )}

      {/* LEVEL 2: Drive Cards */}
      {project && !drive && (
        <>
          <BackButton onClick={() => setProjectId(null)} label="Back to projects" />
          <div className="grid gap-4 md:grid-cols-2">
            {drives.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => { setDriveId(d.id); setSearch(""); pg.setPage(1); }}
                className="group w-full overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 text-left backdrop-blur-sm transition-all hover:border-red-500/30 hover:bg-[#151e2f]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
                      <Building2 size={20} className="text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{d.driveName}</p>
                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        {d.company}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-700/50 bg-[#0b1220] px-3 py-2">
                    <CalendarDays size={14} className="text-slate-500" />
                    <span className="text-[11px] font-bold text-white/80">{d.date}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-700/50 bg-[#0b1220] px-3 py-2">
                    <Users size={14} className="text-cyan-400" />
                    <span className="text-[11px] font-bold text-white/80">{d.participated} joined</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-700/50 bg-[#0b1220] px-3 py-2">
                    <Trophy size={14} className="text-emerald-400" />
                    <span className="text-[11px] font-bold text-emerald-300">{d.selected} selected</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-red-500 opacity-0 transition group-hover:opacity-100">
                  View students <ChevronRight size={12} />
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* LEVEL 3: Student Table */}
      {drive && (
        <>
          <BackButton onClick={() => setDriveId(null)} label={`Back to ${project.name} drives`} />

          {/* Drive summary */}
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Company", value: drive.company, color: "text-white" },
              { label: "Date", value: drive.date, color: "text-white" },
              { label: "Participated", value: drive.participated, color: "text-cyan-300" },
              { label: "Selected", value: drive.selected, color: "text-emerald-300" },
              { label: "Documents", value: buildPlacementDriveDocuments(drive).length, color: "text-violet-300" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-4 text-center backdrop-blur-sm">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{s.label}</p>
                <p className={`mt-1 text-lg font-black ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <section className="rounded-2xl border border-violet-400/20 bg-violet-500/[0.04] p-5 backdrop-blur-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-violet-200">Uploaded Documents</p>
                <p className="mt-1 text-xs text-violet-100/45">
                  Review invitation, attendance, selection, and offer documents in the project-style overlay.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDocumentDrive(drive)}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-violet-400/25 bg-violet-500/10 px-4 py-2.5 text-xs font-black uppercase text-violet-100 transition hover:border-violet-300/50 hover:bg-violet-500/20"
              >
                <FileText size={14} />
                View Documents
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.04] backdrop-blur-sm">
            <div className="flex flex-col gap-2 border-b border-emerald-400/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-200">
                  Candidates Placed During This Drive
                </p>
                <p className="mt-1 text-xs text-emerald-100/45">
                  {placedCandidates.length} selected candidate{placedCandidates.length === 1 ? "" : "s"} from {drive.driveName}.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-black text-emerald-200">
                <Trophy size={13} />
                {placedCandidates.length} placed
              </span>
            </div>

            {placedCandidates.length ? (
              <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
                {placedCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="rounded-2xl border border-emerald-400/15 bg-[#0b1220]/80 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-white">{candidate.name}</p>
                        <p className="mt-1 text-xs text-white/45">
                          {candidate.center} · {candidate.batch}
                        </p>
                      </div>
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-300">
                        Placed
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <MiniInfo label="Job Role" value={candidate.course} />
                      <MiniInfo
                        label="Salary"
                        value={candidate.salary ? `₹${candidate.salary.toLocaleString("en-IN")}` : "Not added"}
                        tone="text-emerald-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-10 text-center text-sm font-bold text-emerald-100/45">
                No candidates have been marked as placed for this drive yet.
              </div>
            )}
          </section>

          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/[0.08] p-5">
              <p className="text-sm font-black text-white">{students.length} students</p>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-56 rounded-xl border border-slate-700 bg-transparent/40 py-2.5 pl-9 pr-4 text-xs text-white/80 outline-none transition focus:border-red-500"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left" style={{ tableLayout: "fixed", minWidth: 820 }}>
                <colgroup>
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "16%" }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-white/[0.06] bg-[#0b1220] text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5">Center</th>
                    <th className="px-5 py-3.5">Batch</th>
                    <th className="px-5 py-3.5">Course</th>
                    <th className="px-5 py-3.5">Salary</th>
                    <th className="px-5 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pg.pageData.map((s) => (
                    <tr key={s.id} className="transition hover:bg-white/[0.02]">
                      <td className="px-5 py-3.5 truncate text-[13px] font-bold text-white/90">{s.name}</td>
                      <td className="px-5 py-3.5 text-xs text-white/60">{s.center}</td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-black text-violet-400">{s.batch}</span>
                      </td>
                      <td className="px-5 py-3.5 truncate text-xs text-white/60">{s.course}</td>
                      <td className="px-5 py-3.5 text-sm font-black text-emerald-300">{s.salary ? `₹${(s.salary).toLocaleString()}` : "—"}</td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${STATUS_BADGE[s.status]}`}>{s.status}</span>
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

      <PlacementDriveDocumentPanel
        drive={documentDrive}
        onClose={() => setDocumentDrive(null)}
      />
    </div>
  );
}

function PlacementDriveDocumentPanel({ drive, onClose }) {
  const documents = useMemo(() => (drive ? buildPlacementDriveDocuments(drive) : []), [drive]);
  const [activeKey, setActiveKey] = useState("");

  useEffect(() => {
    setActiveKey(documents[0]?.key || "");
  }, [documents]);

  const activeDocument = documents.find((document) => document.key === activeKey) || documents[0];

  return (
    <SlidePanel open={!!drive} onClose={onClose} title={drive?.driveName || "Placement Drive Documents"} width="3xl">
      {drive ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-violet-400/15 bg-violet-500/[0.06] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">Zoho Projects Style Document Review</p>
            <p className="mt-2 text-sm font-black text-white">{drive.company}</p>
            <p className="mt-1 text-xs text-slate-400">{drive.date} • {drive.participated} participated • {drive.selected} selected</p>
          </div>

          <div className="flex gap-2 overflow-x-auto border-b border-white/10">
            {documents.map((document) => (
              <button
                key={document.key}
                type="button"
                onClick={() => setActiveKey(document.key)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-black transition ${
                  activeDocument?.key === document.key ? "border-violet-400 text-violet-200" : "border-transparent text-slate-500 hover:text-white"
                }`}
              >
                <FileText size={14} />
                {document.label}
              </button>
            ))}
          </div>

          {activeDocument && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-white">{activeDocument.label}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{activeDocument.name} • Uploaded {activeDocument.uploadedOn}</p>
                </div>
                <a href={activeDocument.url} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-slate-200 transition hover:border-violet-400/35 hover:bg-violet-500/15 hover:text-white">
                  <ExternalLink size={13} />
                  Open file
                </a>
              </div>
              <iframe src={activeDocument.url} title={activeDocument.label} className="h-[clamp(260px,calc(100vh-31rem),520px)] w-full rounded-2xl border border-white/10 bg-white" />
            </div>
          )}
        </div>
      ) : null}
    </SlidePanel>
  );
}

function MiniInfo({ label, value, tone = "text-white/80" }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/35">{label}</p>
      <p className={`mt-1 truncate text-xs font-black ${tone}`}>{value}</p>
    </div>
  );
}
