import {
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Forward,
  Send,
  ShieldCheck,
  XCircle,
  Eye,
  Ban,
  Wallet,
  History,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   AUDIT TRAIL — Chronological timeline of approval actions
   ═══════════════════════════════════════════════════════════════
   Props:
     entries  — array of { action, actor, timestamp, note? }
     tone     — "violet" | "red"  (default "violet")
     compact  — boolean, smaller padding for inline use
   ═══════════════════════════════════════════════════════════════ */

const ACTION_CONFIG = {
  Submitted:            { icon: Send,          color: "text-sky-400",     bg: "bg-sky-500/15",     border: "border-sky-500/25" },
  "Application Filed":  { icon: FileText,      color: "text-sky-400",     bg: "bg-sky-500/15",     border: "border-sky-500/25" },
  "Under Review":       { icon: Eye,           color: "text-amber-400",   bg: "bg-amber-500/15",   border: "border-amber-500/25" },
  Reviewed:             { icon: Eye,           color: "text-amber-400",   bg: "bg-amber-500/15",   border: "border-amber-500/25" },
  "Pending Admin Review":      { icon: Clock,  color: "text-amber-400",   bg: "bg-amber-500/15",   border: "border-amber-500/25" },
  "Admin Approved":     { icon: CheckCircle2,  color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/25" },
  "Admin Rejected":     { icon: XCircle,       color: "text-red-400",     bg: "bg-red-500/15",     border: "border-red-500/25" },
  Forwarded:            { icon: Forward,       color: "text-cyan-400",    bg: "bg-cyan-500/15",    border: "border-cyan-500/25" },
  "Pending Super Admin Review": { icon: ShieldCheck, color: "text-cyan-400", bg: "bg-cyan-500/15", border: "border-cyan-500/25" },
  "Super Admin Approved": { icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/25" },
  "Super Admin Rejected": { icon: Ban,         color: "text-red-400",     bg: "bg-red-500/15",     border: "border-red-500/25" },
  Approved:             { icon: CheckCircle2,  color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/25" },
  Rejected:             { icon: XCircle,       color: "text-red-400",     bg: "bg-red-500/15",     border: "border-red-500/25" },
  Returned:             { icon: Ban,           color: "text-red-400",     bg: "bg-red-500/15",     border: "border-red-500/25" },
  Paid:                 { icon: Wallet,        color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/25" },
  Verified:             { icon: ShieldCheck,   color: "text-violet-400",  bg: "bg-violet-500/15",  border: "border-violet-500/25" },
  Planned:              { icon: Clock,         color: "text-amber-400",   bg: "bg-amber-500/15",   border: "border-amber-500/25" },
  Completed:            { icon: CheckCircle2,  color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/25" },
  "Enrolled":           { icon: FileText,      color: "text-sky-400",     bg: "bg-sky-500/15",     border: "border-sky-500/25" },
  "Invoice Raised":     { icon: FileText,      color: "text-sky-400",     bg: "bg-sky-500/15",     border: "border-sky-500/25" },
};

const DEFAULT_CONFIG = { icon: Circle, color: "text-slate-400", bg: "bg-slate-500/15", border: "border-slate-500/25" };

const TONE_MAP = {
  violet: {
    headerBorder: "border-violet-500/20",
    headerBg: "bg-violet-500/5",
    headerText: "text-violet-300",
    headerIcon: "text-violet-400",
    line: "bg-violet-500/20",
  },
  red: {
    headerBorder: "border-red-500/20",
    headerBg: "bg-red-500/5",
    headerText: "text-red-300",
    headerIcon: "text-red-400",
    line: "bg-red-500/20",
  },
};

export default function AuditTrail({ entries = [], tone = "violet", compact = false }) {
  const t = TONE_MAP[tone] || TONE_MAP.violet;

  if (!entries.length) {
    return (
      <div className={`rounded-2xl border ${t.headerBorder} ${t.headerBg} p-5 text-center`}>
        <History size={24} className={`mx-auto mb-2 ${t.headerIcon} opacity-40`} />
        <p className="text-sm text-slate-400">No audit trail available yet.</p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] ${compact ? "" : "shadow-xl"}`}>
      {/* Header */}
      <div className={`flex items-center gap-2.5 border-b border-slate-800 ${t.headerBg} px-5 py-3`}>
        <History size={16} className={t.headerIcon} />
        <h3 className={`text-sm font-semibold ${t.headerText}`}>Audit Trail</h3>
        <span className="ml-auto rounded-full border border-slate-700 bg-[#0b1220] px-2.5 py-0.5 text-[10px] font-bold text-slate-400">
          {entries.length} {entries.length === 1 ? "event" : "events"}
        </span>
      </div>

      {/* Timeline */}
      <div className={`relative ${compact ? "p-4" : "p-5"}`}>
        {/* Vertical line */}
        <div className={`absolute bottom-5 left-[31px] top-5 w-px ${t.line}`} style={{ zIndex: 0 }} />

        <div className="relative space-y-0">
          {entries.map((entry, idx) => {
            const config = ACTION_CONFIG[entry.action] || DEFAULT_CONFIG;
            const Icon = config.icon;
            const isLatest = idx === entries.length - 1;

            return (
              <div key={idx} className="group relative flex gap-4 pb-5 last:pb-0">
                {/* Node */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${config.border} ${config.bg} transition-all group-hover:scale-110 ${
                      isLatest ? "ring-2 ring-offset-1 ring-offset-[#111827] " + config.border : ""
                    }`}
                  >
                    <Icon size={12} className={config.color} />
                  </div>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 -mt-0.5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className={`text-sm font-semibold ${config.color}`}>
                      {entry.action}
                    </span>
                    {entry.timestamp && (
                      <span className="text-[11px] font-medium text-slate-500">
                        {entry.timestamp}
                      </span>
                    )}
                  </div>
                  {entry.actor && (
                    <p className="mt-1 text-xs text-slate-400">
                      by <span className="font-medium text-slate-300">{entry.actor}</span>
                    </p>
                  )}
                  {entry.note && (
                    <div className="mt-2 rounded-lg border border-slate-800 bg-[#0b1220] px-3 py-2">
                      <p className="text-xs leading-5 text-slate-400">{entry.note}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
