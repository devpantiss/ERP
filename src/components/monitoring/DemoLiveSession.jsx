import { useEffect, useRef, useState } from "react";
import { Minimize2, Maximize2, MonitorPlay, Radio, Users, VideoOff } from "lucide-react";
import { mockDb } from "../../mock-db";

export default function DemoLiveSession({ batch }) {
  const stage = useRef(null);
  const [tab, setTab] = useState("overview");
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const update = () => setExpanded(document.fullscreenElement === stage.current);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);
  const trainer = mockDb.employees.byId[batch.trainerEmployeeId];
  const trainerName = trainer ? `${trainer.firstName} ${trainer.lastName}` : "Demo trainer";
  const live = batch.demoLive;
  return <div className="demo-session">
    <p className="lead-notice">Demo preview · Sample session data and presentation layout. This is not a camera broadcast.</p>
    <div className="demo-session-grid">
      <div className="demo-session-stage" ref={stage}>
        <div className="demo-stage-top"><span className={`lead-status ${live ? "monitoring-live" : ""}`}><span className="monitoring-dot" />{live ? "Live · Demo" : "Not live · Demo"}</span><span>{live ? "24 learners connected" : "Session not started"}</span></div>
        {live ? <div className="demo-classroom"><div className="demo-board"><p className="lead-eyebrow">Practical training · Module 04</p><MonitorPlay size={36} aria-hidden="true" /><h3>{batch.trade || "Workplace skills"}</h3><p>Safety essentials & practical demonstration</p><ol><li>Prepare your workspace</li><li>Review equipment and safety checks</li><li>Complete the guided exercise</li></ol></div><div className="demo-trainer"><span>{trainerName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><strong>{trainerName}</strong><small>Trainer · Presenting</small></div></div> : <div className="demo-offline"><VideoOff size={44} aria-hidden="true" /><h3>Waiting for the trainer</h3><p>The session screen will appear here when broadcasting begins.</p><span className="lead-status">Next session · 10:00 AM IST (sample)</span></div>}
        <footer className="demo-stage-footer"><span><Radio size={16} />{live ? "Training room · Preview" : "Training room · Offline"}</span><button type="button" aria-label={expanded ? "Exit fullscreen preview" : "Expand session preview"} onClick={async () => { try { setError(""); if (document.fullscreenElement) await document.exitFullscreen(); else await stage.current.requestFullscreen(); } catch { setError("Fullscreen is unavailable in this browser. Continue viewing the session below."); } }}>{expanded ? <Minimize2 size={17} /> : <Maximize2 size={17} />}{expanded ? "Exit fullscreen" : "Expand"}</button></footer>
      </div>
      <aside className="demo-session-info" aria-label="Session details"><h3>Session details</h3><dl>{[["Batch", batch.code], ["Project", mockDb.projects.byId[batch.projectId]?.name], ["Center", mockDb.centers.byId[batch.centerId]?.name], ["Trainer", trainerName], ["Attendance", live ? "24 / 30 learners (sample)" : "Not started"]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || "Not assigned"}</dd></div>)}</dl><div className="demo-participants"><Users size={18} /><div><strong>{live ? "24 learners" : "0 learners"}</strong><small>{live ? "Connected to this demo session" : "Waiting for the next session"}</small></div></div></aside>
    </div>
    {error && <p role="status" className="lead-error">{error}</p>}
    <div className="demo-session-tabs" role="group" aria-label="Preview information">{["overview", "resources"].map((item) => <button key={item} aria-pressed={tab === item} onClick={() => setTab(item)}>{item === "overview" ? "Session overview" : "Learning resources"}</button>)}</div>
    <div className="demo-session-notes">{tab === "overview" ? <><h3>Today’s learning objectives</h3><p>Follow the trainer’s demonstration, review safety procedures and complete the practical exercise. This preview illustrates the viewing experience for a batch session.</p></> : <><h3>Sample learning resources</h3><ul><li>Module 04 · Safety checklist</li><li>Practical exercise · Workspace preparation</li><li>Assessment guide · End-of-session review</li></ul><p>Resource names are illustrative; no files are attached to this demo.</p></>}</div>
  </div>;
}
