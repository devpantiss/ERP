import { useMemo, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { mockDb, getRoleScopes } from "../../mock-db";
import { useAuthStore } from "../../stores/authStore";
import { useEmployeeStore } from "../../stores/employeeStore";
import { applyRoleScope } from "../../services/mockApiClient";
import { useProjectExecutionStore } from "../project-finance/projectExecutionStore";
import { indiaToday, money } from "../project-finance/projectFinanceModel";
import { useEmployeeTargetStore } from "./employeeTargetStore";
import { buildEmployeeMonthReport, employeeDataMonths, monthLabel, recentMonths, shiftMonth, validMonth } from "./employeeReportModel";
import "../../pages/ProjectLead/ProjectLead.css";
import "../../components/monitoring/monitoring.css";
import "./employeePerformance.css";

const displayStatus = (status) => status?.replaceAll("_", " ").toLowerCase() || "Not recorded";
const rate = (value) => value === null ? "Not recorded" : `${value.toFixed(1)}%`;
const TABS = [{ id: "overview", label: "Performance" }, { id: "attendance", label: "Attendance" }, { id: "work", label: "Work log" }, { id: "hr", label: "HR records" }];

function ReportTable({ caption, headers, rows, empty }) {
  return <div className="monitoring-table"><table><caption className="sr-only">{caption}</caption><thead><tr>{headers.map((header) => <th key={header} scope="col">{header}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row, index) => <tr key={index}>{row.map((value, cell) => <td key={cell}>{value ?? "—"}</td>)}</tr>) : <tr><td colSpan={headers.length}>{empty || "No records for this month."}</td></tr>}</tbody></table></div>;
}

