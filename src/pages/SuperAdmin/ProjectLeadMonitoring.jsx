import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays, FileText, RefreshCw, Search, ShieldCheck, Users, ReceiptText } from "lucide-react";
import { mockDb, getRoleScopes } from "../../mock-db";
import { useAuthStore } from "../../stores/authStore";
import { applyRoleScope } from "../../services/mockApiClient";
import SlidePanel from "../../components/common/SlidePanel";
import { useProjectExecutionStore } from "../../features/project-finance/projectExecutionStore";
import { money } from "../../features/project-finance/projectFinanceModel";
import { WORKFLOWS } from "../ProjectLead/projectLeadConfig";
import { readProjectLeadMonitoring } from "../ProjectLead/projectLeadMonitoringModel";
import "../ProjectLead/ProjectLead.css";
import "../../components/monitoring/monitoring.css";
import "./projectLeadMonitoring.css";

const TABS = [['visits','Client visits',CalendarDays],['reports','Reports',FileText],['audits','QC audits',ShieldCheck],['teams','Center teams',Users],['invoices','Tranche invoices',ReceiptText]];
const LANES = { incharge:'Center Incharge', trainers:'Trainers', mobilizers:'Mobilizers', placement:'Placement Officers' };
const name = (person) => person ? `${person.firstName} ${person.lastName}` : 'Not recorded';
const date = (value) => value && Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kolkata'}).format(new Date(value.length === 10 ? `${value}T00:00:00+05:30` : value)) : 'Not recorded';
const downloadable = (attachment) => attachment?.url && /^data:(application\/|image\/|text\/)/i.test(attachment.url);

