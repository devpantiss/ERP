import { useMemo, useState } from "react";
import {
  Building2,
  CalendarDays,
  Camera,
  Eye,
  FileImage,
  ImageIcon,
  MapPin,
  Phone,
  Search,
  Users,
  X,
} from "lucide-react";
import { BackButton, PageHeader, Pagination, usePagination } from "./SuperAdminSharedComponents";

const PROJECTS = ["PMKVY 4.0", "CSR - Tata Steel", "DDUGKY", "State Skill Mission"];
const TRADES = ["Electrical", "Fitter", "Safety", "Welder", "HEMM", "Dumper Operator"];
const STATUSES = ["Planned", "Approved", "Completed", "Submitted"];
const PROOF_IMAGES = [
  "/Frames/scene1/frame_0000.webp",
  "/Frames/scene1/frame_0024.webp",
  "/Frames/scene1/frame_0045.webp",
  "/Frames/scene2/frame_0000.webp",
  "/Frames/scene2/frame_0024.webp",
  "/Frames/scene3/frame_0002.webp",
  "/Frames/scene4/frame_0004.webp",
  "/Frames/scene4/frame_0049.webp",
];

const VISITS = [
  {
    id: "EV-2026-001",
    industry: "Tata Power Substation",
    spocName: "Rajesh Mishra",
    spocPhone: "+91 98765 11001",
    project: "PMKVY 4.0",
    center: "Angul",
    trainer: "Amit Panda",
    batch: "Batch 101",
    trade: "Electrical",
    date: "2026-02-12",
    candidates: 42,
    attended: 39,
    status: "Submitted",
    location: "Angul Industrial Estate",
    proofImages: [PROOF_IMAGES[0], PROOF_IMAGES[1], PROOF_IMAGES[2]],
    notes: "Students observed substation safety protocol, earthing systems, and relay panels.",
  },
  {
    id: "EV-2026-002",
    industry: "JSW Steel Plant",
    spocName: "Priya Sahu",
    spocPhone: "+91 98765 11002",
    project: "CSR - Tata Steel",
    center: "Jharsuguda",
    trainer: "Sneha Mohanty",
    batch: "Batch 301",
    trade: "Welder",
    date: "2026-02-18",
    candidates: 39,
    attended: 35,
    status: "Submitted",
    location: "Jharsuguda Works",
    proofImages: [PROOF_IMAGES[3], PROOF_IMAGES[4], PROOF_IMAGES[5], PROOF_IMAGES[6]],
    notes: "Plant tour covered PPE checks, fabrication bays, and supervisor interaction.",
  },
  {
    id: "EV-2026-003",
    industry: "Aditya Aluminium Ltd",
    spocName: "Amit Das",
    spocPhone: "+91 98765 11003",
    project: "DDUGKY",
    center: "Keonjhar",
    trainer: "Ritu Mohapatra",
    batch: "Batch 501",
    trade: "Fitter",
    date: "2026-02-20",
    candidates: 35,
    attended: 31,
    status: "Completed",
    location: "Keonjhar Industrial Cluster",
    proofImages: [PROOF_IMAGES[1], PROOF_IMAGES[7]],
    notes: "Visit completed; final documentation is pending trainer submission.",
  },
  {
    id: "EV-2026-004",
    industry: "Odisha Hydro Power Corp",
    spocName: "Sonal Behera",
    spocPhone: "+91 98765 11004",
    project: "State Skill Mission",
    center: "Sundargarh",
    trainer: "Deepak Sahu",
    batch: "Batch 207",
    trade: "Safety",
    date: "2026-02-26",
    candidates: 44,
    attended: 0,
    status: "Approved",
    location: "Sundargarh Field Office",
    proofImages: [],
    notes: "Approved by center manager; visit yet to be conducted.",
  },
  {
    id: "EV-2026-005",
    industry: "L&T Construction Yard",
    spocName: "Kabita Das",
    spocPhone: "+91 98765 11005",
    project: "PMKVY 4.0",
    center: "Bolangir",
    trainer: "Sanjay Das",
    batch: "Batch 201",
    trade: "Dumper Operator",
    date: "2026-03-02",
    candidates: 34,
    attended: 0,
    status: "Planned",
    location: "Bolangir Construction Yard",
    proofImages: [],
    notes: "Planned for operator safety orientation and equipment walkthrough.",
  },
  {
    id: "EV-2026-006",
    industry: "Vedanta Mining Yard",
    spocName: "Harsha Nayak",
    spocPhone: "+91 98765 11006",
    project: "DDUGKY",
    center: "Kalahandi",
    trainer: "Bikash Naik",
    batch: "Batch 401",
    trade: "HEMM",
    date: "2026-03-05",
    candidates: 56,
    attended: 52,
    status: "Submitted",
    location: "Kalahandi Mining Belt",
    proofImages: [PROOF_IMAGES[2], PROOF_IMAGES[3], PROOF_IMAGES[6]],
    notes: "HEMM demonstration covered site movement rules and dumper blind zones.",
  },
];

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

