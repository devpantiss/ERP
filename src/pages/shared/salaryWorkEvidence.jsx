import { useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ExternalLink, FileText, Image, ListChecks, X } from "lucide-react";

const roleEvidenceConfig = {
  Mobilizer: {
    targetLabel: "Community Engagement / Enrolled",
    metricLabel: "Enrolled candidates",
    activities: [
      { title: "Community engagement drive", type: "Drive", proof: "Drive photos" },
      { title: "Door-to-door mobilization", type: "Enrollment", proof: "Enrollment forms" },
      { title: "Counselling follow-up camp", type: "Follow-up", proof: "Attendance sheet" },
    ],
  },
  "Placement Officer": {
    targetLabel: "Placement Drives / Students Placed",
    metricLabel: "Students placed",
    activities: [
      { title: "Employer placement drive", type: "Drive", proof: "Company invitation" },
      { title: "Placed student verification", type: "Placement", proof: "Offer letters" },
      { title: "Joining and retention follow-up", type: "Retention", proof: "Joining proofs" },
    ],
  },
  Trainer: {
    targetLabel: "Training Hours / Exposure Visits",
    metricLabel: "Training hours",
    activities: [
      { title: "Batch training hours completed", type: "Training", proof: "Session photos" },
      { title: "Practical lab assessment", type: "Assessment", proof: "Assessment sheet" },
      { title: "Exposure visit conducted", type: "Exposure Visit", proof: "Visit report" },
    ],
  },
};

function monthDate(month, offset) {
  const monthText = month?.split(" ")[0] || "March";
  const yearText = month?.split(" ")[1] || "2026";
  const monthNumber =
    {
      January: "01",
      February: "02",
      March: "03",
      April: "04",
      May: "05",
      June: "06",
      July: "07",
      August: "08",
      September: "09",
      October: "10",
      November: "11",
      December: "12",
    }[monthText] || "03";

  return `${yearText}-${monthNumber}-${String(6 + offset * 8).padStart(2, "0")}`;
}

export function buildSalaryWorkEvidence(row, index = 0) {
  const config = roleEvidenceConfig[row.role] || {
    targetLabel: "Monthly Work Output",
    metricLabel: "Verified work",
    activities: [
      { title: "Monthly work verification", type: "Work", proof: "Work report" },
      { title: "Center coordination", type: "Coordination", proof: "Admin note" },
      { title: "Field validation", type: "Validation", proof: "Checklist" },
    ],
  };
  const achievement = Number(row.achievement || row.achievement1 || 0);
  const target = Number(row.target || row.target1 || 0);

  return {
    targetLabel: config.targetLabel,
    summary: `${achievement}/${target} ${config.metricLabel}`,
    items: config.activities.map((activity, activityIndex) => {
      const count = Math.max(Math.round(achievement / (activityIndex + 3)) + index + activityIndex, 1);
      return {
        id: `${row.id}-EV-${activityIndex + 1}`,
        title: activity.title,
        type: activity.type,
        date: monthDate(row.month, activityIndex),
        count,
        detail:
          row.role === "Placement Officer" && activityIndex === 1
            ? `${count} student offer records linked`
            : row.role === "Trainer" && activityIndex === 0
              ? `${count} verified training hours logged`
              : `${count} verified records submitted`,
        proofs: [
          { label: activity.proof, kind: activityIndex === 0 ? "image" : "document" },
          { label: `${activity.type} approval`, kind: "document" },
        ],
      };
    }),
  };
}

export function SalaryWorkEvidence({ evidence, tone = "violet" }) {
  const [open, setOpen] = useState(false);
  const toneClass =
    tone === "red"
      ? "border-red-400/25 bg-red-500/10 text-red-200"
      : "border-violet-400/25 bg-violet-500/10 text-violet-200";

  if (!evidence) return <span className="text-xs text-white/35">No proof attached</span>;

  const overlay = open
    ? createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end bg-black/55" onMouseDown={() => setOpen(false)}>
          <aside
            className="h-full w-full max-w-3xl overflow-y-auto border-l border-slate-700 bg-[#111827] p-6 shadow-2xl shadow-black/70"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-700/50 pb-5">
              <div>
                <p className={`text-xs font-black uppercase tracking-[0.18em] ${tone === "red" ? "text-red-300" : "text-violet-300"}`}>
                  Zoho Projects Style
                </p>
                <h2 className="mt-1 text-2xl font-black text-white">Work Proofs</h2>
                <p className="mt-1 text-sm font-bold text-slate-500">{evidence.targetLabel} · {evidence.summary}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-700 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                aria-label="Close proof overlay"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {evidence.items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-700/70 bg-[#0b1220] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-base font-black text-white">{item.title}</p>
                      <p className="mt-1 text-sm font-bold text-slate-500">{item.detail}</p>
                    </div>
                    <span className="w-fit rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-black text-emerald-300">
                      {item.count} verified
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 px-3 py-1.5">
                      <CalendarDays size={13} />
                      {item.date}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 px-3 py-1.5">
                      <ListChecks size={13} />
                      {item.type}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {item.proofs.map((proof) => {
                      const ProofIcon = proof.kind === "image" ? Image : FileText;
                      return (
                        <div
                          key={`${item.id}-${proof.label}`}
                          className="rounded-xl border border-slate-700 bg-[#111827] p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${toneClass}`}>
                              <ProofIcon size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-white">{proof.label}</p>
                              <p className="mt-1 text-xs font-bold text-slate-500">
                                {proof.kind === "image" ? "Image proof attached" : "Document proof attached"}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-black text-white/70 transition hover:border-white/20 hover:text-white"
                          >
                            <ExternalLink size={13} />
                            Open Proof
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>,
        document.body
      )
    : null;

  return (
    <div className="min-w-[270px]">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition hover:bg-white/[0.04] ${toneClass}`}
      >
        <span className="min-w-0">
          <span className="block truncate text-xs font-black">{evidence.targetLabel}</span>
          <span className="mt-0.5 block truncate text-[11px] font-bold text-white/55">{evidence.summary}</span>
        </span>
        <ExternalLink size={14} className="shrink-0" />
      </button>
      {overlay}
    </div>
  );
}
