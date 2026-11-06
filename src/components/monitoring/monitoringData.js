import { invoiceDeadlineFlag, previousAttendanceWeek, projectMilestones } from "../../features/project-finance/projectFinanceModel.js";
export const LIVE_SESSION_KEY = "pantiss:live-sessions";
export const SESSION_TTL = 35000;

export function readLiveSessions(storage = globalThis.localStorage) {
  try { const items = JSON.parse(storage.getItem(LIVE_SESSION_KEY) || "{}"); return items && typeof items === "object" && !Array.isArray(items) ? items : {}; } catch { return {}; }
}
export function registerLiveSession(batchId, sessionId, storage = globalThis.localStorage, now = Date.now()) {
  const sessions = readLiveSessions(storage);
  sessions[batchId] = { batchId, sessionId, updatedAt: now };
  storage.setItem(LIVE_SESSION_KEY, JSON.stringify(sessions));
  globalThis.window?.dispatchEvent(new Event("pantiss-live-update"));
}
export function removeLiveSession(batchId, sessionId, storage = globalThis.localStorage) {
  const sessions = readLiveSessions(storage);
  if (sessions[batchId]?.sessionId !== sessionId) return;
  delete sessions[batchId]; storage.setItem(LIVE_SESSION_KEY, JSON.stringify(sessions));
  globalThis.window?.dispatchEvent(new Event("pantiss-live-update"));
}
export function activeSession(session, now = Date.now()) {
  return !!session?.sessionId && Number.isFinite(session.updatedAt) && now - session.updatedAt >= 0 && now - session.updatedAt < SESSION_TTL;
}

const dateKey = (date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
export function buildOperationalAlerts({ projects, batches, employees, attendance, records = [], plans = {}, invoices = {}, progress = {}, today = dateKey(new Date()) }) {
  const alerts = [];
  const deadline = (id, title, date, context, centerId, projectId) => {
    if (!date) return;
    const days = Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000);
    if (!Number.isFinite(days) || days >= 0) return;
    alerts.push({ id, category: "Delay", title, centerId, projectId, date, severity: "Overdue", detail: `${context} · ${Math.abs(days)} days behind schedule` });
  };
  projects.filter((project) => !["COMPLETED", "CANCELLED", "CLOSED"].includes(project.status)).forEach((project) => deadline(`project-${project.id}`, "Project completion delayed", project.endDate, project.name, undefined, project.id));
  batches.filter((batch) => !["COMPLETED", "CANCELLED", "CLOSED"].includes(batch.status)).forEach((batch) => deadline(`batch-${batch.id}`, "Batch completion delayed", batch.endDate, batch.code, batch.centerId, batch.projectId));
  records.forEach((record) => {
    if (record.kind === "audits" && record.status !== "Closed") deadline(`audit-${record.id}`, record.title, record.dueDate, "QC corrective action", record.centerId, record.projectId);
    if (record.kind === "visits" && record.status === "Scheduled") deadline(`visit-${record.id}`, record.title, record.date, "Client visit", record.centerId, record.projectId);
  });
  for (const project of projects) {
    if (["COMPLETED", "CANCELLED", "CLOSED"].includes(project.status?.toUpperCase())) continue;
    const plan = plans[project.id];
    if (!plan) continue;
    for (const tranche of plan.tranches || []) {
      const flag = invoiceDeadlineFlag(tranche, invoices[`${project.id}:${tranche.id}`], today, Number(plan.warningDays || 7));
      if (flag) alerts.push({ id: `tranche-${project.id}-${tranche.id}`, projectId: project.id, category: "Invoice", title: `${project.name} · ${tranche.label}`, ...flag, detail: `${flag.detail} Required handoff: ${flag.stage === "Project Lead invoice" ? "Project Lead → Vertical Head" : "Vertical Head → Finance"}.` });
    }
    for (const milestone of projectMilestones(plan)) {
      const phase = milestone.phase;
      const actual = progress[project.id]?.[phase];
      if (!milestone?.dueOn || Number(milestone.target) <= 0 || !Number.isFinite(actual)) continue;
      const days = Math.round((Date.parse(`${milestone.dueOn}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000);
      if (days < 0 && actual < Number(milestone.target)) alerts.push({ id: `delivery-${project.id}-${milestone.id}`, projectId: project.id, category: "Delivery", title: `${project.name}${milestone.trancheLabel ? ` · ${milestone.trancheLabel}` : ""}: ${phase} behind schedule`, date: milestone.dueOn, severity: "Warning", detail: `${actual} of ${milestone.target} learners achieved by the ${phase} stage; ${milestone.target - actual} below target, ${Math.abs(days)} days after its scheduled deadline.` });
    }
  }
  const week = previousAttendanceWeek(today);
  const cutoff = new Date(`${today}T00:00:00Z`); cutoff.setUTCDate(cutoff.getUTCDate() - 29);
  employees.filter((employee) => !["EXITED", "INACTIVE"].includes(employee.status)).forEach((employee) => {
    const name = `${employee.firstName} ${employee.lastName}`;
    const recent = attendance.filter((row) => row.subjectType === "EMPLOYEE" && row.subjectId === employee.id && row.date >= week.start && row.date <= week.end && ["PRESENT", "ABSENT", "LATE"].includes(row.status));
    const days = [...new Map(recent.map((row) => [row.date, row])).values()];
    const rate = days.length ? days.filter((row) => row.status !== "ABSENT").length / days.length * 100 : null;
    if (days.length && rate < 70) alerts.push({ id: `attendance-${employee.id}`, category: "Performance", title: `${name}: low attendance`, centerId: employee.centerIds?.[0], severity: "Warning", detail: `${rate.toFixed(1)}% attendance across ${days.length} recorded working days for ${week.start} to ${week.end}; below the weekly 70% threshold. Review attendance and support needs.` });
    const review = employee.performanceReview;
    if (review && review.date >= cutoff.toISOString().slice(0, 10) && review.date <= today && typeof review.score === "number" && review.score >= 0 && review.score < 60) alerts.push({ id: `performance-${employee.id}`, category: "Performance", title: `${name}: below performance threshold`, centerId: employee.centerIds?.[0], severity: "Needs attention", detail: `Recorded review score ${review.score}/100 on ${review.date}; below the 60% threshold. ${review.notes || "Arrange a performance follow-up."}` });
  });
  return alerts.sort((a, b) => (a.date || today).localeCompare(b.date || today));
}
