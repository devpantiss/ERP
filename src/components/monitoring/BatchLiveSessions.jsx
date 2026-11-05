import { Component, lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, FlaskConical, Radio, Search, Video, VideoOff } from "lucide-react";
import DemoLiveSession from "./DemoLiveSession";
import { mockDb } from "../../mock-db";
import { applyRoleScope } from "../../services/mockApiClient";
import { useAuthStore } from "../../stores/authStore";
import { activeSession, readLiveSessions } from "./monitoringData";
import "../../pages/ProjectLead/ProjectLead.css";
import "./monitoring.css";
import "./liveSessions.css";
const Viewer = lazy(() => import("../../pages/Trainer/TrainerLiveFeedViewer"));
const Host = lazy(() => import("../../pages/Trainer/TrainerLiveFeedHost"));

function SessionBadge({ live }) {
  return <span className={`session-badge ${live ? "is-live" : ""}`}><span aria-hidden="true" />{live ? "Live" : "Not live"}</span>;
}
class SessionBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <div className="lead-empty" role="alert"><VideoOff size={28} /><h2>Session interface could not load</h2><p>Return to the batch list and try opening this session again.</p><button onClick={this.props.onBack}>Back to batch sessions</button></div> : this.props.children;
  }
}

export default function BatchLiveSessions({ title = "Live Feed", clientProjectIds, host = false }) {
  const session = useAuthStore((state) => state.currentUser);
  const user = session || mockDb.users.byId[host ? "USR-0003" : location.pathname.startsWith("/super-admin") ? "USR-0001" : "USR-0002"];
  const [sessions, setSessions] = useState(readLiveSessions);
  const [selectedId, setSelectedId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [showDemo, setShowDemo] = useState(true);
  const selectedHeading = useRef(null);
  const trigger = useRef(null);
  useEffect(() => {
    const update = () => setSessions(readLiveSessions());
    window.addEventListener("storage", update); window.addEventListener("pantiss-live-update", update);
    const timer = setInterval(update, 5000);
    return () => { window.removeEventListener("storage", update); window.removeEventListener("pantiss-live-update", update); clearInterval(timer); };
  }, []);
  useEffect(() => {
    if (selectedId) selectedHeading.current?.focus();
    else if (trigger.current) document.getElementById(trigger.current)?.focus();
  }, [selectedId]);
  const all = Object.values(mockDb.batches.byId);
  const scoped = clientProjectIds ? all.filter((batch) => clientProjectIds.includes(batch.projectId)) : applyRoleScope("batches", all, user);
  const realBatches = host ? scoped.filter((batch) => batch.trainerEmployeeId === user.employeeId) : scoped;
  const demoBase = realBatches[0];
  const demos = showDemo && demoBase ? [true, false].map((demoLive) => ({ ...demoBase, id: `${demoBase.id}-demo-${demoLive ? "live" : "offline"}`, demo: true, demoLive })) : [];
  const batches = [...realBatches, ...demos];
  const isBatchLive = (batch) => batch.demo ? batch.demoLive : !!activeSession(sessions[batch.id]);
  const selected = batches.find((batch) => batch.id === selectedId);
  const live = selected && isBatchLive(selected);
  const query = search.trim().toLowerCase();
  const visible = batches.filter((batch) => {
    const trainer = mockDb.employees.byId[batch.trainerEmployeeId];
    return (!projectId || batch.projectId === projectId) && (!status || (isBatchLive(batch) ? "live" : "offline") === status) && `${batch.code} ${batch.trade} ${trainer?.firstName || ""} ${trainer?.lastName || ""} ${mockDb.centers.byId[batch.centerId]?.name || ""}`.toLowerCase().includes(query);
  }).sort((a, b) => Number(isBatchLive(b)) - Number(isBatchLive(a)) || Number(!!a.demo) - Number(!!b.demo));
  const realLiveCount = realBatches.filter(isBatchLive).length;
  const resetFilters = () => { setProjectId(""); setStatus(""); setSearch(""); };
  const back = () => setSelectedId("");

  return <section className="lead-workspace live-sessions">
    <header className="lead-header sessions-header"><div><p className="lead-eyebrow">Training operations / Live sessions</p><h1>{title}</h1><p>{host ? "Your batches. One workspace for every broadcast." : "A clear view of training, batch by batch."}</p></div><div className="sessions-sync"><span className="session-sync-dot" aria-hidden="true" />Status refreshes automatically<small>Every 5 seconds · This browser</small></div></header>
    {selected ? <>
      <button className="monitoring-back sessions-back" onClick={back}><ArrowLeft size={16} />All batch sessions</button>
      <div className="sessions-selected-heading"><div><p className="lead-eyebrow">{mockDb.centers.byId[selected.centerId]?.name}</p><h2 ref={selectedHeading} tabIndex={-1}>{selected.trade || "Training session"}</h2><p>{selected.code} · {mockDb.projects.byId[selected.projectId]?.name}</p></div><div className="sessions-badges">{selected.demo && <span className="session-demo-label"><FlaskConical size={13} />Demo preview</span>}<SessionBadge live={live} /></div></div>
      <SessionBoundary key={selected.id} onBack={back}><Suspense fallback={<div className="session-loading" role="status"><Video size={28} /><h2>Opening session…</h2><p>Preparing your viewing workspace.</p></div>}>
        {selected.demo ? <DemoLiveSession batch={selected} /> : host ? <Host key={selected.id} embedded batch={selected} /> : live ? <Viewer key={sessions[selected.id].sessionId} sessionId={sessions[selected.id].sessionId} /> : <div className="lead-empty session-offline"><VideoOff size={32} /><h2>This classroom is offline</h2><p>The trainer hasn’t started a broadcast. This screen updates when the session goes live.</p><button onClick={back}><ArrowLeft size={15} />Browse other batches</button></div>}
      </Suspense></SessionBoundary>
    </> : <>
      <div className="sessions-overview" aria-label="Real batch session totals">{[[Video, "Assigned batches", realBatches.length], [Radio, "Live now", realLiveCount], [VideoOff, "Not live", realBatches.length - realLiveCount]].map(([Icon, label, count]) => <div className={label === "Live now" ? "sessions-overview-live" : ""} key={label}><Icon size={18} aria-hidden="true" /><span>{label}</span><strong>{count}</strong></div>)}</div>
      <div className="sessions-directory">
        <div className="sessions-directory-heading"><div><h2>Batch sessions</h2><p>Open a classroom or explore a demo preview.</p></div><label className="sessions-demo-toggle"><input type="checkbox" checked={showDemo} onChange={(event) => setShowDemo(event.target.checked)} /><FlaskConical size={15} aria-hidden="true" />Show demos</label></div>
        <div className="sessions-filters"><label className="sessions-search"><Search size={17} aria-hidden="true" /><input aria-label="Search batch sessions" placeholder="Search batch, trade or trainer…" value={search} onChange={(event) => setSearch(event.target.value)} /></label><label className="sessions-project"><span className="sr-only">Filter by project</span><select value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">All assigned projects</option>{[...new Set(realBatches.map((batch) => batch.projectId))].map((id) => <option key={id} value={id}>{mockDb.projects.byId[id]?.name}</option>)}</select></label></div>
        <div className="sessions-list-toolbar"><div className="sessions-status-filter" role="group" aria-label="Session status">{[["", "All sessions"], ["live", "Live"], ["offline", "Not live"]].map(([value, label]) => <button key={value} aria-pressed={status === value} onClick={() => setStatus(value)}>{label}</button>)}</div><span role="status">{visible.length} {visible.length === 1 ? "session" : "sessions"}{showDemo && demos.length ? " · Includes demos" : ""}</span></div>
        <p className="sessions-scroll-hint">Scroll the table horizontally for status and session actions →</p>
        <div className="monitoring-table sessions-table" tabIndex={0} role="region" aria-label="Batch session list"><table><caption className="sr-only">Batch-wise live sessions</caption><thead><tr>{["Batch / Trade", "Project / Center", "Trainer", "Status", ""].map((text, index) => <th key={index} scope="col">{text || <span className="sr-only">Open session</span>}</th>)}</tr></thead><tbody>{visible.map((batch) => {
          const trainer = mockDb.employees.byId[batch.trainerEmployeeId];
          const isLive = isBatchLive(batch);
          const action = batch.demo ? "Preview layout" : host ? "Open broadcast" : isLive ? "Watch live" : "View session";
          return <tr key={batch.id} className={batch.demo ? "sessions-demo-row" : ""}><td><div className="sessions-batch-cell"><span className={`sessions-batch-icon ${isLive ? "is-live" : ""}`}>{isLive ? <Radio size={18} /> : <VideoOff size={18} />}</span><div><strong>{batch.code}</strong><small>{batch.trade || "Trade not assigned"}</small>{batch.demo && <span className="session-demo-label">Demo preview</span>}</div></div></td><td>{mockDb.projects.byId[batch.projectId]?.name || "Project unavailable"}<small>{mockDb.centers.byId[batch.centerId]?.name || "Center unavailable"}</small></td><td><div className="sessions-trainer-cell"><span aria-hidden="true">{trainer ? `${trainer.firstName[0]}${trainer.lastName[0]}` : "—"}</span>{trainer ? `${trainer.firstName} ${trainer.lastName}` : "Unassigned"}</div></td><td><SessionBadge live={isLive} /></td><td><button id={`open-${batch.id}`} className={isLive && !batch.demo ? "lead-primary" : "sessions-open"} onClick={() => { trigger.current = `open-${batch.id}`; setSelectedId(batch.id); }} aria-label={`${action} for ${batch.code}${batch.demo ? isLive ? " live demo" : " offline demo" : ""}`}>{action}<ArrowUpRight size={15} aria-hidden="true" /></button></td></tr>;
        })}</tbody></table></div>
        {!visible.length && <div className="sessions-empty"><Search size={28} /><h3>{realBatches.length ? "No sessions match your filters" : "No batches assigned yet"}</h3><p>{realBatches.length ? "Try a different batch, trainer or project." : "Your assigned batch sessions will appear here. Contact your project administrator to check assignments."}</p>{realBatches.length > 0 && <button onClick={resetFilters}>Clear filters</button>}</div>}
        <footer className="sessions-directory-footer"><span><span className="session-sync-dot" aria-hidden="true" />Live status is available for broadcasts in this browser.</span>{showDemo && demos.length > 0 && <span><FlaskConical size={13} />Demo sessions use sample content.</span>}</footer>
      </div>
    </>}
  </section>;
}
