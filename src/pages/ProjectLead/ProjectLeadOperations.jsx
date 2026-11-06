import SlidePanel from "../../components/common/SlidePanel";
import { useState } from "react";
import { CalendarDays, FileText, Plus, Search } from "lucide-react";
import { WORKFLOWS, AUDIT_CHECKS } from "./projectLeadConfig";
import { useProjectLeadScope } from "./useProjectLeadScope";
import "./ProjectLead.css";

function readRecords(key) {
  try { const records = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(records) ? records : []; } catch { return []; }
}

export default function ProjectLeadOperations({ kind }) {
  const scope = useProjectLeadScope();
  return <OperationsWorkspace key={`${scope.user.id}:${kind}`} kind={kind} scope={scope} />;
}

function OperationsWorkspace({ kind, scope }) {
  const config = WORKFLOWS[kind];
  const { user, centers } = scope;
  const storageKey = `pantiss:project-lead:${user.id}:${kind}`;
  const [records, setRecords] = useState(() => readRecords(storageKey));
  const [search, setSearch] = useState("");
  const [centerFilter, setCenterFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [draft, setDraft] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const scoped = records.filter((record) => centers.some((center) => center.id === record.centerId));
  const visible = scoped.filter((record) => (!centerFilter || record.centerId === centerFilter) && (!statusFilter || record.status === statusFilter) && `${record.title} ${record.notes || ""} ${record.contact || record.auditor || record.recipient || ""}`.toLowerCase().includes(search.toLowerCase()));
  const centerName = (id) => centers.find((center) => center.id === id)?.name || "Unassigned";
  const open = (record) => {
    setDraft(record || { centerId: centers[0]?.id || "", status: config.statuses[0], checks: {} });
    setFile(null); setError("");
    setFormOpen(true);
  };
  const close = () => { if (!saving) setFormOpen(false); };
  const patch = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const save = async (event) => {
    event.preventDefault(); setError("");
    if (!centers.some((center) => center.id === draft.centerId)) return setError("Choose an assigned center.");
    if (kind === "reports" && draft.periodEnd < draft.periodStart) return setError("The reporting period must end on or after its start date.");
    if (kind === "reports" && !file && !draft.attachment) return setError("Attach the report before submitting.");
    if (kind === "audits" && draft.dueDate && draft.dueDate < draft.date) return setError("The corrective action due date cannot be before the audit date.");
    if (kind === "audits" && AUDIT_CHECKS.some((check) => !draft.checks[check])) return setError("Complete every quality check.");
    if (kind === "audits" && draft.status === "Closed" && Object.values(draft.checks).includes("Needs action")) return setError("Resolve checks marked Needs action before closing this audit.");
    if (file && file.size > 2 * 1024 * 1024) return setError("Choose a file smaller than 2 MB for this local workspace.");
    setSaving(true);
    try {
      let attachment = draft.attachment;
      if (file) attachment = await new Promise((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve({ name: file.name, url: reader.result }); reader.onerror = () => reject(new Error("Could not read the file. Try again.")); reader.readAsDataURL(file);
      });
      const record = { ...draft, ...(draft.id ? {} : { employeeId: user.employeeId, createdAt: new Date().toISOString() }), attachment, id: draft.id || crypto.randomUUID(), projectId: centers.find((center) => center.id === draft.centerId).projectId, updatedAt: new Date().toISOString() };
      const next = [record, ...records.filter((item) => item.id !== record.id)];
      localStorage.setItem(storageKey, JSON.stringify(next)); window.dispatchEvent(new Event("pantiss-project-lead-update")); setRecords(next); setNotice(kind === "reports" ? "Report submission recorded." : "Record saved."); setFormOpen(false);
    } catch { setError("Unable to save. Browser storage may be full; try a smaller attachment."); }
    finally { setSaving(false); }
  };

  return <section className="lead-workspace" aria-label={config.title}>
    <header className="lead-header"><div><p className="lead-eyebrow">Project Lead / Center Operations</p><h1>{config.title}</h1><p>{config.description}</p></div><button className="lead-primary" onClick={() => open()} disabled={!centers.length}><Plus size={17} />{config.action}</button></header>
    <p className="lead-notice" role="status">{notice || "Records and attachments are saved in this browser."}</p>
    <div className="lead-summary"><span><strong>{scoped.length}</strong> {kind === "reports" ? "Submissions" : "Total records"}</span><span><strong>{centers.length}</strong> Assigned centers</span><span><strong>{scoped.filter((record) => record.status === (kind === "visits" ? "Completed" : kind === "audits" ? "Closed" : "Submitted")).length}</strong> {kind === "visits" ? "Completed" : kind === "audits" ? "Closed audits" : "Submitted"}</span></div>
    <div className="lead-toolbar"><label className="lead-search"><Search size={16} /><input aria-label="Search records" placeholder="Search records…" value={search} onChange={(event) => setSearch(event.target.value)} /></label><select aria-label="Filter by center" value={centerFilter} onChange={(event) => setCenterFilter(event.target.value)}><option value="">All assigned centers</option>{centers.map((center) => <option key={center.id} value={center.id}>{center.name}</option>)}</select><select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All statuses</option>{config.statuses.map((status) => <option key={status}>{status}</option>)}</select></div>
    {!centers.length ? <div className="lead-empty"><h2>No centers assigned</h2><p>Contact your Vertical Head to complete your project assignment.</p></div> : !visible.length ? <div className="lead-empty"><FileText size={28} /><h2>{scoped.length ? "No matching records" : config.empty}</h2><p>{scoped.length ? "Adjust your search or filters to see more records." : config.hint}</p><button onClick={() => scoped.length ? (setSearch(""), setCenterFilter(""), setStatusFilter("")) : open()}>{scoped.length ? "Clear filters" : config.action}</button></div> : <div className="lead-records">{visible.map((record) => <article className="lead-record" key={record.id}><div className="lead-record-heading"><div><p className="lead-eyebrow">{centerName(record.centerId)}</p><h2>{record.title}</h2></div><span className="lead-status">{record.status}</span></div><div className="lead-record-meta"><span><CalendarDays size={15} />{record.date || `${record.periodStart} — ${record.periodEnd}`}</span><span>{record.contact || record.auditor || record.recipient}</span>{kind === "audits" && <span>{Object.values(record.checks).filter((value) => value === "Pass").length}/{AUDIT_CHECKS.length} checks passed</span>}</div>{record.purpose && <p>{record.purpose}</p>}<p className="lead-notes">{record.notes}</p><footer>{record.attachment && <a href={record.attachment.url} download={record.attachment.name}><FileText size={15} />{record.attachment.name}</a>}<button onClick={() => open(record)}>{kind === "reports" ? "View / update" : "Update record"}</button></footer></article>)}</div>}
    <SlidePanel open={formOpen} onClose={close} title={draft?.id ? "Update record" : config.action} width="xl"><div className="lead-panel" role="dialog" aria-modal="true" aria-label={draft?.id ? "Update record" : config.action}><form onSubmit={save}>{draft && <><div className="lead-form"><label>Training center<select required value={draft.centerId} onChange={(event) => patch("centerId", event.target.value)}>{centers.map((center) => <option key={center.id} value={center.id}>{center.name}</option>)}</select></label>{config.fields.map((field) => <label key={field.key}>{field.label}{field.required ? " *" : ""}{field.type === "textarea" ? <textarea rows={3} required={field.required} value={draft[field.key] || ""} onChange={(event) => patch(field.key, event.target.value)} /> : <input type={field.type || "text"} required={field.required} value={draft[field.key] || ""} onChange={(event) => patch(field.key, event.target.value)} />}</label>)}{kind === "audits" && <fieldset><legend>Quality checklist *</legend>{AUDIT_CHECKS.map((check) => <label key={check}>{check}<select required value={draft.checks[check] || ""} onChange={(event) => patch("checks", { ...draft.checks, [check]: event.target.value })}><option value="">Select outcome</option><option>Pass</option><option>Needs action</option><option>Not applicable</option></select></label>)}</fieldset>}<label>Status<select value={draft.status} onChange={(event) => patch("status", event.target.value)}>{config.statuses.map((status) => <option key={status}>{status}</option>)}</select></label><label>{kind === "reports" ? "Report document *" : "Supporting document"}<input key={draft.id || "new"} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg" onChange={(event) => setFile(event.target.files?.[0] || null)} /><small>{draft.attachment ? `Current: ${draft.attachment.name}. ` : ""}PDF, Office document, CSV, or image · up to 2 MB</small></label>{error && <p className="lead-error" role="alert">{error}</p>}</div><footer><button type="button" onClick={close} disabled={saving}>Cancel</button><button className="lead-primary" disabled={saving}>{saving ? "Saving…" : kind === "reports" ? "Submit report" : "Save record"}</button></footer></>}</form></div></SlidePanel>
  </section>;
}
