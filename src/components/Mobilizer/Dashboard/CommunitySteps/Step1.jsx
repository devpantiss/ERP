import { useEffect } from "react";

const PROJECTS = ["Skill India", "Green Jobs", "Rural Employment"];
const GPS_LIST = [
  "Binjharpur GP",
  "Jajpur Road GP",
  "Dharmasala GP",
  "Sukinda GP",
];

export default function Step1EventDetails({
  value = {},
  update,
  onValidChange,
}) {
  const {
    eventName = "",
    project = "",
    gpName = "",
    eventDate = "",
  } = value;

  useEffect(() => {
    onValidChange(
      Boolean(eventName && project && gpName && eventDate)
    );
  }, [eventName, project, gpName, eventDate]);

  return (
    <div className="grid md:grid-cols-2 gap-8">

      <div>
        <label className="block text-sm text-slate-400 mb-2">
          Event Name
        </label>
        <input
          value={eventName}
          onChange={(e) => update("eventName", e.target.value)}
          className="w-full px-4 py-2 rounded-lg
          bg-[#020617] border border-yellow-400/30
          focus:border-yellow-400 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-2">
          Project
        </label>
        <select
          value={project}
          onChange={(e) => update("project", e.target.value)}
          className="w-full px-4 py-2 rounded-lg
          bg-[#020617] border border-yellow-400/30"
        >
          <option value="">Select</option>
          {PROJECTS.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-2">
          GP Name
        </label>
        <select
          value={gpName}
          onChange={(e) => update("gpName", e.target.value)}
          className="w-full px-4 py-2 rounded-lg
          bg-[#020617] border border-yellow-400/30"
        >
          <option value="">Select</option>
          {GPS_LIST.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-2">
          Event Date
        </label>
        <input
          type="date"
          value={eventDate}
          onChange={(e) => update("eventDate", e.target.value)}
          className="w-full px-4 py-2 rounded-lg
          bg-[#020617] border border-yellow-400/30"
        />
      </div>
    </div>
  );
}
