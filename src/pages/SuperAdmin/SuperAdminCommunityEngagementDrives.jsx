import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarDays,
  Camera,
  Eye,
  FileImage,
  ImageIcon,
  MapPin,
  Megaphone,
  Phone,
  Search,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { BackButton, PageHeader, Pagination, usePagination } from "./SuperAdminSharedComponents";
import { useProjectStore } from "../../stores/projectStore";
import { selectCommunityEngagementReports } from "../../stores/selectors/superAdminSelectors";

const STATUS_BADGE = {
  Planned: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Approved: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Completed: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Submitted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function SummaryCard({ label, value, color = "text-white", children }) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</p>
          <p className={`mt-2 text-2xl font-black ${color}`}>{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
          {children}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${STATUS_BADGE[status]}`}>
      {status}
    </span>
  );
}

function ProofCell({ drive, onView }) {
  const proofCount = drive.proofImages.length;
  const hasProof = proofCount > 0;

  return (
    <td className="px-5 py-4">
      <div
        className={`ml-auto max-w-[290px] rounded-xl border p-3 text-left ${
          hasProof
            ? "border-emerald-500/20 bg-emerald-500/[0.04]"
            : "border-slate-700/70 bg-[#0b1220]/80"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={drive.status} />
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
              hasProof ? "bg-cyan-500/10 text-cyan-300" : "bg-slate-800 text-slate-500"
            }`}
          >
            <ImageIcon size={11} />
            {hasProof ? `${proofCount} Photos` : "No Proof"}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          {hasProof ? (
            <div className="flex min-w-0 items-center">
              {drive.proofImages.slice(0, 4).map((image, idx) => (
                <img
                  key={image}
                  src={image}
                  alt={`${drive.id} proof ${idx + 1}`}
                  className={`${idx > 0 ? "-ml-2" : ""} h-11 w-12 rounded-lg border border-slate-800 object-cover shadow-md shadow-black/30`}
                />
              ))}
              {proofCount > 4 && (
                <span className="-ml-2 flex h-11 w-12 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-[10px] font-black text-white">
                  +{proofCount - 4}
                </span>
              )}
            </div>
          ) : (
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-10 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/70">
                <Camera size={14} className="text-slate-500" />
              </span>
              <span className="truncate text-[10px] font-bold text-slate-500">
                {drive.status === "Planned" ? "Drive planned" : "Awaiting upload"}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => onView(drive)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-[10px] font-black uppercase text-white/75 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-white"
          >
            <Eye size={12} /> View
          </button>
        </div>
      </div>
    </td>
  );
}

export default function SuperAdminCommunityEngagementDrives() {
  const { records: projects, fetchAll } = useProjectStore();
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [blockFilter, setBlockFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const { projectStats, drives, blocks, types, statuses } = useMemo(
    () => selectCommunityEngagementReports(projects),
    [projects]
  );

  const projectDrives = useMemo(
    () => drives.filter((drive) => drive.projectId === selectedProject),
    [drives, selectedProject]
  );
  const selectedProjectName = projectStats.find((project) => project.projectId === selectedProject)?.project || selectedProject;

  const filteredDrives = useMemo(() => {
    const q = search.toLowerCase();
    return projectDrives.filter((drive) => {
      const matchesSearch = !q ||
        drive.driveName.toLowerCase().includes(q) ||
        drive.mobilizer.toLowerCase().includes(q) ||
        drive.center.toLowerCase().includes(q) ||
        drive.block.toLowerCase().includes(q) ||
        drive.gp.toLowerCase().includes(q);
      const matchesBlock = !blockFilter || drive.block === blockFilter;
      const matchesType = !typeFilter || drive.type === typeFilter;
      const matchesStatus = !statusFilter || drive.status === statusFilter;
      return matchesSearch && matchesBlock && matchesType && matchesStatus;
    });
  }, [blockFilter, projectDrives, search, statusFilter, typeFilter]);

  const summary = useMemo(() => ({
    total: filteredDrives.length,
    submitted: filteredDrives.filter((drive) => drive.status === "Submitted").length,
    participants: filteredDrives.reduce((sum, drive) => sum + drive.participants, 0),
    enrolled: filteredDrives.reduce((sum, drive) => sum + drive.enrolled, 0),
    proofs: filteredDrives.reduce((sum, drive) => sum + drive.proofImages.length, 0),
  }), [filteredDrives]);

  const pg = usePagination(filteredDrives, 8);

  const chooseProject = (projectId) => {
    setSelectedProject(projectId);
    setSearch("");
    setBlockFilter("");
    setTypeFilter("");
    setStatusFilter("");
    setSelectedDrive(null);
    pg.setPage(1);
  };

  const backToProjects = () => {
    setSelectedProject("");
    setSearch("");
    setBlockFilter("");
    setTypeFilter("");
    setStatusFilter("");
    setSelectedDrive(null);
    pg.setPage(1);
  };

  const openDrive = (drive) => {
    setSelectedDrive(drive);
    setActiveImage(drive.proofImages[0] || null);
  };

  return (
    <div className="space-y-6">
      <PageHeader icon={Megaphone} title="Community Engagement Drives" subtitle="Mobilization drive reports, turnout, leads, and proof gallery" />

      {!selectedProject ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {projectStats.map(({ projectId, project, drives, submitted, participants, proofs }) => (
              <button
                type="button"
                key={projectId}
                onClick={() => chooseProject(projectId)}
                className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 text-left transition hover:border-slate-600"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-white">{project}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {drives} drives / {submitted} submitted
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04]">
                    <Megaphone size={18} className="text-slate-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.18em]">
                  <span className="text-cyan-300/80">{participants} participants</span>
                  <span className="text-red-300/80">{proofs} proofs</span>
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-dashed border-slate-700/70 bg-[#111827]/70 p-10 text-center">
            <Building2 size={30} className="mx-auto text-slate-500" />
            <p className="mt-4 text-sm font-black text-white">Select a project to view community engagement drives.</p>
          </div>
        </>
      ) : (
        <>
          <BackButton onClick={backToProjects} label="Back to projects" />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <SummaryCard label="Drives" value={summary.total} color="text-red-400">
              <CalendarDays size={18} className="text-red-400" />
            </SummaryCard>
            <SummaryCard label="Submitted" value={summary.submitted} color="text-emerald-400">
              <FileImage size={18} className="text-emerald-400" />
            </SummaryCard>
            <SummaryCard label="Participants" value={summary.participants} color="text-cyan-400">
              <Users size={18} className="text-cyan-400" />
            </SummaryCard>
            <SummaryCard label="Enrolled" value={summary.enrolled} color="text-violet-400">
              <UserCheck size={18} className="text-violet-400" />
            </SummaryCard>
            <SummaryCard label="Proof Images" value={summary.proofs} color="text-amber-400">
              <ImageIcon size={18} className="text-amber-400" />
            </SummaryCard>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80 backdrop-blur-sm">
            <div className="flex flex-col gap-4 border-b border-white/[0.08] p-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm font-black text-white">{selectedProjectName}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {filteredDrives.length} of {projectDrives.length} community engagement drive reports
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <div className="relative md:col-span-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      pg.setPage(1);
                    }}
                    placeholder="Search..."
                    className="w-full rounded-xl border border-slate-700 bg-transparent/40 py-2.5 pl-9 pr-4 text-xs text-white/80 outline-none transition focus:border-red-500"
                  />
                </div>
                <select value={blockFilter} onChange={(e) => { setBlockFilter(e.target.value); pg.setPage(1); }} className="rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2.5 text-xs text-white/80 outline-none focus:border-red-500">
                  <option value="">All Blocks</option>
                  {blocks.map((block) => <option key={block} value={block}>{block}</option>)}
                </select>
                <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); pg.setPage(1); }} className="rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2.5 text-xs text-white/80 outline-none focus:border-red-500">
                  <option value="">All Types</option>
                  {types.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); pg.setPage(1); }} className="rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2.5 text-xs text-white/80 outline-none focus:border-red-500">
                  <option value="">All Status</option>
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-left" style={{ minWidth: 1280 }}>
                <colgroup>
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "21%" }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-white/[0.06] bg-[#0b1220] text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <th className="px-5 py-3.5">Drive</th>
                    <th className="px-5 py-3.5">Mobilizer</th>
                    <th className="px-5 py-3.5">Project & Center</th>
                    <th className="px-5 py-3.5">Block / GP</th>
                    <th className="px-5 py-3.5">Drive Date</th>
                    <th className="px-5 py-3.5">Turnout</th>
                    <th className="px-5 py-3.5 text-right">Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pg.pageData.length > 0 ? pg.pageData.map((drive) => (
                    <tr key={drive.id} className="transition hover:bg-white/[0.02]">
                      <td className="px-5 py-4">
                        <p className="truncate text-[13px] font-black text-white/90">{drive.driveName}</p>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{drive.type}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="truncate text-xs font-bold text-white/80">{drive.mobilizer}</p>
                        <p className="mt-1 flex items-center gap-1.5 truncate text-[10px] font-bold text-slate-500">
                          <Phone size={11} /> {drive.mobilizerPhone}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="truncate text-xs font-bold text-red-300">{drive.project}</p>
                        <p className="mt-1 flex items-center gap-1.5 truncate text-[11px] font-bold text-cyan-300/80">
                          <Building2 size={12} /> {drive.center}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="truncate text-xs font-bold text-white/80">{drive.block}</p>
                        <p className="mt-1 flex items-center gap-1.5 truncate text-[10px] font-bold text-slate-500">
                          <MapPin size={11} /> {drive.gp}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-xs font-bold text-white/70">{drive.date}</td>
                      <td className="px-5 py-4">
                        <p className="text-xs font-black text-white">{drive.participants} attended</p>
                        <p className="mt-1 text-[10px] text-slate-500">{drive.leads} leads / {drive.enrolled} enrolled</p>
                      </td>
                      <ProofCell drive={drive} onView={openDrive} />
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-sm font-bold text-slate-500">
                        No community engagement drives match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination {...pg} />
          </div>
        </>
      )}

      {selectedDrive && (
        <div className="fixed inset-0 z-[9999] flex justify-end" onClick={() => setSelectedDrive(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside className="relative ml-auto flex h-full w-full max-w-3xl animate-in slide-in-from-right duration-200 flex-col border-l border-slate-700/70 bg-[#0f172a] shadow-2xl shadow-black/50" onClick={(e) => e.stopPropagation()}>
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-6 py-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-red-400">Community Drive Proof</p>
                <h3 className="mt-1 text-xl font-black tracking-tight text-white">{selectedDrive.driveName}</h3>
              </div>
              <button onClick={() => setSelectedDrive(null)} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white" aria-label="Close drive details">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Mobilizer", selectedDrive.mobilizer],
                  ["Project", selectedDrive.project],
                  ["Center", selectedDrive.center],
                  ["Block / GP", `${selectedDrive.block} / ${selectedDrive.gp}`],
                  ["Date", selectedDrive.date],
                  ["Turnout", `${selectedDrive.participants} participants`],
                  ["Leads / Enrolled", `${selectedDrive.leads} leads / ${selectedDrive.enrolled} enrolled`],
                  ["Community Partner", selectedDrive.communityPartner],
                  ["Contact", selectedDrive.mobilizerPhone],
                  ["Location", selectedDrive.location],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-slate-700/60 bg-[#111827] p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
                    <p className="mt-1 text-sm font-bold text-white/90">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-slate-700/60 bg-[#111827] p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mobilizer Notes</p>
                <p className="mt-2 text-sm leading-6 text-white/70">{selectedDrive.notes}</p>
              </div>

              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <ImageIcon size={14} /> Proof Images ({selectedDrive.proofImages.length})
                  </p>
                  <StatusBadge status={selectedDrive.status} />
                </div>

                {selectedDrive.proofImages.length > 0 ? (
                  <>
                    <div className="overflow-hidden rounded-2xl border border-slate-700/60 bg-[#0b1220]">
                      <img src={activeImage || selectedDrive.proofImages[0]} alt="Selected proof" className="h-[320px] w-full object-cover" />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {selectedDrive.proofImages.map((image, idx) => (
                        <button
                          type="button"
                          key={image}
                          onClick={() => setActiveImage(image)}
                          className={`overflow-hidden rounded-xl border transition ${activeImage === image ? "border-red-500/70" : "border-slate-700/60 hover:border-slate-500"}`}
                        >
                          <img src={image} alt={`${selectedDrive.id} proof ${idx + 1}`} className="h-24 w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 text-center">
                    <MapPin size={26} className="text-slate-600" />
                    <p className="mt-3 text-sm font-bold text-slate-500">Proof images have not been submitted yet.</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