export default function ProjectLeadMonitoring() {
  const session = useAuthStore((state) => state.currentUser);
  const user = session || mockDb.users.byId['USR-0001'];
  const catalog = useProjectExecutionStore((state) => state.catalog);
  const invoices = useProjectExecutionStore((state) => state.invoices);
  void catalog;
  const [tick, refresh] = useState(0);
  const [tab,setTab] = useState('visits');
  const [projectId,setProjectId] = useState('');
  const [ownerId,setOwnerId] = useState('');
  const [search,setSearch] = useState('');
  const [selected,setSelected] = useState(null);
  const detailRef = useRef(null);
  useEffect(() => {
    if (!selected) return;
    const trigger = document.activeElement;
    detailRef.current?.focus();
    return () => { if (trigger?.isConnected) trigger.focus(); };
  },[selected]);
  const containDetailFocus = (event) => {
    if (event.key !== 'Tab') return;
    const controls = [...detailRef.current.querySelectorAll('button,a[href]')];
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && (document.activeElement === first || document.activeElement === detailRef.current)) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  useEffect(() => {
    const update = () => refresh((value) => value + 1);
    window.addEventListener('storage',update); window.addEventListener('pantiss-project-lead-update',update); window.addEventListener('focus',update);
    const timer = setInterval(update,15000);
    return () => { clearInterval(timer); window.removeEventListener('storage',update); window.removeEventListener('pantiss-project-lead-update',update); window.removeEventListener('focus',update); };
  },[]);
  void tick;
  const authorized = getRoleScopes(user,mockDb).roleCodes.includes('SUPER_ADMIN');
  const projects = authorized ? applyRoleScope('projects',Object.values(mockDb.projects.byId),user) : [];
  const centers = authorized ? applyRoleScope('centers',Object.values(mockDb.centers.byId),user) : [];
  const leads = Object.values(mockDb.users.byId).filter((person) => getRoleScopes(person,mockDb).roleCodes.includes('PROJECT_HEAD')).map((person) => {
    const employee = mockDb.employees.byId[person.employeeId];
    return { userId:person.id, employeeId:person.employeeId, name:name(employee), projectIds:employee?.projectIds || [] };
  }).filter((lead) => lead.projectIds.some((id) => projects.some((project) => project.id === id)));
  const data = authorized ? readProjectLeadMonitoring({storage:localStorage,projects,centers,leads}) : {records:[],teams:[],errors:[]};
  const finance = Object.values(invoices).filter((invoice) => invoice.leadRaisedAt && projects.some((project) => project.id === invoice.projectId)).map((invoice) => ({ ...invoice, id:`${invoice.projectId}:${invoice.trancheId}`, kind:'invoices', ownerId:invoice.leadRaisedBy, title:invoice.leadReference, status:invoice.financeSubmittedAt ? 'Submitted to Finance' : 'Awaiting Vertical Head', updatedAt:invoice.financeSubmittedAt || invoice.leadRaisedAt }));
  const rows = [...data.records,...data.teams,...finance].filter((row) => (!projectId || row.projectId === projectId) && (!ownerId || row.ownerId === ownerId));
  const projectName = (id) => projects.find((project) => project.id === id)?.name || 'Not recorded';
  const centerName = (id) => centers.find((center) => center.id === id)?.name || 'Project-wide';
  const leadName = (id) => id === 'demo-project-lead' ? 'Demo Project Lead' : leads.find((lead) => lead.userId === id)?.name || 'Not recorded';
  const visible = rows.filter((row) => row.kind === tab && `${row.title || ''} ${projectName(row.projectId)} ${centerName(row.centerId)} ${leadName(row.ownerId)} ${row.status || ''}`.toLowerCase().includes(search.trim().toLowerCase()));
  if (!authorized) return <section className="lead-workspace lead-empty"><h1>Monitoring unavailable</h1><p>This workspace is available to the Vertical Head for their assigned vertical.</p></section>;
  return <section className="lead-workspace lead-monitoring"><header className="lead-header"><div><p className="lead-eyebrow">Vertical Head / Project execution</p><h1>Project Lead Monitoring</h1><p>Review client visits, submitted reports, quality audits and center team plans from your Project Leads.</p></div><button onClick={() => refresh((value) => value + 1)}><RefreshCw size={15} />Refresh records</button></header>
    <p className="lead-notice" role="status">Read-only monitoring · Updates every 15 seconds · Records available in this browser</p>
    {!!data.errors.length && <p className="lead-error" role="alert">Some saved records could not be read. Available records are shown; refresh to retry.</p>}
    <div className="lead-toolbar"><label>Project<select value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">All projects in your vertical</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label><label>Project Lead<select value={ownerId} onChange={(event) => setOwnerId(event.target.value)}><option value="">All Project Leads</option>{leads.map((lead) => <option key={lead.userId} value={lead.userId}>{lead.name}</option>)}</select></label><label className="lead-search"><Search size={16} /><input aria-label="Search Project Lead records" placeholder="Search records, center or lead…" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>
    <div className="lead-monitor-tabs" role="group" aria-label="Project Lead work category">{TABS.map(([key,label,Icon]) => <button key={key} aria-pressed={tab === key} onClick={() => setTab(key)}><Icon size={16} />{label}<span>{rows.filter((row) => row.kind === key).length}</span></button>)}</div>
    <div className="monitoring-table" tabIndex={0} role="region" aria-label="Project Lead records"><table><caption className="sr-only">{TABS.find(([key]) => key === tab)?.[1]} reported by Project Leads</caption><thead><tr>{['Record','Project / Center','Project Lead','Status','Last updated','Details'].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{visible.map((row) => <tr key={row.monitoringId || row.id}><td><strong>{row.kind === 'teams' ? 'Center team plan' : row.title}</strong><small>{row.kind === 'invoices' ? money(row.amount) : row.kind === 'reports' ? `${date(row.periodStart)} – ${date(row.periodEnd)}` : row.kind === 'teams' ? `${Object.values(row.setup).flat().length} planned assignments` : row.date ? date(row.date) : ''}</small></td><td>{projectName(row.projectId)}<small>{centerName(row.centerId)}</small></td><td>{leadName(row.ownerId)}</td><td><span className="lead-status">{row.kind === 'teams' ? 'Saved team plan' : row.status}</span></td><td>{date(row.updatedAt || row.createdAt)}</td><td><button onClick={() => setSelected(row)}>View details<ArrowUpRight size={14} /></button></td></tr>)}</tbody></table></div>
    {!visible.length && <div className="lead-empty"><FileText size={28} /><h2>No {TABS.find(([key]) => key === tab)?.[1].toLowerCase()} to display</h2><p>Saved Project Lead work appears here automatically. Adjust your filters or refresh after a Project Lead saves a record.</p></div>}
    <SlidePanel open={!!selected} onClose={() => setSelected(null)} title={selected?.kind === 'teams' ? 'Center team plan' : selected?.title || 'Record details'} width="2xl">{selected && <div className="lead-monitor-detail" ref={detailRef} role="dialog" aria-modal="true" aria-label="Project Lead record details" tabIndex={-1} onKeyDown={containDetailFocus}><p className="lead-eyebrow">{projectName(selected.projectId)}</p><h2>{centerName(selected.centerId)}</h2><p className="lead-notice">Recorded by {leadName(selected.ownerId)} · Updated {date(selected.updatedAt || selected.createdAt)}</p>
      {selected.kind === 'teams' ? <><p className="lead-notice">Project Lead’s saved planning record. Organization-wide employee assignments are managed separately.</p>{Object.entries(LANES).map(([key,label]) => <section key={key}><h3>{label}</h3><ul>{selected.setup[key].length ? selected.setup[key].map((id) => { const employee = mockDb.employees.byId[id]; const scoped = employee?.projectIds.includes(selected.projectId); return <li key={id}>{scoped ? name(employee) : 'Assignment unavailable'}</li>; }) : <li>No assignment recorded</li>}</ul></section>)}</> : selected.kind === 'invoices' ? <><dl><dt>Project Lead invoice reference</dt><dd>{selected.leadReference}</dd><dt>Amount</dt><dd>{money(selected.amount)}</dd><dt>Raised to Vertical Head</dt><dd>{date(selected.leadRaisedAt)}</dd><dt>Status</dt><dd>{selected.status}</dd></dl>{downloadable(selected.leadAttachment) && <a href={selected.leadAttachment.url} download={selected.leadAttachment.name}>Download lead invoice</a>}<Link to="/super-admin/project-budgets">Review budget & tranche invoice<ArrowUpRight size={14} /></Link></> : <><dl>{WORKFLOWS[selected.kind].fields.map((field) => <div key={field.key}><dt>{field.label}</dt><dd>{field.type === 'date' ? date(selected[field.key]) : selected[field.key] || 'Not recorded'}</dd></div>)}<dt>Status</dt><dd>{selected.status}</dd></dl>{selected.kind === 'audits' && <section><h3>Quality checklist</h3>{Object.entries(selected.checks || {}).map(([key,value]) => <p key={key}>{key} · {value}</p>)}</section>}{downloadable(selected.attachment) ? <a href={selected.attachment.url} download={selected.attachment.name}><FileText size={15} />Download {selected.attachment.name}</a> : <p className="lead-notice">No downloadable document recorded.</p>}</>}
    <button className="lead-monitor-close" onClick={() => setSelected(null)}>Close details</button></div>}</SlidePanel>
  </section>;
}