function ProofCell({ visit, onView }) {
  const proofCount = visit.proofImages.length;
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
          <StatusBadge status={visit.status} />
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
              {visit.proofImages.slice(0, 4).map((image, idx) => (
                <img
                  key={image}
                  src={image}
                  alt={`${visit.id} proof ${idx + 1}`}
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
                {visit.status === "Planned" ? "Visit planned" : "Awaiting upload"}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => onView(visit)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-[10px] font-black uppercase text-white/75 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-white"
          >
            <Eye size={12} /> View
          </button>
        </div>
      </div>
    </td>
  );
}

export default function SuperAdminExposureVisits() {
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [tradeFilter, setTradeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  const projectStats = useMemo(() => PROJECTS.map((project) => {
    const visits = VISITS.filter((visit) => visit.project === project);
    return {
      project,
      visits: visits.length,
      submitted: visits.filter((visit) => visit.status === "Submitted").length,
      proofs: visits.reduce((sum, visit) => sum + visit.proofImages.length, 0),
    };
  }), []);

  const projectVisits = useMemo(
    () => VISITS.filter((visit) => visit.project === selectedProject),
    [selectedProject]
  );

  const filteredVisits = useMemo(() => {
    const q = search.toLowerCase();
    return projectVisits.filter((visit) => {
      const matchesSearch = !q ||
        visit.industry.toLowerCase().includes(q) ||
        visit.trainer.toLowerCase().includes(q) ||
        visit.center.toLowerCase().includes(q) ||
        visit.batch.toLowerCase().includes(q);
      const matchesTrade = !tradeFilter || visit.trade === tradeFilter;
      const matchesStatus = !statusFilter || visit.status === statusFilter;
      return matchesSearch && matchesTrade && matchesStatus;
    });
  }, [projectVisits, search, statusFilter, tradeFilter]);

  const summary = useMemo(() => ({
    total: filteredVisits.length,
    submitted: filteredVisits.filter((visit) => visit.status === "Submitted").length,
    proofs: filteredVisits.reduce((sum, visit) => sum + visit.proofImages.length, 0),
    attendance: filteredVisits.reduce((sum, visit) => sum + visit.attended, 0),
  }), [filteredVisits]);

  const pg = usePagination(filteredVisits, 8);

  const chooseProject = (project) => {
    setSelectedProject(project);
    setSearch("");
    setTradeFilter("");
    setStatusFilter("");
    setSelectedVisit(null);
    pg.setPage(1);
  };

  const backToProjects = () => {
    setSelectedProject("");
    setSearch("");
    setTradeFilter("");
    setStatusFilter("");
    setSelectedVisit(null);
    pg.setPage(1);
  };

  const openVisit = (visit) => {
    setSelectedVisit(visit);
    setActiveImage(visit.proofImages[0] || null);
  };

  return (
    <div className="space-y-6">
      <PageHeader icon={Camera} title="Exposure Visits" subtitle="Training visit reports, attendance, and proof gallery" />

      {!selectedProject ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {projectStats.map(({ project, visits, submitted, proofs }) => (
              <button
                type="button"
                key={project}
                onClick={() => chooseProject(project)}
                className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 text-left transition hover:border-slate-600"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-white">{project}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {visits} visits • {submitted} submitted
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04]">
                    <Camera size={18} className="text-slate-400" />
                  </div>
                </div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300/80">
                  {proofs} proof images
                </p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-dashed border-slate-700/70 bg-[#111827]/70 p-10 text-center">
            <Building2 size={30} className="mx-auto text-slate-500" />
            <p className="mt-4 text-sm font-black text-white">Select a project to view exposure visits.</p>
          </div>
        </>
      ) : (
        <>
          <BackButton onClick={backToProjects} label="Back to projects" />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Visits" value={summary.total} color="text-red-400">
              <CalendarDays size={18} className="text-red-400" />
            </SummaryCard>
            <SummaryCard label="Submitted" value={summary.submitted} color="text-emerald-400">
              <FileImage size={18} className="text-emerald-400" />
            </SummaryCard>
            <SummaryCard label="Proof Images" value={summary.proofs} color="text-cyan-400">
              <ImageIcon size={18} className="text-cyan-400" />
            </SummaryCard>
            <SummaryCard label="Students Attended" value={summary.attendance} color="text-violet-400">
              <Users size={18} className="text-violet-400" />
            </SummaryCard>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80 backdrop-blur-sm">
            <div className="flex flex-col gap-4 border-b border-white/[0.08] p-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm font-black text-white">{selectedProject}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {filteredVisits.length} of {projectVisits.length} exposure visit reports
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
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
                <select value={tradeFilter} onChange={(e) => { setTradeFilter(e.target.value); pg.setPage(1); }} className="rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2.5 text-xs text-white/80 outline-none focus:border-red-500">
                  <option value="">All Trades</option>
                  {TRADES.map((trade) => <option key={trade} value={trade}>{trade}</option>)}
                </select>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); pg.setPage(1); }} className="rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2.5 text-xs text-white/80 outline-none focus:border-red-500">
                  <option value="">All Status</option>
                  {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-left" style={{ minWidth: 1240 }}>
                <colgroup>
                  <col style={{ width: "17%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "22%" }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-white/[0.06] bg-[#0b1220] text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <th className="px-5 py-3.5">Industry</th>
                    <th className="px-5 py-3.5">Trainer</th>
                    <th className="px-5 py-3.5">Project & Center</th>
                    <th className="px-5 py-3.5">Batch / Trade</th>
                    <th className="px-5 py-3.5">Visit Date</th>
                    <th className="px-5 py-3.5">Attendance</th>
                    <th className="px-5 py-3.5 text-right">Proof</th>
                  </tr>
                </thead>
            <tbody className="divide-y divide-slate-800/60">
              {pg.pageData.length > 0 ? pg.pageData.map((visit) => (
                <tr key={visit.id} className="transition hover:bg-white/[0.02]">
                  <td className="px-5 py-4">
                    <p className="truncate text-[13px] font-black text-white/90">{visit.industry}</p>
                    <p className="mt-1 flex items-center gap-1.5 truncate text-[10px] font-bold text-slate-500">
                      <Phone size={11} /> {visit.spocName} • {visit.spocPhone}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="truncate text-xs font-bold text-white/80">{visit.trainer}</p>
                    <p className="mt-1 text-[10px] font-mono text-red-500/70">{visit.id}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="truncate text-xs font-bold text-red-300">{visit.project}</p>
                    <p className="mt-1 flex items-center gap-1.5 truncate text-[11px] font-bold text-cyan-300/80">
                      <Building2 size={12} /> {visit.center}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs font-bold text-white/80">{visit.batch}</p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{visit.trade}</p>
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-white/70">{visit.date}</td>
                  <td className="px-5 py-4">
                    <p className="text-xs font-black text-white">{visit.attended}/{visit.candidates}</p>
                    <p className="mt-1 text-[10px] text-slate-500">candidates</p>
                  </td>
                  <ProofCell visit={visit} onView={openVisit} />
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm font-bold text-slate-500">
                    No exposure visits match the selected filters.
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

      {selectedVisit && (
        <div className="fixed inset-0 z-[9999] flex justify-end" onClick={() => setSelectedVisit(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside className="relative ml-auto flex h-full w-full max-w-3xl animate-in slide-in-from-right duration-200 flex-col border-l border-slate-700/70 bg-[#0f172a] shadow-2xl shadow-black/50" onClick={(e) => e.stopPropagation()}>
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-6 py-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-red-400">Exposure Visit Proof</p>
                <h3 className="mt-1 text-xl font-black tracking-tight text-white">{selectedVisit.industry}</h3>
              </div>
              <button onClick={() => setSelectedVisit(null)} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white" aria-label="Close visit details">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Trainer", selectedVisit.trainer],
                  ["Project", selectedVisit.project],
                  ["Center", selectedVisit.center],
                  ["Batch / Trade", `${selectedVisit.batch} • ${selectedVisit.trade}`],
                  ["Date", selectedVisit.date],
                  ["Attendance", `${selectedVisit.attended}/${selectedVisit.candidates}`],
                  ["Industry SPOC", `${selectedVisit.spocName} • ${selectedVisit.spocPhone}`],
                  ["Location", selectedVisit.location],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-slate-700/60 bg-[#111827] p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
                    <p className="mt-1 text-sm font-bold text-white/90">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-slate-700/60 bg-[#111827] p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Trainer Notes</p>
                <p className="mt-2 text-sm leading-6 text-white/70">{selectedVisit.notes}</p>
              </div>

              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <ImageIcon size={14} /> Proof Images ({selectedVisit.proofImages.length})
                  </p>
                  <StatusBadge status={selectedVisit.status} />
                </div>

                {selectedVisit.proofImages.length > 0 ? (
                  <>
                    <div className="overflow-hidden rounded-2xl border border-slate-700/60 bg-[#0b1220]">
                      <img src={activeImage || selectedVisit.proofImages[0]} alt="Selected proof" className="h-[320px] w-full object-cover" />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {selectedVisit.proofImages.map((image, idx) => (
                        <button
                          type="button"
                          key={image}
                          onClick={() => setActiveImage(image)}
                          className={`overflow-hidden rounded-xl border transition ${activeImage === image ? "border-red-500/70" : "border-slate-700/60 hover:border-slate-500"}`}
                        >
                          <img src={image} alt={`${selectedVisit.id} proof ${idx + 1}`} className="h-24 w-full object-cover" />
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
