import { useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, FolderKanban, MapPinned, Route, XCircle } from "lucide-react";
import { Breadcrumb, PageHeader } from "./SuperAdminSharedComponents";

const INITIAL_REQUESTS = [
  {
    id: "TOUR-SA-001",
    employee: "Lopamudra Deo",
    role: "Placement Officer",
    project: "PMKVY 4.0 Odisha Skills",
    destination: "Bhubaneswar employer visit",
    dates: "21 May 2026",
    purpose: "Employer onboarding and placement drive planning.",
    estimate: "₹3,600",
    adminApprovedBy: "Rakesh Swain",
    adminApprovedOn: "2026-05-18",
    status: "Pending Review",
  },
  {
    id: "TOUR-SA-002",
    employee: "Sonal Behera",
    role: "Mobilizer",
    project: "DDUGKY Rural Youth Employment Program",
    destination: "Junagarh Block",
    dates: "26 May 2026",
    purpose: "Candidate verification after community mobilization.",
    estimate: "₹2,250",
    adminApprovedBy: "Harsha Nayak",
    adminApprovedOn: "2026-05-25",
    status: "Pending Review",
  },
  {
    id: "TOUR-SA-003",
    employee: "Sneha Mohanty",
    role: "Trainer",
    project: "Tata Steel Foundation Livelihood Program",
    destination: "Jharsuguda Industrial Training Center",
    dates: "18 May - 19 May 2026",
    purpose: "Lab readiness audit and batch handover.",
    estimate: "₹5,200",
    adminApprovedBy: "Pradip Nanda",
    adminApprovedOn: "2026-05-16",
    status: "Approved",
  },
];

const STATUS_CLASS = {
  "Pending Review": "border-amber-400/25 bg-amber-500/10 text-amber-300",
  Approved: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
  Rejected: "border-red-400/25 bg-red-500/10 text-red-300",
};

export default function SuperAdminTourApprovals() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [selectedProject, setSelectedProject] = useState(null);

  const projects = useMemo(() => summarizeProjects(requests), [requests]);
  const rows = selectedProject ? requests.filter((request) => request.project === selectedProject) : [];
  const totals = useMemo(() => summarizeTotals(requests), [requests]);

  const decide = (id, status) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === id
          ? { ...request, status, superAdminDecidedOn: new Date().toISOString().split("T")[0] }
          : request
      )
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Route}
        title={selectedProject ? `${selectedProject} Tours` : "Tour Approvals"}
        subtitle={
          selectedProject
            ? "Final Super Admin review for Admin-approved tour requests in this project."
            : "Project-wise tour requests that have already passed Admin approval."
        }
      />
      <Breadcrumb items={selectedProject ? ["Super Admin", "Tour Approvals", selectedProject] : ["Super Admin", "Tour Approvals"]} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={Clock} label="Pending Final Review" value={totals.pending} />
        <Metric icon={CheckCircle2} label="Approved" value={totals.approved} />
        <Metric icon={XCircle} label="Rejected" value={totals.rejected} />
      </div>

      {!selectedProject ? (
        <ProjectGrid projects={projects} onSelect={setSelectedProject} />
      ) : (
        <section className="space-y-5">
          <button
            type="button"
            onClick={() => setSelectedProject(null)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-[#0b1220] px-3 py-2 text-xs font-black text-white/70 transition hover:border-red-400/40 hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to Projects
          </button>
          <ApprovalTable rows={rows} onDecide={decide} />
        </section>
      )}
    </div>
  );
}

function summarizeProjects(requests) {
  return Array.from(
    requests.reduce((map, request) => {
      const current = map.get(request.project) || { name: request.project, total: 0, pending: 0, approved: 0 };
      map.set(request.project, {
        ...current,
        total: current.total + 1,
        pending: current.pending + (request.status === "Pending Review" ? 1 : 0),
        approved: current.approved + (request.status === "Approved" ? 1 : 0),
      });
      return map;
    }, new Map()).values()
  );
}

