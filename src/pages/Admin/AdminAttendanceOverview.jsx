import { ClipboardCheck, GraduationCap, Megaphone, Briefcase, Users } from "lucide-react";
import { ATTENDANCE_OVERVIEW } from "./adminPortalData";

const totalForRole = (roleKey) =>
  ATTENDANCE_OVERVIEW.reduce(
    (accumulator, item) => ({
      present: accumulator.present + item[roleKey].present,
      total: accumulator.total + item[roleKey].total,
    }),
    { present: 0, total: 0 }
  );

export default function AdminAttendanceOverview() {
  const trainerTotals = totalForRole("trainers");
  const placementTotals = totalForRole("placementOfficers");
  const mobilizerTotals = totalForRole("mobilizers");
  const candidateTotals = totalForRole("candidates");
  const overallPresent =
    trainerTotals.present +
    placementTotals.present +
    mobilizerTotals.present +
    candidateTotals.present;
  const overallTotal =
    trainerTotals.total +
    placementTotals.total +
    mobilizerTotals.total +
    candidateTotals.total;

  const cards = [
    {
      label: "Trainers",
      value: `${trainerTotals.present}/${trainerTotals.total}`,
      rate: Math.round((trainerTotals.present / trainerTotals.total) * 100),
      icon: GraduationCap,
    },
    {
      label: "Placement Officers",
      value: `${placementTotals.present}/${placementTotals.total}`,
      rate: Math.round((placementTotals.present / placementTotals.total) * 100),
      icon: Briefcase,
    },
    {
      label: "Mobilizers",
      value: `${mobilizerTotals.present}/${mobilizerTotals.total}`,
      rate: Math.round((mobilizerTotals.present / mobilizerTotals.total) * 100),
      icon: Megaphone,
    },
    {
      label: "Candidates",
      value: `${candidateTotals.present}/${candidateTotals.total}`,
      rate: Math.round((candidateTotals.present / candidateTotals.total) * 100),
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Attendance Overview</h1>
        <p className="mt-1 text-sm text-white/60">
          Attendance monitoring across trainers, placement officers, mobilizers, and candidates.
        </p>
      </div>

      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-sky-500/10 p-5">
        <div className="flex items-center gap-2 text-violet-300">
          <ClipboardCheck size={18} />
          <span className="text-sm font-medium">Overall Attendance Snapshot</span>
        </div>
        <div className="mt-3 flex flex-wrap items-end gap-6">
          <div>
            <p className="text-3xl font-semibold text-white">{Math.round((overallPresent / overallTotal) * 100)}%</p>
            <p className="text-sm text-white/60">
              {overallPresent} present out of {overallTotal}
            </p>
          </div>
          <div className="h-3 w-full max-w-xl overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-400"
              style={{ width: `${Math.round((overallPresent / overallTotal) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-700 bg-[#111827] p-4">
            <div className="mb-2 flex items-center gap-2 text-white/60">
              <card.icon size={15} className="text-violet-400" />
              <span className="text-xs">{card.label}</span>
            </div>
            <p className="text-2xl font-semibold text-white">{card.value}</p>
            <p className="mt-1 text-xs text-emerald-300">{card.rate}% attendance</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-[#111827]">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-[#0b1220] text-white/60">
            <tr>
              <th className="p-4 text-left">Center</th>
              <th className="p-4 text-left">Project</th>
              <th className="p-4 text-left">Trainers</th>
              <th className="p-4 text-left">Placement Officers</th>
              <th className="p-4 text-left">Mobilizers</th>
              <th className="p-4 text-left">Candidates</th>
              <th className="p-4 text-left">Center Health</th>
            </tr>
          </thead>
          <tbody>
            {ATTENDANCE_OVERVIEW.map((item) => {
              const centerTotal =
                item.trainers.total +
                item.placementOfficers.total +
                item.mobilizers.total +
                item.candidates.total;
              const centerPresent =
                item.trainers.present +
                item.placementOfficers.present +
                item.mobilizers.present +
                item.candidates.present;
              const centerRate = Math.round((centerPresent / centerTotal) * 100);

              return (
                <tr key={item.center} className="border-t border-slate-700/60">
                  <td className="p-4 font-medium text-white/90">{item.center}</td>
                  <td className="p-4 text-white/70">{item.project}</td>
                  <td className="p-4 text-white/80">
                    {item.trainers.present}/{item.trainers.total}
                  </td>
                  <td className="p-4 text-white/80">
                    {item.placementOfficers.present}/{item.placementOfficers.total}
                  </td>
                  <td className="p-4 text-white/80">
                    {item.mobilizers.present}/{item.mobilizers.total}
                  </td>
                  <td className="p-4 text-white/80">
                    {item.candidates.present}/{item.candidates.total}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-700">
                        <div
                          className={`h-full rounded-full ${
                            centerRate >= 90
                              ? "bg-emerald-500"
                              : centerRate >= 80
                              ? "bg-violet-500"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${centerRate}%` }}
                        />
                      </div>
                      <span className="text-xs text-white/70">{centerRate}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
