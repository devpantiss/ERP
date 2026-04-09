import {
  AlertTriangle,
  Info,
  CheckCircle2,
  Bell,
  X,
} from "lucide-react";
import { useState } from "react";

/* ===================== ALERTS DATA ===================== */

const INITIAL_ALERTS = [
  {
    id: 1,
    type: "warning",
    title: "Low Attendance at Kalahandi Center",
    message:
      "Attendance has dropped below 60% for the last 3 days. Immediate action required.",
    time: "30 min ago",
    icon: AlertTriangle,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
  },
  {
    id: 2,
    type: "info",
    title: "New Batch Starting – PMKVY 4.0",
    message:
      "A new batch at Angul center is scheduled to begin on March 15. 42 candidates enrolled.",
    time: "1 hr ago",
    icon: Info,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    id: 3,
    type: "success",
    title: "Placement Target Achieved – Jajpur",
    message:
      "CSR Tata Steel project at Jajpur has achieved 100% placement target ahead of schedule.",
    time: "2 hrs ago",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
  {
    id: 4,
    type: "warning",
    title: "Trainer Certificate Expiring",
    message:
      "3 trainers have TOT certificates expiring within the next 30 days. Renewal recommended.",
    time: "4 hrs ago",
    icon: AlertTriangle,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
  },
  {
    id: 5,
    type: "info",
    title: "System Maintenance Scheduled",
    message:
      "Platform maintenance is scheduled for March 10, 2:00 AM – 4:00 AM IST.",
    time: "6 hrs ago",
    icon: Bell,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/20",
  },
];

/* ===================== MAIN COMPONENT ===================== */

export default function AdminDashboardSection4() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);

  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <section className="bg-[#111827] border border-slate-700 rounded-2xl p-6 mt-6">

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-violet-400">
          System Alerts & Notifications
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {alerts.length} active
          </span>
          {alerts.length > 0 && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500" />
            </span>
          )}
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <CheckCircle2 size={40} className="mx-auto mb-3 text-emerald-500/50" />
          <p className="text-sm">All caught up! No pending alerts.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-4 p-4 rounded-xl border ${alert.bgColor} ${alert.borderColor} transition-all duration-300`}
              >
                <div className={`mt-0.5 ${alert.color}`}>
                  <Icon size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-white/90">
                      {alert.title}
                    </h4>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="text-slate-500 hover:text-white/80 transition ml-2 shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-white/60 mt-1 leading-relaxed">
                    {alert.message}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2">
                    {alert.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
