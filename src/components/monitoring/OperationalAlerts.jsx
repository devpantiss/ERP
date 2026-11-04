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
  const [category, setCategory] = useState("");
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
  const visible = alerts.filter((alert) => !category || alert.category === category);
  const alertsPath = level === "center" ? "/center-incharge/alerts" : level === "project" ? "/project-head/alerts" : "/super-admin/alerts";
  const href = selectedProjectId ? `${alertsPath}?projectId=${encodeURIComponent(selectedProjectId)}` : alertsPath;
  if (dashboard) {
    const missed = (alert) => ["Deadline missed", "Overdue"].includes(alert.severity);
    const priorityAlerts = [...alerts].sort((left, right) => Number(missed(right)) - Number(missed(left))).slice(0, 5);
    return <section className="lead-workspace monitoring-overall" aria-labelledby="overall-alerts-heading">
      <header className="monitoring-overall-header"><div><h2 id="overall-alerts-heading">Overall Alerts <span className="lead-status">{alerts.length}</span></h2><p>{level === "project" ? `Warnings and exceptions for ${projects[0]?.name || "your assigned project"}.` : "Warnings and exceptions across all projects in your vertical."}</p></div><Link to={href}>View all alerts <ArrowUpRight size={16} /></Link></header>
      <div className="lead-summary"><span><strong className="monitoring-danger-text">{alerts.filter(missed).length}</strong>Missed deadlines</span><span><strong className="monitoring-warning-text">{alerts.filter((alert) => alert.severity === "Warning").length}</strong>Warnings</span><span><strong>{alerts.filter((alert) => alert.category === "Performance").length}</strong>Employee performance flags</span></div>
      {storageUnavailable && <p className="lead-error" role="alert">Some local visit and audit records could not be read. Available alerts are shown below.</p>}
      {priorityAlerts.length ? <ul className="monitoring-overall-list">{priorityAlerts.map((alert) => <li key={alert.id}><div><p className="lead-eyebrow">{alert.category} · {centers.find((center) => center.id === alert.centerId)?.name || "Project-wide"}</p><h3>{alert.title}</h3><p>{alert.detail}</p></div><span className={`lead-status ${missed(alert) ? "monitoring-overdue" : "monitoring-warning"}`}>{alert.severity}</span></li>)}</ul> : <div className="monitoring-overall-empty"><Bell size={22} /><div><h3>No exceptions flagged</h3><p>No delayed work or below-threshold employee performance is currently recorded.</p></div></div>}
      {alerts.length > priorityAlerts.length && <p className="lead-notice">Showing the 5 highest-priority alerts of {alerts.length}. View all alerts for the full list.</p>}
    </section>;
  }
  if (compact) return <section className="lead-workspace monitoring-preview" aria-label="Alerts"><div><Bell size={20} /><div><h2>Alerts <span className="lead-status">{alerts.length}</span></h2><p>{alerts.filter((alert) => alert.severity === "Warning").length} warnings · {alerts.filter((alert) => ["Deadline missed", "Overdue"].includes(alert.severity)).length} missed deadlines · {alerts.filter((alert) => alert.category === "Performance").length} employee performance flags</p></div></div><Link to={href}>View alerts <ArrowUpRight size={16} /></Link></section>;
  return <section className="lead-workspace"><header className="lead-header"><div><p className="lead-eyebrow">{level === "center" ? "Center Incharge" : level === "project" ? "Project Lead" : "Vertical Lead"} / Monitoring</p><h1>Alerts</h1><p>Tranche invoice deadlines, weekly employee attendance, and delayed delivery targets.</p></div></header><div className="lead-summary"><span><strong>{alerts.length}</strong>Total alerts</span><span><strong>{alerts.filter((alert) => ["Overdue", "Deadline missed"].includes(alert.severity)).length}</strong>Missed deadlines</span><span><strong>{alerts.filter((alert) => alert.category === "Performance").length}</strong>Employee follow-ups</span></div><div className="lead-toolbar"><label>Alert type <select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All alerts</option><option value="Delay">Delays</option><option value="Invoice">Tranche invoices</option><option value="Delivery">Enrollment / Training / Placement</option><option>Performance</option></select></label></div><details className="lead-notice"><summary>Alert rules and thresholds</summary><p>Tranche invoices warn within the financial plan’s warning window (default 7 days) and turn red after the relevant handoff deadline. Once the Project Lead raises an invoice, the Vertical Head’s Finance deadline is tracked. Completed handoffs clear their pending flags. Weekly employee attendance below 70% is flagged for the last completed Monday–Sunday week, using recorded working days only. Enrollment, training and placement warn when achieved learner counts remain below the configured target after its deadline. Missing schedules or attendance are not treated as failures.</p></details>{storageUnavailable && <p className="lead-error" role="alert">Local visit and audit records could not be read. Project and batch alerts are still available.</p>}<div className="lead-records">{visible.map((alert) => <article className="lead-record" key={alert.id}><div className="lead-record-heading"><div><p className="lead-eyebrow">{alert.category} · {centers.find((center) => center.id === alert.centerId)?.name || "Project-wide"}</p><h2>{alert.title}</h2></div><span className={`lead-status ${["Overdue", "Deadline missed"].includes(alert.severity) ? "monitoring-overdue" : "monitoring-warning"}`}>{alert.severity}</span></div><p className="lead-notes">{alert.detail}</p>{alert.date && <p className="lead-notice">Scheduled date: {alert.date}</p>}</article>)}</div>{!visible.length && <div className="lead-empty"><Bell size={28} /><h2>No exceptions flagged</h2><p>No delayed work or below-threshold employee performance is recorded for this selection.</p></div>}</section>;
}
