import { useEffect } from "react";

const PROJECTS = ["Skill India", "Green Jobs", "Rural Employment"];
const GPS_LIST = [
  "Binjharpur GP",
  "Jajpur Road GP",
  "Dharmasala GP",
  "Sukinda GP",
];

const BLOCKS = ["Jajpur", "Dharmasala", "Sukinda", "Danagadi"];

export default function Step1EventDetails({
  value = {},
  update,
  onValidChange,
}) {
  const {
    eventName = "",
    project = "",
    block = "",
    gpName = "",
    eventDate = "",
    participants = "",
  } = value;

  useEffect(() => {
    onValidChange(
      Boolean(
        eventName &&
        project &&
        block &&
        gpName &&
        eventDate &&
        participants
      )
    );
  }, [eventName, project, block, gpName, eventDate, participants]);

  return (
    <div className="grid md:grid-cols-2 gap-8">

      <Field label="Event Name">
        <input
          value={eventName}
          onChange={(e) => update("eventName", e.target.value)}
          className="input"
        />
      </Field>

      <Field label="Project">
        <select
          value={project}
          onChange={(e) => update("project", e.target.value)}
          className="input"
        >
          <option value="">Select</option>
          {PROJECTS.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </Field>

      <Field label="Block">
        <select
          value={block}
          onChange={(e) => update("block", e.target.value)}
          className="input"
        >
          <option value="">Select</option>
          {BLOCKS.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </Field>

      <Field label="GP Name">
        <select
          value={gpName}
          onChange={(e) => update("gpName", e.target.value)}
          className="input"
        >
          <option value="">Select</option>
          {GPS_LIST.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </Field>

      <Field label="Event Date">
        <input
          type="date"
          value={eventDate}
          onChange={(e) => update("eventDate", e.target.value)}
          className="input"
        />
      </Field>

      <Field label="No. of Participants">
        <input
          type="number"
          value={participants}
          onChange={(e) => update("participants", e.target.value)}
          className="input"
        />
      </Field>

    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}