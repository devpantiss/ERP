import { useState } from "react";
import { Trophy, Search } from "lucide-react";
import { mockDb } from "../../mock-db";
import { useAuthStore } from "../../stores/authStore";
import { useEmployeeStore } from "../../stores/employeeStore";
import { applyRoleScope } from "../../services/mockApiClient";
import { useEmployeeTargetStore } from "../employee-performance/employeeTargetStore";
import { recentMonths, monthLabel, validMonth } from "../employee-performance/employeeReportModel";
import EmployeeReportLink from "../employee-performance/EmployeeReportLink";
import { indiaToday } from "../project-finance/projectFinanceModel";
import { useProjectExecutionStore } from "../project-finance/projectExecutionStore";
import { buildLeaderboard, LEADERBOARD_ROLES } from "./leaderboardModel";
import "../../pages/ProjectLead/ProjectLead.css";
import "../../components/monitoring/monitoring.css";
import "./leaderboard.css";

export default function EmployeeLeaderboard({ level = "vertical", projectId }) {
  const session = useAuthStore((state) => state.currentUser);
  const records = useEmployeeStore((state) => state.records);
  const targets = useEmployeeTargetStore((state) => state.targets);
  const invoices = useProjectExecutionStore((state) => state.invoices);
  const user = session || mockDb.users.byId[level === "vertical" ? "USR-0001" : "USR-0002"];
  const [segment, setSegment] = useState("");
  const [month, setMonth] = useState("");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const today = indiaToday();
  const projects = applyRoleScope("projects", Object.values(mockDb.projects.byId), user).filter((project) => !projectId || project.id === projectId);
  const projectIds = projects.map((project) => project.id);
  const employees = applyRoleScope("employees", records.length ? records : Object.values(mockDb.employees.byId), user);
  const centers = applyRoleScope("centers", Object.values(mockDb.centers.byId), user).filter((center) => projectIds.includes(center.projectId));
  const options = { db: mockDb, employees, projectIds, targets, invoices, today, month };
  const cumulative = buildLeaderboard(options);
  const role = level === "vertical" ? segment : "";
  const allRows = role ? buildLeaderboard({ ...options, role }) : cumulative;
  const groups = level === "project" && segment === "centers" ? centers.map((center) => ({ id: center.id, label: center.name, rows: buildLeaderboard({ ...options, centerId: center.id }) })) : [{ id: "all", label: role ? LEADERBOARD_ROLES.find((item) => item.code === role)?.label : "Cumulative rankings", rows: allRows }];
  const periods = [...new Set([...recentMonths(today.slice(0, 7)), ...(validMonth(month) ? [month] : []), ...targets.filter((target) => validMonth(target.month) && projectIds.includes(target.projectId) && target.month <= today.slice(0, 7)).map((target) => target.month)])].sort().reverse();
  const query = search.trim().toLowerCase();
  return <section className="lead-workspace employee-leaderboard" aria-labelledby={`leaderboard-${level}-heading`}>
    <header className="leaderboard-header"><div><p className="lead-eyebrow">{level === "vertical" ? "Across your vertical" : projects[0]?.name || "Assigned project"}</p><h2 id={`leaderboard-${level}-heading`}><Trophy size={20} aria-hidden="true" />Employee Leaderboard</h2><p>{level === "vertical" ? "Cumulative and role-wise performance across the delivery team." : "Cumulative and center-wise performance for this project’s delivery team."}</p></div><label>Ranking period<select aria-label="Leaderboard ranking period" value={month} onChange={(event) => { setMonth(event.target.value); setShowAll(false); }}><option value="">All recorded months</option>{periods.map((period) => <option key={period} value={period}>{monthLabel(period)}</option>)}</select></label></header>
    <div className="dashboard-panel-scroll" role="region" aria-label="Leaderboard data" tabIndex={0}>
    <div className="leaderboard-controls"><div className="leaderboard-segments" role="group" aria-label="Leaderboard segment"><button aria-pressed={!segment} onClick={() => { setSegment(""); setShowAll(false); }}>Cumulative</button>{level === "vertical" ? LEADERBOARD_ROLES.map((item) => <button key={item.code} aria-pressed={segment === item.code} onClick={() => { setSegment(item.code); setShowAll(false); }}>{item.label}</button>) : <button aria-pressed={segment === "centers"} onClick={() => { setSegment("centers"); setShowAll(false); }}>Center-wise</button>}</div><label className="leaderboard-search"><Search size={15} /><input aria-label="Search leaderboard employees" placeholder="Search employee…" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>
    <p className="lead-notice">{level === "project" && segment === "centers" ? `${new Set(groups.flatMap((group) => group.rows.map((row) => row.id))).size} employees across ${groups.length} centers` : `${allRows.filter((row) => row.rank !== null).length} ranked · ${allRows.filter((row) => row.rank === null).length} awaiting complete target data`}</p>
    <details className="lead-notice"><summary>How rankings are calculated</summary><p>Rank uses the average completion of assigned positive monthly targets, with each target capped at 100%. All those targets must have measured outcomes. Attendance breaks equal scores only when everyone tied on that score has at least 3 recorded working days. Otherwise they share a rank. Equal scores and attendance share a rank. Employees without complete target measurements are unranked. Center-wise rankings use center-specific records and targets; project targets apply only when the employee has one center in that project.</p></details>
    <div className="leaderboard-groups">{groups.map((group) => {
      const matching = group.rows.filter((row) => `${row.name} ${row.role}`.toLowerCase().includes(query));
      const visible = showAll ? matching : matching.slice(0, 10);
      return <section key={group.id} aria-label={group.label}><h3>{group.label}</h3><div className="monitoring-table"><table><caption className="sr-only">{group.label} employee leaderboard</caption><thead><tr>{["Rank", "Employee", "Role / Center", "Target completion", "Attendance", "Data coverage"].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{visible.length ? visible.map((row) => <tr key={row.id}><td>{row.rank === null ? <span className="leaderboard-unranked">Unranked</span> : <span className="leaderboard-rank">#{row.rank}</span>}</td><td><EmployeeReportLink employeeId={row.id} projectId={projectId} month={month}>{row.name}</EmployeeReportLink></td><td>{row.role}<small>{(group.id !== "all" ? centers.filter((center) => center.id === group.id) : centers.filter((center) => row.centerIds.includes(center.id))).map((center) => center.name).join(", ") || "Unassigned"}</small></td><td>{row.score === null ? "Not ranked" : `${row.score.toFixed(1)}%`}</td><td>{row.attendance === null ? "Not recorded" : `${row.attendance.toFixed(1)}%`}<small>{row.recordedDays} recorded {row.recordedDays === 1 ? "day" : "days"}</small></td><td>{row.measuredTargets}/{row.assignedTargets} targets measured<small>{row.rank === null ? row.reason : "Complete target measurements"}</small></td></tr>) : <tr><td colSpan={6}>{query ? "No employees match this search." : "No delivery employees assigned to this segment."}</td></tr>}</tbody></table></div>{matching.length > visible.length && <p className="lead-notice">Showing {visible.length} of {matching.length} employees.</p>}</section>;
    })}</div>
    {groups.some((group) => group.rows.length > 10) && <button className="leaderboard-show-all" onClick={() => setShowAll((value) => !value)}>{showAll ? "Show top 10" : "Show all employees"}</button>}
    </div>
  </section>;
}