export default function EmployeeMonthlyReport() {
  const { employeeId } = useParams();
  const location = useLocation();
  const [query, setQuery] = useSearchParams();
  const vertical = location.pathname.startsWith("/super-admin");
  const session = useAuthStore((state) => state.currentUser);
  const employeeRecords = useEmployeeStore((state) => state.records);
  const user = session || mockDb.users.byId[vertical ? "USR-0001" : "USR-0002"];
  const targets = useEmployeeTargetStore((state) => state.targets);
  const invoices = useProjectExecutionStore((state) => state.invoices);
  const [tab, setTab] = useState("overview");
  const [revision, refresh] = useState(0);
  const raw = employeeRecords.find((employee) => employee.id === employeeId) || mockDb.employees.byId[employeeId];
  const allowedRole = getRoleScopes(user, mockDb).roleCodes.some((role) => ["SUPER_ADMIN", "PROJECT_HEAD"].includes(role));
  const employee = allowedRole && raw && applyRoleScope("employees", [raw], user)[0];
  const allowedProjects = applyRoleScope("projects", Object.values(mockDb.projects.byId), user).filter((project) => employee?.projectIds?.includes(project.id));
  const selectedProjectId = query.get("projectId") || "";
  const projectIds = allowedProjects.filter((project) => !selectedProjectId || project.id === selectedProjectId).map((project) => project.id);
  const today = indiaToday(), currentMonth = today.slice(0, 7);
  const operationsState = useMemo(() => {
    void revision;
    const records = [];
    let unavailable = false;
    try { for (const key of Object.keys(localStorage)) if (/^pantiss:project-lead:.*:(visits|reports|audits)$/.test(key)) { const value = JSON.parse(localStorage.getItem(key) || "[]"); if (Array.isArray(value)) records.push(...value.map((record) => ({ ...record, kind: key.split(":").at(-1) }))); } } catch { unavailable = true; }
    return { records, unavailable };
  }, [revision]);
  const options = { targets, invoices, operations: operationsState.records, today };
  const monthsWithData = employee ? employeeDataMonths(mockDb, employee, projectIds, options).filter((month) => month <= currentMonth) : [];
  const requestedMonth = query.get("month");
  const selectedMonth = validMonth(requestedMonth) && requestedMonth <= currentMonth ? requestedMonth : monthsWithData[0] || currentMonth;
  const report = employee && projectIds.length ? buildEmployeeMonthReport(mockDb, employee, selectedMonth, projectIds, options) : null;
  const setMonth = (month) => { if (!validMonth(month) || month > currentMonth) return; const next = new URLSearchParams(query); next.set("month", month); setQuery(next); };
  const setProject = (id) => { const next = new URLSearchParams(query); if (id) next.set("projectId", id); else next.delete("projectId"); setQuery(next); };
  const base = vertical ? "/super-admin" : "/project-head";
  const from = location.state?.from;
  const back = typeof from === "string" && (from.startsWith(`${base}/`) || (!vertical && from.startsWith("/admin/"))) ? from : vertical ? "/super-admin/access-target" : "/admin/employee-list";
  if (!employee || !report) return <section className="lead-workspace"><Link to={back} className="employee-back"><ArrowLeft size={16} />Back to employees</Link><div className="lead-empty"><h1>Employee report unavailable</h1><p>The employee or selected project is outside your assigned scope, or the record is unavailable.</p></div></section>;
  const activeTargets = report.targets.filter((target) => target.target > 0);
  const name = `${employee.firstName} ${employee.lastName}`;
  const history = recentMonths(selectedMonth).filter((month) => !employee.joinedOn || month >= employee.joinedOn.slice(0, 7)).map((month) => buildEmployeeMonthReport(mockDb, employee, month, projectIds, options));
  const roleCodes = employee.roleIds.map((id) => mockDb.roles.byId[id]?.code);
  const metricLabels = roleCodes.includes("CENTER_INCHARGE") ? ["Center Attendance (%)", "Completed Batches"] : roleCodes.includes("TRAINER") ? ["Training Hours", "Exposure Visits"] : roleCodes.includes("MOBILIZER") ? ["Enrolled", "Community Drives"] : roleCodes.includes("PLACEMENT_OFFICER") ? ["Placed Candidates", "Placement Drives Conducted"] : [];
  const manager = mockDb.employees.byId[employee.managerEmployeeId];
  const centerNames = employee.centerIds.map((id) => mockDb.centers.byId[id]).filter((center) => center && projectIds.includes(center.projectId)).map((center) => center.name);
  const navigateTab = (event, index) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault(); const next = event.key === "Home" ? 0 : event.key === "End" ? TABS.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length;
    setTab(TABS[next].id); document.getElementById(`employee-tab-${TABS[next].id}`)?.focus();
  };
  return <section className="lead-workspace employee-month-report">
    <Link to={back} className="employee-back"><ArrowLeft size={16} />Back to employees</Link>
    <header className="lead-header"><div><p className="lead-eyebrow">Employee performance / Monthly report</p><h1>{name}</h1><p>{employee.designation} · {employee.employeeCode || employee.id}</p></div><span className={`lead-status ${report.warnings.length ? "monitoring-warning" : ""}`}>{report.status}</span></header>
    <div className="employee-identity"><div><span>Projects</span><p>{allowedProjects.filter((project) => projectIds.includes(project.id)).map((project) => project.name).join(", ")}</p></div><div><span>Centers</span><p>{centerNames.join(", ") || "Unassigned"}</p></div><div><span>Reporting head</span><p>{manager ? `${manager.firstName} ${manager.lastName}` : "Unassigned"}</p></div><div><span>Contact</span><p>{employee.email || "Not provided"}</p><p>{employee.phone || ""}</p></div></div>
    <div className="lead-toolbar employee-month-toolbar"><div className="employee-month-picker"><button onClick={() => setMonth(shiftMonth(selectedMonth, -1))} disabled={!!employee.joinedOn && shiftMonth(selectedMonth, -1) < employee.joinedOn.slice(0, 7)} aria-label="Previous month"><ChevronLeft size={16} /></button><label>Report month<input type="month" aria-label="Report month" value={selectedMonth} max={currentMonth} min={employee.joinedOn?.slice(0, 7)} onChange={(event) => setMonth(event.target.value)} /></label><button onClick={() => setMonth(shiftMonth(selectedMonth, 1))} disabled={selectedMonth >= currentMonth} aria-label="Next month"><ChevronRight size={16} /></button></div>{allowedProjects.length > 1 && <label>Project<select value={selectedProjectId} onChange={(event) => setProject(event.target.value)}><option value="">All assigned projects</option>{allowedProjects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>}<button onClick={() => refresh((value) => value + 1)}><RefreshCw size={15} />Refresh</button></div>
    <p className="lead-notice">{monthLabel(selectedMonth)}{!requestedMonth && monthsWithData[0] ? " · Latest month with recorded data" : ""}. Attendance percentages use marked working days; missing marks are not counted as absences. No performance score is generated from missing data.</p>
    {operationsState.unavailable && <p className="lead-error" role="alert">Some locally saved work records could not be read. Available central records are shown; use Refresh after correcting the saved data.</p>}
    {report.warnings.length > 0 && <div className="employee-warning" role="status"><strong>Needs attention</strong><ul>{report.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div>}
    <div className="employee-kpis">{[["Attendance", rate(report.attendanceRate), `${report.present} present / ${report.recordedDays} recorded working ${report.recordedDays === 1 ? "day" : "days"}`], ["Completed work", report.completedWork, `${report.events.length} dated work records`], ["Target completion", rate(report.targetRate), activeTargets.length ? `${activeTargets.filter((target) => target.achievement !== null && target.achievement >= 100).length} of ${activeTargets.length} targets achieved` : "No targets assigned"], ["Approved leave", report.leaveDays, "Calendar days within this month"]].map(([label, value, detail]) => <div key={label}><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>)}</div>
    <div className="employee-tabs" role="tablist" aria-label="Performance report sections">{TABS.map((item, index) => <button id={`employee-tab-${item.id}`} key={item.id} role="tab" aria-selected={tab === item.id} aria-controls={tab === item.id ? `employee-panel-${item.id}` : undefined} tabIndex={tab === item.id ? 0 : -1} onKeyDown={(event) => navigateTab(event, index)} onClick={() => setTab(item.id)}>{item.label}</button>)}</div>
    <div role="tabpanel" id={`employee-panel-${tab}`} aria-labelledby={`employee-tab-${tab}`} tabIndex={0}>
      {tab === "overview" && <div className="employee-report-sections"><section><h2>Monthly targets & outcomes</h2>{metricLabels.length > 0 && <div className="employee-role-metrics">{metricLabels.map((label) => <div key={label}><span>{label}</span><strong>{report.metrics[label] ?? "Not recorded"}</strong></div>)}</div>}<ReportTable caption="Monthly target achievement" headers={["Target", "Assigned", "Achieved", "Completion"]} rows={report.targets.map((target) => [<span key={`${target.projectId}-${target.label}`}>{target.label}{projectIds.length > 1 && <small>{mockDb.projects.byId[target.projectId]?.name || "Employee-wide"}</small>}</span>, target.target, target.actual ?? "Not recorded", target.target > 0 ? rate(target.achievement) : "Not assigned"])} empty="No monthly targets have been assigned for this employee." /><p className="lead-notice">Outcomes count completed records. Training hours require recorded session hours. Placed candidates count confirmed placements in completed drives. Scheduled or approved events remain visible in the work log.</p></section><section><h2>Recorded performance reviews</h2>{report.reviews.length ? report.reviews.map((review, index) => <article className="employee-review" key={index}><p>{review.date} · {typeof review.score === "number" ? `${review.score}/100` : "No numeric score"}</p><p>{review.notes || "No review notes recorded."}</p></article>) : <p className="lead-notice">No performance review recorded for this month.</p>}</section><section><h2>Month-wise history</h2><p className="lead-notice">The 12 months through {monthLabel(selectedMonth)}. Select a month to open its report.</p><ReportTable caption="Month-wise employee performance" headers={["Month", "Attendance", "Completed work", "Target completion", "Status"]} rows={history.map((month) => [<button key={month.month} onClick={() => setMonth(month.month)}>{monthLabel(month.month)}</button>, rate(month.attendanceRate), month.completedWork, rate(month.targetRate), month.status])} /></section></div>}
      {tab === "attendance" && <div className="employee-report-sections"><section><h2>Daily attendance</h2><p className="lead-notice">{report.present} days present (including {report.late} late) · {report.absent} absent · {report.recordedDays} marked working days</p><ReportTable caption="Daily employee attendance" headers={["Date", "Status", "Punch in", "Punch out", "Project"]} rows={report.attendance.map((record) => [record.date, displayStatus(record.status), record.punchIn?.time || "Not recorded", record.punchOut?.time || "Not recorded", mockDb.projects.byId[record.projectId]?.name])} empty="No daily attendance records for this month." /></section><section><h2>Weekly attendance</h2><p className="lead-notice">Complete Monday–Sunday weeks are shown. Boundary weeks can include dates from an adjacent month. Completed weeks below 70% are flagged using recorded working days.</p><ReportTable caption="Weekly employee attendance" headers={["Week", "Recorded days", "Attendance", "Status"]} rows={report.weeks.map((week) => [`${week.start} — ${week.end}`, week.days, rate(week.rate), week.rate === null ? "No records" : week.warning ? "Warning · below 70%" : week.complete ? "Recorded" : "In progress"])} /></section></div>}
      {tab === "work" && <div className="employee-report-sections"><section><h2>Work log · {monthLabel(selectedMonth)}</h2><ReportTable caption="Monthly employee work log" headers={["Date", "Activity", "Project / Center", "Status"]} rows={report.events.map((event) => [event.date.slice(0, 10), event.title, <span key={event.id}>{mockDb.projects.byId[event.projectId]?.name}<small>{mockDb.centers.byId[event.centerId]?.name || "Project-wide"}</small></span>, displayStatus(event.status)])} empty="No dated work records attributed to this employee for this month." /></section></div>}
      {tab === "hr" && <div className="employee-report-sections"><section><h2>Leave requests</h2><ReportTable caption="Employee leave requests" headers={["From", "To", "Reason", "Status"]} rows={report.leaves.map((leave) => [leave.fromDate, leave.toDate, leave.reason, displayStatus(leave.status)])} /></section><section><h2>Salary records</h2><ReportTable caption="Monthly salary records" headers={["Month", "Gross salary", "Payroll attendance days", "Status"]} rows={report.salaries.map((salary) => [monthLabel(salary.month), money(salary.grossAmount), salary.attendanceDays, displayStatus(salary.status)])} /></section><section><h2>Reimbursement submissions</h2><ReportTable caption="Monthly reimbursement submissions" headers={["Submitted", "Claim", "Amount", "Status"]} rows={report.reimbursements.map((claim) => [(claim.submittedOn || claim.createdAt)?.slice(0, 10), claim.claimTitle, money(claim.totalAmount ?? claim.amount), displayStatus(claim.status)])} /></section></div>}
    </div>
  </section>;
}
