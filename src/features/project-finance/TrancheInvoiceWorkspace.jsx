import { useState } from "react";
import { useLocation } from "react-router-dom";
import { mockDb } from "../../mock-db";
import { useAuthStore } from "../../stores/authStore";
import { applyRoleScope } from "../../services/mockApiClient";
import { useProjectExecutionStore } from "./projectExecutionStore";
import ProjectFinancialPanel from "./ProjectFinancialPanel";

export default function TrancheInvoiceWorkspace({ financeQueue = false }) {
  const session = useAuthStore((state) => state.currentUser);
  const path = useLocation().pathname;
  const user = session || mockDb.users.byId[path.startsWith("/super-admin") ? "USR-0001" : "USR-0002"];
  const catalog = useProjectExecutionStore((state) => state.catalog);
  void catalog;
  const projects = applyRoleScope("projects", Object.values(mockDb.projects.byId), user);
  const [selectedId, setSelectedId] = useState("");
  const project = projects.find((item) => item.id === selectedId) || projects[0];
  return <section className="lead-workspace"><header className="lead-header"><div><p className="lead-eyebrow">Project finance</p><h1>{financeQueue ? "Finance Handoff" : "Tranche Invoices"}</h1><p>{financeQueue ? "Invoices raised by the Vertical Head to the Finance division." : "Project Lead → Vertical Head → Finance, with deadline tracking for every tranche."}</p></div></header><div className="lead-toolbar"><label>Project <select value={project?.id || ""} onChange={(event) => setSelectedId(event.target.value)}>{projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>{project ? <ProjectFinancialPanel key={project.id} projectId={project.id} financeQueue={financeQueue} /> : <div className="lead-empty"><h2>No assigned projects</h2><p>Your project assignments will appear here.</p></div>}</section>;
}
