import { lazy, Suspense, useEffect, useState } from "react";
import { ArrowLeft, Radio, VideoOff } from "lucide-react";
import { mockDb } from "../../mock-db";
import { applyRoleScope } from "../../services/mockApiClient";
import { useAuthStore } from "../../stores/authStore";
import { activeSession, readLiveSessions } from "./monitoringData";
import "../../pages/ProjectLead/ProjectLead.css";
import "./monitoring.css";
const Viewer = lazy(() => import("../../pages/Trainer/TrainerLiveFeedViewer"));
const Host = lazy(() => import("../../pages/Trainer/TrainerLiveFeedHost"));

export default function BatchLiveSessions({ title = "Live Feed", clientProjectIds, host = false }) {
  const session = useAuthStore((state) => state.currentUser);
  const user = session || mockDb.users.byId[host ? "USR-0003" : location.pathname.startsWith("/super-admin") ? "USR-0001" : "USR-0002"];
  const [sessions, setSessions] = useState(readLiveSessions);
  const [selectedId, setSelectedId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [status, setStatus] = useState("");
  useEffect(() => {
    const update = () => setSessions(readLiveSessions());
    window.addEventListener("storage", update); window.addEventListener("pantiss-live-update", update);
    const timer = setInterval(update, 5000);
    return () => { window.removeEventListener("storage", update); window.removeEventListener("pantiss-live-update", update); clearInterval(timer); };
  }, []);
  const all = Object.values(mockDb.batches.byId);
  const scoped = clientProjectIds ? all.filter((batch) => clientProjectIds.includes(batch.projectId)) : applyRoleScope("batches", all, user);
  const batches = host ? scoped.filter((batch) => batch.trainerEmployeeId === user.employeeId) : scoped;
  const selected = batches.find((batch) => batch.id === selectedId);
  const live = selected && activeSession(sessions[selected.id]);
  const visible = batches.filter((batch) => (!projectId || batch.projectId === projectId) && (!status || (activeSession(sessions[batch.id]) ? "live" : "offline") === status));
  return <section className="lead-workspace"><header className="lead-header"><div><p className="lead-eyebrow">Training / Batch Sessions</p><h1>{title}</h1><p>{host ? "Choose a batch to open its broadcasting workspace." : "Select a batch to open its live viewing interface."}</p></div><span className="lead-status"><Radio size={14} /> {batches.filter((batch) => activeSession(sessions[batch.id])).length} Live</span></header>{selected ? <><button className="monitoring-back" onClick={() => setSelectedId("")}><ArrowLeft size={16} />Back to batch sessions</button><div className="lead-record-heading"><h2>{selected.code} · {selected.trade}</h2><span className={`lead-status ${live ? "monitoring-live" : ""}`}>{live ? "Live" : "Not live"}</span></div><Suspense fallback={<p role="status">Loading session interface…</p>}>{host ? <Host key={selected.id} embedded batch={selected} /> : live ? <Viewer key={sessions[selected.id].sessionId} sessionId={sessions[selected.id].sessionId} /> : <div className="lead-empty"><VideoOff size={32} /><h2>This batch is not live</h2><p>The viewing interface will become available here when the trainer starts a broadcast.</p></div>}</Suspense></> : <><div className="lead-toolbar"><label>Project <select value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">All assigned projects</option>{[...new Set(batches.map((batch) => batch.projectId))].map((id) => <option key={id} value={id}>{mockDb.projects.byId[id]?.name}</option>)}</select></label><label>Session status <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All sessions</option><option value="live">Live</option><option value="offline">Not live</option></select></label></div><p className="lead-notice">Live status updates automatically for broadcasts available in this browser.</p><div className="monitoring-table"><table><caption className="sr-only">Batch-wise live sessions</caption><thead><tr>{["Batch / Trade", "Project / Center", "Trainer", "Status", "Session"].map((text) => <th key={text} scope="col">{text}</th>)}</tr></thead><tbody>{visible.map((batch) => { const trainer = mockDb.employees.byId[batch.trainerEmployeeId]; const isLive = activeSession(sessions[batch.id]);return <tr key={batch.id}><td><strong>{batch.code}</strong><small>{batch.trade}</small></td><td>{mockDb.projects.byId[batch.projectId]?.name}<small>{mockDb.centers.byId[batch.centerId]?.name}</small></td><td>{trainer ? `${trainer.firstName} ${trainer.lastName}` : "Unassigned"}</td><td><span className={`lead-status ${isLive ? "monitoring-live" : ""}`}><span className="monitoring-dot" />{isLive ? "Live" : "Not live"}</span></td><td><button onClick={() => setSelectedId(batch.id)} aria-label={`${host ? "Open broadcast" : "View session"} for ${batch.code}`}>{host ? "Open broadcast" : "View session"}</button></td></tr>; })}</tbody></table></div>{!visible.length && <div className="lead-empty"><h2>No matching batch sessions</h2><p>Adjust filters or ask your administrator to check batch assignments.</p></div>}</>}</section>;
}
