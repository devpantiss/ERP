import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2, ChevronRight, Users, Layers } from "lucide-react";
import { mockDb } from "../../mock-db";
import { applyRoleScope } from "../../services/mockApiClient";
import { getEmployeeName, getRoleLabel } from "../../stores/selectors/employeeSelectors";
import { useAuthStore } from "../../stores/authStore";
import "./RoleWorkspace.css";

const records = (name) => Object.values(mockDb[name].byId);
const nameOf = (id) => getEmployeeName(mockDb.employees.byId[id]) || "Assignment pending";

export default function RoleWorkspace({ level = "project", embedded = false }) {
  // Public role previews use a representative mock account, matching the existing demo login.
  const session = useAuthStore((state) => state.currentUser);
  const user = session || mockDb.users.byId[level === "center" ? "USR-0007" : "USR-0002"];
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [projectFilter, setProjectFilter] = useState("");
  const scopedProjects = applyRoleScope("projects", records("projects"), user);
  const projects = projectFilter ? scopedProjects.filter((p) => p.id === projectFilter) : scopedProjects;
  const centers = applyRoleScope("centers", records("centers"), user).filter((c) => projects.some((p) => p.id === c.projectId));
  const title = level === "center" ? "Center Incharge" : "Project Head";
  const visibleCenters = selectedCenter ? centers.filter((c) => c.id === selectedCenter) : centers;
  return <section className={`role-workspace${embedded ? " role-workspace--embedded" : ""}`} aria-label={`${title} workspace`}>
    <header className="role-workspace__header"><Link to="/"><ArrowLeft size={16} /> Switch role</Link><span>{title} workspace</span></header>
    <div className="role-workspace__intro"><p className="role-workspace__eyebrow">Organization / {title}</p><h1>{`${title} Dashboard`}</h1><p>{level === "center" ? "Coordinate your center’s mobilization, training and placement team." : "Oversee project delivery through dedicated Center Incharges."}</p></div>
    {level === "project" && <Link className="role-workspace__operations" to="/project-head/dashboard">Open project operations <ChevronRight size={16} /></Link>}
    <ol className="role-workspace__chain" aria-label="Reporting hierarchy">{["Super Admin · Vertical Head", "Project Head", "Center Incharge", "Mobilizer · Trainer · Placement Officer"].map((label) => <li key={label}>{label}<ChevronRight size={14} /></li>)}</ol>
    <div className="role-workspace__metrics">{[[Building2, "Projects", projects.length], [Layers, "Centers", centers.length], [Users, "Center team", records("employees").filter((e) => e.roleIds.some((r) => ["ROL-0003", "ROL-0004", "ROL-0005"].includes(r)) && e.centerIds.some((id) => centers.some((c) => c.id === id))).length]].map(([Icon, label, value]) => <div key={label}><Icon size={20} /><span>{label}</span><strong>{value}</strong></div>)}</div>
    <div className="role-workspace__toolbar"><h2>{selectedCenter ? "Center team" : "Centers & reporting lines"}</h2>{selectedCenter ? <button onClick={() => setSelectedCenter(null)}>All assigned centers</button> : <label>Project <select value={projectFilter} onChange={(e) => { setProjectFilter(e.target.value); setSelectedCenter(null); }}><option value="">All assigned projects</option>{scopedProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}</div>
    <div className="role-workspace__grid">{visibleCenters.map((center) => {
      const project = mockDb.projects.byId[center.projectId];
      const team = records("employees").filter((e) => e.centerIds.includes(center.id));
      return <article className="role-workspace__card" key={center.id}><p className="role-workspace__eyebrow">{project.name}</p><h3>{center.name}</h3><p>{center.district}, {center.state}</p><dl><div><dt>Project Head</dt><dd>{nameOf(project.projectHeadEmployeeId)}</dd></div><div><dt>Center Incharge</dt><dd>{nameOf(center.managerEmployeeId)}</dd></div></dl><div className="role-workspace__team">{["Mobilizer", "Trainer", "Placement Officer"].map((role) => {
        const people = team.filter((e) => e.roleIds.some((r) => getRoleLabel(r) === role));
        return <div key={role}><span>{role}</span><strong>{people.map(getEmployeeName).join(", ") || "Assignment pending"}</strong></div>;
      })}</div>{!selectedCenter && <button className="role-workspace__open" onClick={() => setSelectedCenter(center.id)}>View center team <ChevronRight size={16} /></button>}</article>;
    })}</div>{!centers.length && <p className="role-workspace__empty">No centers assigned. Contact your reporting head to complete your assignment.</p>}
  </section>;
}
