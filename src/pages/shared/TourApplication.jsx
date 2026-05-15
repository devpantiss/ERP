import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPinned,
  Plus,
  Route,
  Send,
  X,
} from "lucide-react";

const ACCENT_MAP = {
  mobilizer: {
    text: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    btn: "bg-yellow-400 hover:bg-yellow-300 text-black",
    shadow: "shadow-yellow-500/10",
  },
  "placement-officer": {
    text: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    btn: "bg-cyan-500 hover:bg-cyan-400 text-white",
    shadow: "shadow-cyan-500/10",
  },
};

const ROLE_LABEL = {
  mobilizer: "Mobilizer",
  "placement-officer": "Placement Officer",
};

const INITIAL_TOURS = [
  {
    id: "TOUR-001",
    title: "Community Mobilization Visit",
    destination: "Angul rural cluster",
    startDate: "2026-05-15",
    endDate: "2026-05-17",
    purpose: "Beneficiary counselling, document verification, and village-level mobilization follow-up.",
    estimate: 8400,
    status: "Pending",
    submittedOn: "2026-05-10",
  },
  {
    id: "TOUR-002",
    title: "Employer Connect Visit",
    destination: "Bhubaneswar industrial area",
    startDate: "2026-05-21",
    endDate: "2026-05-21",
    purpose: "Employer onboarding, job role validation, and placement drive planning.",
    estimate: 3600,
    status: "Approved",
    submittedOn: "2026-05-06",
  },
];

const STATUS_CLASS = {
  Pending: "border-amber-400/25 bg-amber-500/10 text-amber-300",
  Approved: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
  Rejected: "border-red-400/25 bg-red-500/10 text-red-300",
};

export default function TourApplication() {
  const location = useLocation();
  const roleKey = location.pathname.split("/")[1];
  const accent = ACCENT_MAP[roleKey] || ACCENT_MAP.mobilizer;
  const roleLabel = ROLE_LABEL[roleKey] || "Employee";
  const [requests, setRequests] = useState(INITIAL_TOURS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    destination: "",
    startDate: "",
    endDate: "",
    purpose: "",
    estimate: "",
  });

  const summary = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((request) => request.status === "Pending").length,
      approved: requests.filter((request) => request.status === "Approved").length,
      estimate: requests.reduce((sum, request) => sum + request.estimate, 0),
    }),
    [requests]
  );

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      title: "",
      destination: "",
      startDate: "",
      endDate: "",
      purpose: "",
      estimate: "",
    });
    setShowForm(false);
  };

  const submitTour = (event) => {
    event.preventDefault();
    const nextRequest = {
      id: `TOUR-${String(requests.length + 1).padStart(3, "0")}`,
      title: form.title || "Tour Request",
      destination: form.destination || "Data Not Available",
      startDate: form.startDate,
      endDate: form.endDate || form.startDate,
      purpose: form.purpose || "Data Not Available",
      estimate: Number(form.estimate) || 0,
      status: "Pending",
      submittedOn: new Date().toISOString().slice(0, 10),
    };

    setRequests((current) => [nextRequest, ...current]);
    resetForm();
  };

  return (
    <section className="min-h-screen bg-transparent p-4 text-white/90 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={`mb-2 text-xs font-semibold uppercase tracking-widest ${accent.text}`}>
              HR Entitlement
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Tour Application
            </h1>
            <p className="mt-1 text-sm text-white/50">
              Apply for official field visits, employer meetings, and project travel before execution.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold shadow-lg transition active:scale-95 ${accent.btn} ${accent.shadow}`}
          >
            <Plus size={16} />
            New Tour Request
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <MiniCard icon={Route} label="Total Requests" value={summary.total} accent={accent} />
          <MiniCard icon={Clock} label="Pending" value={summary.pending} accent={accent} />
          <MiniCard icon={CheckCircle2} label="Approved" value={summary.approved} accent={accent} />
          <MiniCard icon={IndianRupee} label="Estimated Cost" value={`₹${summary.estimate.toLocaleString("en-IN")}`} accent={accent} />
        </div>

        <div className="space-y-4">
          {requests.map((request) => (
            <article
              key={request.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-xl shadow-black/20"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${accent.border} ${accent.bg}`}>
                    <MapPinned size={20} className={accent.text} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-base font-semibold text-white">{request.title}</h2>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_CLASS[request.status]}`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-white/40">
                      {request.id} | {roleLabel} | Submitted on {formatDate(request.submittedOn)}
                    </p>
                    <div className="mt-4 grid gap-3 text-sm text-white/65 md:grid-cols-2">
                      <span className="inline-flex items-center gap-2">
                        <MapPinned size={15} className={accent.text} />
                        {request.destination}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays size={15} className={accent.text} />
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </span>
                    </div>
                    <p className="mt-4 max-w-3xl text-sm leading-6 text-white/55">{request.purpose}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-right">
                  <p className={`text-xl font-bold ${accent.text}`}>
                    ₹{request.estimate.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-white/40">Estimated cost</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={submitTour}
            className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#080b13] p-6 shadow-2xl shadow-black/40"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className={`mb-2 text-xs font-semibold uppercase tracking-widest ${accent.text}`}>
                  New Request
                </p>
                <h2 className="text-2xl font-bold text-white">Apply for Tour</h2>
                <p className="mt-1 text-sm text-white/45">
                  Submit planned destination, dates, purpose, and estimated expense for approval.
                </p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl p-2 text-white/45 transition hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Tour Title" value={form.title} onChange={(value) => updateForm("title", value)} required />
              <Input label="Destination" value={form.destination} onChange={(value) => updateForm("destination", value)} required />
              <Input label="Start Date" type="date" value={form.startDate} onChange={(value) => updateForm("startDate", value)} required />
              <Input label="End Date" type="date" value={form.endDate} onChange={(value) => updateForm("endDate", value)} />
              <Input label="Estimated Cost" type="number" value={form.estimate} onChange={(value) => updateForm("estimate", value)} required />
              <label className="md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Purpose</span>
                <textarea
                  value={form.purpose}
                  onChange={(event) => updateForm("purpose", event.target.value)}
                  required
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${accent.btn}`}
              >
                <Send size={16} />
                Submit Request
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}

function MiniCard({ accent, icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-lg shadow-black/20">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl border ${accent.border} ${accent.bg}`}>
        <Icon size={19} className={accent.text} />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-white/45">{label}</p>
    </div>
  );
}

function Input({ label, onChange, required, type = "text", value }) {
  return (
    <label>
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/40">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition focus:border-white/30"
      />
    </label>
  );
}

function formatDate(value) {
  if (!value) return "Data Not Available";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
