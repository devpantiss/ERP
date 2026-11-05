import { useState } from "react";
import { useLocation } from "react-router-dom";
import { mockDb } from "../../mock-db";
import { useAuthStore } from "../../stores/authStore";
import { applyRoleScope } from "../../services/mockApiClient";
import { useProjectExecutionStore } from "./projectExecutionStore";
import { money, projectActuals, trancheReleaseStatus, usedProjectBudget } from "./projectFinanceModel";
import ProjectFinancialPanel from "./ProjectFinancialPanel";

export default function TrancheInvoiceWorkspace({ financeQueue = false, portfolio = false }) {
  const session = useAuthStore((state) => state.currentUser);
  const path = useLocation().pathname;
  const user = session || mockDb.users.byId[path.startsWith("/super-admin") ? "USR-0001" : "USR-0002"];
  const plans = useProjectExecutionStore((state) => state.plans);
  const expenses = useProjectExecutionStore((state) => state.expenses);
  const catalog = useProjectExecutionStore((state) => state.catalog);
  void catalog;
  const projects = applyRoleScope("projects", Object.values(mockDb.projects.byId), user);
  const [selectedId, setSelectedId] = useState("");
  const project = projects.find((item) => item.id === selectedId) || projects[0];
  return <section className="lead-workspace"><header className="lead-header"><div><p className="lead-eyebrow">Project finance</p><h1>{portfolio ? "Project Budgets & Tranches" : financeQueue ? "Finance Handoff" : "Tranche Invoices"}</h1><p>{portfolio ? "Project-wise allotted funds, budget utilization and tranche release readiness." : financeQueue ? "Invoices raised by the Vertical Head to the Finance division." : "Project Lead → Vertical Head → Finance, with deadline tracking for every tranche."}</p></div></header>{portfolio && <div className="monitoring-table"><table><caption className="sr-only">Project-wise budgets and tranche readiness</caption><thead><tr>{["Project", "Allotted funds", "Budget used", "Payment tranches", "Ready for invoice"].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{projects.map((item) => { const plan = plans[item.id]; const ready = (plan?.tranches || []).filter((tranche) => trancheReleaseStatus(tranche, projectActuals(mockDb, item.id)).met).length; return <tr key={item.id}><td><button onClick={() => setSelectedId(item.id)} aria-pressed={project?.id === item.id}>{item.name}</button></td><td>{plan ? money(plan.budget) : "Not recorded"}</td><td>{money(usedProjectBudget(mockDb, item.id, expenses[item.id] || []))}</td><td>{plan?.tranches.length ?? "Not recorded"}</td><td>{ready} conditions met</td></tr>; })}</tbody></table></div>}<div className="lead-toolbar"><label>Project <select value={project?.id || ""} onChange={(event) => setSelectedId(event.target.value)}>{projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>{project ? <ProjectFinancialPanel key={project.id} projectId={project.id} financeQueue={financeQueue} /> : <div className="lead-empty"><h2>No assigned projects</h2><p>Your project assignments will appear here.</p></div>}</section>;
}
