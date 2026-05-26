import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, BriefcaseBusiness, CheckCircle2, ClipboardList, FileCheck, FolderKanban, Megaphone, Search, XCircle } from "lucide-react";
import SlidePanel from "../../components/common/SlidePanel";
import { Breadcrumb, PageHeader } from "./SuperAdminSharedComponents";
import { MOBILIZER_APPROVALS, PLACEMENT_APPROVALS, PROJECT_REPORTS, TRAINER_APPROVALS } from "../Admin/adminPortalData";

const TABS = [
  { id: "trainer", label: "Trainer", icon: BookOpen },
  { id: "mobilizer", label: "Mobilizer", icon: Megaphone },
  { id: "placement", label: "Placement", icon: BriefcaseBusiness },
];

const INITIAL_ROWS = [
  ...TRAINER_APPROVALS.map((row) => ({ ...row, role: "trainer", person: row.trainer })),
  ...MOBILIZER_APPROVALS.map((row) => ({ ...row, role: "mobilizer", person: row.mobilizer })),
  ...PLACEMENT_APPROVALS.map((row) => ({ ...row, role: "placement", person: row.officer })),
]
  .filter((row) => row.status === "Approved")
  .map((row) => ({
    ...row,
    adminStatus: "Approved",
    superStatus: "Pending Review",
    adminApprovedOn: row.submittedOn,
  }));

