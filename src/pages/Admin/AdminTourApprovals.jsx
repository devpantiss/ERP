import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPinned,
  Route,
  XCircle,
} from "lucide-react";

const INITIAL_TOUR_REQUESTS = [
  {
    id: "TOUR-APR-001",
    employee: "Ritika Sahoo",
    role: "Mobilizer",
    project: "PMKVY 4.0",
    destination: "Angul rural cluster",
    dates: "15 May - 17 May 2026",
    purpose: "Community mobilisation and beneficiary verification.",
    estimate: "₹8,400",
    status: "Pending",
  },
  {
    id: "TOUR-APR-002",
    employee: "Sanjay Nayak",
    role: "Trainer",
    project: "DDU-GKY",
    destination: "Jharsuguda training center",
    dates: "18 May - 19 May 2026",
    purpose: "Lab readiness audit and batch handover.",
    estimate: "₹5,200",
    status: "Pending",
  },
  {
    id: "TOUR-APR-003",
    employee: "Lopamudra Deo",
    role: "Placement Officer",
    project: "NULM",
    destination: "Bhubaneswar employer visit",
    dates: "21 May 2026",
    purpose: "Employer onboarding and placement drive planning.",
    estimate: "₹3,600",
    status: "Approved",
  },
];

const STATUS_CLASS = {
  Pending: "border-amber-400/25 bg-amber-500/10 text-amber-300",
  Approved: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
  Rejected: "border-red-400/25 bg-red-500/10 text-red-300",
};

export default function AdminTourApprovals() {
  const [requests, setRequests] = useState(INITIAL_TOUR_REQUESTS);

  const summary = useMemo(
    () => ({
      pending: requests.filter((request) => request.status === "Pending").length,
      approved: requests.filter((request) => request.status === "Approved").length,
      rejected: requests.filter((request) => request.status === "Rejected").length,
    }),
    [requests]
  );

  const decide = (id, status) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === id ? { ...request, status } : request
      )
    );
  };

  return (
    <section className="min-h-screen bg-transparent p-4 text-white/90 md:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-300">
            Admin Approval Flow
          </p>
          <h1 className="text-3xl font-bold text-white">Tour Approvals</h1>
          <p className="mt-1 text-sm text-white/50">
            Review field visit, travel, and tour requests before execution.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Stat icon={Clock} label="Pending" value={summary.pending} />
          <Stat icon={CheckCircle2} label="Approved" value={summary.approved} />
          <Stat icon={XCircle} label="Rejected" value={summary.rejected} />
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-xl shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wider text-white/45">
                <tr>
                  {[
                    "Request",
                    "Employee",
                    "Project",
                    "Destination",
                    "Dates",
                    "Purpose",
                    "Estimate",
                    "Status",
                    "Action",
                  ].map((header) => (
                    <th key={header} className="px-5 py-3 text-left font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{request.id}</p>
                      <p className="text-xs text-white/40">Tour request</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{request.employee}</p>
                      <p className="text-xs text-white/45">{request.role}</p>
                    </td>
                    <td className="px-5 py-4 text-white/70">{request.project}</td>
                    <td className="px-5 py-4 text-white/70">
                      <span className="inline-flex items-center gap-2">
                        <MapPinned size={15} className="text-violet-300" />
                        {request.destination}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-white/70">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays size={15} className="text-violet-300" />
                        {request.dates}
                      </span>
                    </td>
                    <td className="max-w-[260px] px-5 py-4 text-white/55">
                      {request.purpose}
                    </td>
                    <td className="px-5 py-4 font-semibold text-emerald-300">
                      {request.estimate}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          STATUS_CLASS[request.status]
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {request.status === "Pending" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => decide(request.id, "Approved")}
                            className="rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/25"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => decide(request.id, "Rejected")}
                            className="rounded-lg bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/25"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-white/35">Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-violet-400/15 bg-violet-500/5 p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
        <Icon size={20} className="text-violet-300" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-white/45">{label}</p>
    </div>
  );
}
