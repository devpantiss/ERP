import { useState } from "react";
import { Check } from "lucide-react";
import { useProjectLeadScope } from "./useProjectLeadScope";
import "./ProjectLead.css";

const LANES = [
  { role: "ROL-0008", label: "Center Incharge", key: "incharge", single: true },
  { role: "ROL-0003", label: "Trainers", key: "trainers" },
  { role: "ROL-0004", label: "Mobilizers", key: "mobilizers" },
  { role: "ROL-0005", label: "Placement Officers", key: "placement" },
];
const fullName = (person) => `${person.firstName} ${person.lastName}`;
function initialSetup(center, employees) {
  return Object.fromEntries(LANES.map((lane) => [lane.key, employees.filter((person) => person.roleIds.includes(lane.role) && person.centerIds.includes(center.id)).map((person) => person.id)]));
}

export default function CenterTeamSetup() {
  const { user, centers, projects, employees } = useProjectLeadScope();
  const [centerId, setCenterId] = useState(centers[0]?.id || "");
  const center = centers.find((item) => item.id === centerId) || centers[0];
  return <section className="lead-workspace"><header className="lead-header"><div><p className="lead-eyebrow">Project Lead / People</p><h1>Center-wise Team Setup</h1><p>Define the center incharge and delivery team for each training center.</p></div></header><div className="lead-toolbar"><label>Training center<select value={center?.id || ""} onChange={(event) => setCenterId(event.target.value)}>{centers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>{center ? <CenterSetup key={`${user.id}:${center.id}`} center={center} employees={employees.filter((person) => person.projectIds.includes(center.projectId))} project={projects.find((item) => item.id === center.projectId)} user={user} /> : <div className="lead-empty"><h2>No centers assigned</h2><p>Contact your Vertical Head to complete your project assignment.</p></div>}</section>;
}

function CenterSetup({ center, employees, project, user }) {
  const storageKey = `pantiss:team-setup:${user.id}:${center.id}`;
  const [setup, setSetup] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey)) || initialSetup(center, employees); } catch { return initialSetup(center, employees); }
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const toggle = (lane, id) => {
    setMessage(""); setError("");
    setSetup((current) => ({ ...current, [lane.key]: lane.single ? [id] : current[lane.key].includes(id) ? current[lane.key].filter((item) => item !== id) : [...current[lane.key], id] }));
  };
  const save = (event) => {
    event.preventDefault();
    if (!setup.incharge?.length) return setError("Assign a Center Incharge before saving the team.");
    const valid = Object.fromEntries(LANES.map((lane) => [lane.key, (setup[lane.key] || []).filter((id) => employees.some((person) => person.id === id && person.roleIds.includes(lane.role) && ["ACTIVE", "ON_LEAVE"].includes(person.status)))]));
    if (!valid.incharge.length) return setError("Select an active Center Incharge for this project.");
    try { localStorage.setItem(storageKey, JSON.stringify(valid)); setSetup(valid); setError(""); setMessage("Center team setup saved in this browser."); } catch { setError("Unable to save team setup. Free browser storage and try again."); }
  };
  return <form onSubmit={save}><div className="lead-team-intro"><div><p className="lead-eyebrow">{project?.name}</p><h2>{center.name}</h2><p>{center.district}, {center.state}</p></div><span className="lead-status">{Object.values(setup).flat().length} assigned</span></div><div className="lead-team-grid">{LANES.map((lane) => {
    const candidates = employees.filter((person) => person.roleIds.includes(lane.role));
    return <fieldset className="lead-team-lane" key={lane.key}><legend>{lane.label}</legend><p>{lane.single ? "One person accountable for center operations." : "Select the staff responsible for center delivery."}</p>{candidates.length ? candidates.map((person) => <label className="lead-person" key={person.id}><input type={lane.single ? "radio" : "checkbox"} name={lane.key} value={person.id} checked={setup[lane.key]?.includes(person.id) || false} onChange={() => toggle(lane, person.id)} disabled={!["ACTIVE", "ON_LEAVE"].includes(person.status)} /><span><strong>{fullName(person)}</strong><small>{person.email}</small>{person.status !== "ACTIVE" && <small>Status · {person.status.replaceAll("_", " ").toLowerCase()}</small>}</span></label>) : <p className="lead-empty-lane">No staff with this role in the project. Ask your Vertical Head to add a staff assignment.</p>}</fieldset>;
  })}</div><div className="lead-save-bar"><div><p className="lead-notice" role="status">{message || "Team setup is saved as a local planning record. Organization-wide assignments remain managed by the Vertical Head."}</p>{error && <p className="lead-error" role="alert">{error}</p>}</div><button className="lead-primary"><Check size={16} />Save team setup</button></div></form>;
}