export default function SuperAdminOperationsApprovals() {
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState("trainer");
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const projects = useMemo(() => summarizeProjects(rows), [rows]);
  const projectRows = useMemo(() => {
    if (!selectedProject) return [];
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (row.project !== selectedProject) return false;
      if (row.role !== activeTab) return false;
      if (!query) return true;
      return `${row.id} ${row.person} ${row.center} ${row.requestType} ${row.superStatus}`.toLowerCase().includes(query);
    });
  }, [rows, selectedProject, activeTab, search]);
  const totals = useMemo(() => summarizeTotals(rows), [rows]);

  const decide = (id, status) => {
    setRows((current) =>
      current.map((row) =>
        row.id === id
          ? { ...row, superStatus: status, superAdminDecidedOn: new Date().toISOString().split("T")[0] }
          : row
      )
    );
    setSelectedRequest(null);
  };

  const clearProject = () => {
    setSelectedProject(null);
    setActiveTab("trainer");
    setSearch("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileCheck}
        title={selectedProject ? `${selectedProject} Operations` : "Operations Approvals"}
        subtitle={
          selectedProject
            ? "Final Super Admin approval for Admin-approved operational requests."
            : "Trainer, mobilizer, and placement requests from multiple projects after Admin approval."
        }
      />
      <Breadcrumb items={selectedProject ? ["Super Admin", "Operations Approvals", selectedProject] : ["Super Admin", "Operations Approvals"]} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={ClipboardList} label="Admin Approved" value={totals.total} />
        <Metric icon={CheckCircle2} label="Final Approved" value={totals.approved} />
        <Metric icon={XCircle} label="Returned" value={totals.rejected} />
      </div>

      {!selectedProject ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <button key={project.name} type="button" onClick={() => setSelectedProject(project.name)} className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 text-left transition hover:border-red-400/35 hover:bg-[#151e2f]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-300"><FolderKanban size={20} /></div>
                <div className="min-w-0">
                  <p className="truncate text-base font-black text-white">{project.name}</p>
                  <p className="mt-1 text-xs text-slate-500">Admin-approved operations</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <MiniStat label="Total" value={project.total} />
                <MiniStat label="Pending" value={project.pending} accent="amber" />
                <MiniStat label="Approved" value={project.approved} accent="emerald" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <section className="space-y-5">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 xl:flex-row xl:items-center xl:justify-between">
            <button type="button" onClick={clearProject} className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2 text-xs font-black text-white/70 transition hover:border-red-400/40 hover:text-white">
              <ArrowLeft size={14} />
              Back to Projects
            </button>
            <div className="flex overflow-x-auto rounded-xl bg-[#0b1220] p-1">
              {TABS.map((tab) => (
                <button key={tab.id} type="button" onClick={() => { setActiveTab(tab.id); setSearch(""); }} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${activeTab === tab.id ? "border border-red-400/30 bg-red-500/15 text-red-200" : "border border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-white"}`}>
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
            <label className="relative w-full xl:max-w-sm">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search requests..." className="w-full rounded-xl border border-slate-700 bg-[#0b1220] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-red-400/60" />
            </label>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1480px] table-fixed text-left text-sm">
                <colgroup>
                  <col className="w-[170px]" />
                  <col className="w-[220px]" />
                  <col className="w-[260px]" />
                  <col className="w-[260px]" />
                  <col className="w-[220px]" />
                  <col className="w-[210px]" />
                  <col className="w-[180px]" />
                  <col className="w-[160px]" />
                </colgroup>
                <thead className="bg-[#0b1220] text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    {["Request", "Person", "Center", "Type", "Context", "Admin Clearance", "Super Admin", "Action"].map((header) => (
                      <th key={header} className="px-6 py-4">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {projectRows.map((row) => (
                    <tr key={row.id} className="hover:bg-white/[0.03]">
                      <td className="px-6 py-5 align-top font-black text-white">{row.id}</td>
                      <td className="px-6 py-5 align-top">
                        <p className="font-semibold text-white">{row.person}</p>
                        <p className="text-xs capitalize text-slate-500">{row.role}</p>
                      </td>
                      <td className="px-6 py-5 align-top leading-6 text-slate-400">{row.center}</td>
                      <td className="px-6 py-5 align-top font-semibold leading-6 text-red-200">{row.requestType}</td>
                      <td className="px-6 py-5 align-top leading-6 text-slate-400">{row.batch || row.location || row.entity || "-"}</td>
                      <td className="px-6 py-5 align-top">
                        <Status status="Admin Approved" tone="sky" />
                        <p className="mt-2 text-xs text-slate-500">{row.adminApprovedOn}</p>
                      </td>
                      <td className="px-6 py-5 align-top"><Status status={row.superStatus} /></td>
                      <td className="px-6 py-5 align-top">
                        <button type="button" onClick={() => setSelectedRequest(row)} className="rounded-lg bg-white/[0.05] px-4 py-2.5 text-xs font-semibold text-white/70 transition hover:bg-white/[0.09] hover:text-white">Review</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <SlidePanel open={Boolean(selectedRequest)} onClose={() => setSelectedRequest(null)} title="Super Admin Review" width="lg">
        {selectedRequest && (
          <div className="flex h-full flex-col bg-[#0a0e17]">
            <div className="border-b border-slate-800 bg-[#0b1220] p-6">
              <h2 className="text-xl font-black text-white">{selectedRequest.requestType}</h2>
              <p className="mt-1 text-sm text-slate-500">{selectedRequest.id} • {selectedRequest.project}</p>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              <Detail label="Person" value={selectedRequest.person} />
              <Detail label="Center" value={selectedRequest.center} />
              <Detail label="Admin Clearance" value={`Approved on ${selectedRequest.adminApprovedOn}`} />
              <Detail label="Remarks" value={selectedRequest.remarks || "No remarks provided."} />
            </div>
            <div className="border-t border-slate-800 bg-[#0b1220] p-6">
              {selectedRequest.superStatus === "Pending Review" ? (
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => decide(selectedRequest.id, "Returned")} className="rounded-xl bg-red-500/15 px-5 py-2.5 text-sm font-black text-red-300 transition hover:bg-red-500/25">Return</button>
                  <button type="button" onClick={() => decide(selectedRequest.id, "Approved")} className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-red-500">Approve</button>
                </div>
              ) : (
                <p className="text-right text-sm font-semibold text-slate-500">Decision closed</p>
              )}
            </div>
          </div>
        )}
      </SlidePanel>
    </div>
  );
}

function summarizeProjects(rows) {
  return Array.from(
    rows.reduce((map, row) => {
      const current = map.get(row.project) || { name: row.project, total: 0, pending: 0, approved: 0 };
      map.set(row.project, {
        ...current,
        total: current.total + 1,
        pending: current.pending + (row.superStatus === "Pending Review" ? 1 : 0),
        approved: current.approved + (row.superStatus === "Approved" ? 1 : 0),
      });
      return map;
    }, new Map()).values()
  );
}

function summarizeTotals(rows) {
  return {
    total: rows.length,
    approved: rows.filter((row) => row.superStatus === "Approved").length,
    rejected: rows.filter((row) => row.superStatus === "Returned").length,
  };
}

function Metric({ icon: Icon, label, value }) {
  return <div className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-300"><Icon size={20} /></div><p className="text-2xl font-black text-white">{value}</p><p className="text-sm text-slate-500">{label}</p></div>;
}

function MiniStat({ label, value, accent = "slate" }) {
  const cls = accent === "amber" ? "text-amber-300" : accent === "emerald" ? "text-emerald-300" : "text-white";
  return <div className="rounded-xl border border-slate-700/50 bg-[#0b1220] px-3 py-2"><p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p><p className={`mt-1 text-sm font-black ${cls}`}>{value}</p></div>;
}

function Status({ status, tone }) {
  const cls = tone === "sky"
    ? "border-sky-400/25 bg-sky-500/10 text-sky-300"
    : status === "Approved"
      ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-300"
      : status === "Returned"
        ? "border-red-400/25 bg-red-500/10 text-red-300"
        : "border-amber-400/25 bg-amber-500/10 text-amber-300";
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${cls}`}>{status}</span>;
}

function Detail({ label, value }) {
  return <div className="rounded-xl border border-slate-800 bg-[#111827] p-4"><p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</p><p className="mt-2 text-sm font-semibold text-slate-200">{value}</p></div>;
}
