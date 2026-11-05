import AlertsWorkspace from "./AlertsWorkspace";
import { useProjectExecutionStore } from "../../features/project-finance/projectExecutionStore";
import { projectActuals } from "../../features/project-finance/projectFinanceModel";
import "../../features/project-finance/projectFinance.css";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Bell, ArrowUpRight } from "lucide-react";
import { mockDb } from "../../mock-db";
import { applyRoleScope } from "../../services/mockApiClient";
import { useAuthStore } from "../../stores/authStore";
import { buildOperationalAlerts } from "./monitoringData";
import "../../pages/ProjectLead/ProjectLead.css";
import "./monitoring.css";

export default function OperationalAlerts({ level = "center", compact = false, dashboard = false, projectId }) {
  const [searchParams] = useSearchParams();
  const selectedProjectId = projectId || searchParams.get("projectId");
  const session = useAuthStore((state) => state.currentUser);
  const user = session || mockDb.users.byId[level === "center" ? "USR-0007" : level === "project" ? "USR-0002" : "USR-0001"];
  const plans = useProjectExecutionStore((state) => state.plans);
  const invoices = useProjectExecutionStore((state) => state.invoices);
  const [tick, refresh] = useState(0);
  useEffect(() => { const id = setInterval(() => refresh((value) => value + 1), 30000); return () => clearInterval(id); }, []);
  void tick;
  const rows = (entity) => {
    const scoped = applyRoleScope(entity, Object.values(mockDb[entity].byId), user);
    if (!selectedProjectId) return scoped;
    if (entity === "projects") return scoped.filter((record) => record.id === selectedProjectId);
    if (entity === "employees") return scoped.filter((record) => record.projectIds?.includes(selectedProjectId));
    return scoped.filter((record) => record.projectId === selectedProjectId);
  };
  const projects = rows("projects"), centers = rows("centers"), employees = rows("employees");
  const centerIds = new Set(centers.map((center) => center.id));
  const records = [];
  let storageUnavailable = false;
  try {
    for (const key of Object.keys(localStorage)) {
      if (!/^pantiss:project-lead:.*:(audits|visits)$/.test(key)) continue;
      const items = JSON.parse(localStorage.getItem(key) || "[]");
      if (Array.isArray(items)) records.push(...items.filter((item) => centerIds.has(item.centerId)).map((item) => ({ ...item, kind: key.split(":").at(-1) })));
    }
  } catch { storageUnavailable = true; }
  const alerts = buildOperationalAlerts({ projects, batches: rows("batches"), employees, attendance: rows("attendance"), records, plans, invoices, progress: Object.fromEntries(projects.map((project) => [project.id, projectActuals(mockDb, project.id)])) });
  const alertsPath = level === "center" ? "/center-incharge/alerts" : level === "project" ? "/project-head/alerts" : "/super-admin/alerts";
  const href = selectedProjectId ? `${alertsPath}?projectId=${encodeURIComponent(selectedProjectId)}` : alertsPath;
  if (dashboard) {
    const missed = (alert) => ["Deadline missed", "Overdue"].includes(alert.severity);
    const priorityAlerts = [...alerts].sort((left, right) => Number(missed(right)) - Number(missed(left))).slice(0, 5);
    return <section className="lead-workspace monitoring-overall" aria-labelledby="overall-alerts-heading">
      <header className="monitoring-overall-header"><div><h2 id="overall-alerts-heading">Overall Alerts <span className="lead-status">{alerts.length}</span></h2><p>{level === "project" ? `Warnings and exceptions for ${projects[0]?.name || "your assigned project"}.` : "Warnings and exceptions across all projects in your vertical."}</p></div><Link to={href}>View all alerts <ArrowUpRight size={16} /></Link></header>
      <div className="dashboard-panel-scroll" role="region" aria-label="Dashboard alerts" tabIndex={0}>
      <div className="lead-summary"><span><strong className="monitoring-danger-text">{alerts.filter(missed).length}</strong>Missed deadlines</span><span><strong className="monitoring-warning-text">{alerts.filter((alert) => alert.severity === "Warning").length}</strong>Warnings</span><span><strong>{alerts.filter((alert) => alert.category === "Performance").length}</strong>Employee performance flags</span></div>
      {storageUnavailable && <p className="lead-error" role="alert">Some local visit and audit records could not be read. Available alerts are shown below.</p>}
      {priorityAlerts.length ? <ul className="monitoring-overall-list">{priorityAlerts.map((alert) => <li key={alert.id}><div><p className="lead-eyebrow">{alert.category} · {centers.find((center) => center.id === alert.centerId)?.name || "Project-wide"}</p><h3>{alert.title}</h3><p>{alert.detail}</p></div><span className={`lead-status ${missed(alert) ? "monitoring-overdue" : "monitoring-warning"}`}>{alert.severity}</span></li>)}</ul> : <div className="monitoring-overall-empty"><Bell size={22} /><div><h3>No exceptions flagged</h3><p>No delayed work or below-threshold employee performance is currently recorded.</p></div></div>}
      {alerts.length > priorityAlerts.length && <p className="lead-notice">Showing the 5 highest-priority alerts of {alerts.length}. View all alerts for the full list.</p>}
      </div>
    </section>;
  }
  if (compact) return <section className="lead-workspace monitoring-preview" aria-label="Alerts"><div><Bell size={20} /><div><h2>Alerts <span className="lead-status">{alerts.length}</span></h2><p>{alerts.filter((alert) => alert.severity === "Warning").length} warnings · {alerts.filter((alert) => ["Deadline missed", "Overdue"].includes(alert.severity)).length} missed deadlines · {alerts.filter((alert) => alert.category === "Performance").length} employee performance flags</p></div></div><Link to={href}>View alerts <ArrowUpRight size={16} /></Link></section>;
  return <AlertsWorkspace alerts={alerts} projects={projects} centers={centers} level={level} storageUnavailable={storageUnavailable} selectedProjectId={selectedProjectId} />;
}