function summarizeTotals(requests) {
  return {
    pending: requests.filter((request) => request.status === "Pending Review").length,
    approved: requests.filter((request) => request.status === "Approved").length,
    rejected: requests.filter((request) => request.status === "Rejected").length,
  };
}

function ProjectGrid({ projects, onSelect }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <button
          key={project.name}
          type="button"
          onClick={() => onSelect(project.name)}
          className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5 text-left transition hover:border-red-400/35 hover:bg-[#151e2f]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-300">
              <FolderKanban size={20} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-black text-white">{project.name}</p>
              <p className="mt-1 text-xs text-slate-500">Admin-approved queue</p>
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
  );
}

function ApprovalTable({ rows, onDecide }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#111827]/80">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1560px] table-fixed text-sm">
          <colgroup>
            <col className="w-[170px]" />
            <col className="w-[220px]" />
            <col className="w-[260px]" />
            <col className="w-[210px]" />
            <col className="w-[320px]" />
            <col className="w-[130px]" />
            <col className="w-[230px]" />
            <col className="w-[190px]" />
            <col className="w-[220px]" />
          </colgroup>
          <thead className="border-b border-slate-700/50 bg-[#0b1220] text-xs uppercase tracking-[0.14em] text-slate-500">
            <tr>
              {["Request", "Employee", "Destination", "Dates", "Purpose", "Estimate", "Admin Clearance", "Status", "Action"].map((header) => (
                <th key={header} className="px-6 py-4 text-left font-black">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {rows.map((request) => (
              <tr key={request.id} className="hover:bg-white/[0.03]">
                <td className="px-6 py-5 align-top font-black text-white">{request.id}</td>
                <td className="px-6 py-5 align-top">
                  <p className="font-semibold text-white">{request.employee}</p>
                  <p className="text-xs text-slate-500">{request.role}</p>
                </td>
                <td className="px-6 py-5 align-top text-slate-400">
                  <span className="inline-flex items-start gap-2 leading-6"><MapPinned size={14} className="mt-1 shrink-0 text-red-300" />{request.destination}</span>
                </td>
                <td className="px-6 py-5 align-top text-slate-400">
                  <span className="inline-flex items-start gap-2 leading-6"><CalendarDays size={14} className="mt-1 shrink-0 text-red-300" />{request.dates}</span>
                </td>
                <td className="px-6 py-5 align-top leading-6 text-slate-400">{request.purpose}</td>
                <td className="px-6 py-5 align-top font-black text-emerald-300">{request.estimate}</td>
                <td className="px-6 py-5 align-top text-slate-400">
                  <p className="font-semibold text-white">{request.adminApprovedBy}</p>
                  <p className="text-xs text-slate-500">{request.adminApprovedOn}</p>
                </td>
                <td className="px-6 py-5 align-top"><Status status={request.status} /></td>
                <td className="px-6 py-5 align-top">
                  {request.status === "Pending Review" ? (
                    <div className="inline-flex min-w-[150px] flex-col gap-2">
                      <Action tone="approve" onClick={() => onDecide(request.id, "Approved")}>Approve</Action>
                      <Action tone="reject" onClick={() => onDecide(request.id, "Rejected")}>Reject</Action>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">Closed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-[#111827]/80 p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-300">
        <Icon size={20} />
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

function MiniStat({ label, value, accent = "slate" }) {
  const cls = accent === "amber" ? "text-amber-300" : accent === "emerald" ? "text-emerald-300" : "text-white";
  return (
    <div className="rounded-xl border border-slate-700/50 bg-[#0b1220] px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-1 text-sm font-black ${cls}`}>{value}</p>
    </div>
  );
}

function Status({ status }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${STATUS_CLASS[status]}`}>{status}</span>;
}

function Action({ tone, onClick, children }) {
  const cls = tone === "approve" ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25" : "bg-red-500/15 text-red-300 hover:bg-red-500/25";
  return <button type="button" onClick={onClick} className={`rounded-lg px-4 py-2.5 text-xs font-semibold transition ${cls}`}>{children}</button>;
}
