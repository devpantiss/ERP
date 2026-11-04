export const monthLabel = (month) => new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });
export const validMonth = (month) => /^\d{4}-(0[1-9]|1[0-2])$/.test(month || "");
export function shiftMonth(month, offset) {
  const date = new Date(`${month}-01T00:00:00Z`); date.setUTCMonth(date.getUTCMonth() + offset); return date.toISOString().slice(0, 7);
}
export const recentMonths = (month, count = 12) => Array.from({ length: count }, (_, index) => shiftMonth(month, -index));
const rows = (db, name) => Object.values(db[name]?.byId || {});
const isComplete = (status) => ["COMPLETED", "CLOSED", "PAID"].includes(status?.toUpperCase());
const day = (value) => typeof value === "string" ? value.slice(0, 10) : "";
const inMonth = (value, month) => day(value).slice(0, 7) === month;

export function employeeWorkEvents(db, employee, projectIds, { invoices = {}, operations = [] } = {}) {
  const allowed = new Set(projectIds);
  const events = [];
  const add = (record, values) => { if (allowed.has(record.projectId) && values.date) events.push({ id: record.id, projectId: record.projectId, centerId: record.centerId, ...values }); };
  const batches = rows(db, "batches");
  for (const record of rows(db, "enrollments")) {
    if (db.candidates?.byId[record.candidateId]?.mobilizerEmployeeId !== employee.id) continue;
    add(record, { type: "enrollment", date: record.enrolledOn, title: `Enrolled ${[db.candidates.byId[record.candidateId]?.firstName, db.candidates.byId[record.candidateId]?.lastName].filter(Boolean).join(" ")}`, status: record.status, complete: !["REJECTED", "CANCELLED"].includes(record.status) });
  }
  for (const record of rows(db, "tourRequests")) {
    if (record.employeeId !== employee.id) continue;
    add(record, { type: /mobilization|community|camp|engagement/i.test(record.purpose || "") ? "community" : "tour", date: record.fromDate, title: record.purpose || "Field visit", status: record.status, complete: isComplete(record.status) });
  }
  for (const record of rows(db, "exposureVisits")) {
    const trainerId = record.trainerEmployeeId || batches.find((batch) => batch.id === record.batchId)?.trainerEmployeeId;
    if (trainerId !== employee.id) continue;
    add(record, { type: "exposure", date: record.visitDate, title: `Exposure visit · ${db.companies?.byId[record.companyId]?.name || record.id}`, status: record.status, complete: isComplete(record.status) });
  }
  for (const record of rows(db, "trainingSessions")) {
    if ((record.trainerEmployeeId || record.employeeId) !== employee.id) continue;
    add(record, { type: "training", date: record.date || record.sessionDate, title: record.title || "Training session", status: record.status, complete: isComplete(record.status), hours: record.hours !== null && record.hours !== undefined && Number.isFinite(Number(record.hours)) ? Number(record.hours) : null });
  }
  for (const record of rows(db, "placementDrives")) {
    if (record.placementOfficerEmployeeId !== employee.id) continue;
    add(record, { type: "placement", date: record.completedOn || record.scheduledOn, title: `Placement drive · ${db.companies?.byId[record.companyId]?.name || record.id}`, status: record.status, complete: isComplete(record.status), placedIds: isComplete(record.status) ? (record.candidateIds || []).filter((id) => db.candidates?.byId[id]?.status === "PLACED") : [] });
  }
  if ((employee.roleIds || []).some((id) => db.roles?.byId[id]?.code === "CENTER_INCHARGE")) {
    for (const batch of batches) {
      if (!employee.centerIds?.includes(batch.centerId) || !["COMPLETED", "CLOSED"].includes(batch.status?.toUpperCase())) continue;
      add(batch, { type: "batch", date: batch.completedOn || batch.endDate, title: `Batch completed · ${batch.code || batch.id}`, status: batch.status, complete: true });
    }
  }
  const actorIds = new Set(rows(db, "users").filter((user) => user.employeeId === employee.id).map((user) => user.id));
  for (const record of Object.values(invoices)) {
    if (actorIds.has(record.leadRaisedBy)) add({ ...record, id: `lead-${record.projectId}-${record.trancheId}` }, { type: "invoice", date: record.leadRaisedAt, title: `Tranche invoice raised · ${record.leadReference}`, status: "RAISED_TO_VERTICAL_HEAD", complete: true });
    if (actorIds.has(record.financeSubmittedBy)) add({ ...record, id: `finance-${record.projectId}-${record.trancheId}` }, { type: "invoice", date: record.financeSubmittedAt, title: `Finance handoff · ${record.financeReference}`, status: "SUBMITTED_TO_FINANCE", complete: true });
  }
  for (const record of operations) {
    if (record.employeeId !== employee.id) continue;
    const type = record.kind === "reports" ? "report" : record.kind === "audits" ? "audit" : "visit";
    add(record, { type, date: record.date || record.createdAt || record.updatedAt, title: record.title || "Operational record", status: record.status, complete: isComplete(record.status) || (type === "report" && record.status === "Submitted") });
  }
  return events.sort((left, right) => day(right.date).localeCompare(day(left.date)));
}

export function employeeDataMonths(db, employee, projectIds, options = {}) {
  const events = employeeWorkEvents(db, employee, projectIds, options);
  const dates = [
    ...events.map((event) => event.date),
    ...rows(db, "attendance").filter((record) => (employee.roleIds || []).some((id) => db.roles?.byId[id]?.code === "CENTER_INCHARGE") && record.subjectType === "CANDIDATE" && employee.centerIds?.includes(record.centerId) && projectIds.includes(record.projectId)).map((record) => record.date),
    ...rows(db, "attendance").filter((record) => record.subjectType === "EMPLOYEE" && record.subjectId === employee.id && projectIds.includes(record.projectId)).map((record) => record.date),
    ...rows(db, "leaveRequests").filter((record) => record.employeeId === employee.id).flatMap((record) => [record.fromDate, record.toDate]),
    ...rows(db, "salaries").filter((record) => record.employeeId === employee.id && projectIds.includes(record.projectId)).map((record) => record.month),
    ...rows(db, "reimbursements").filter((record) => record.employeeId === employee.id && projectIds.includes(record.projectId)).map((record) => record.submittedOn || record.createdAt),
    ...(options.targets || []).filter((record) => record.empId === employee.id && (record.projectId ? projectIds.includes(record.projectId) : employee.projectIds?.length === 1)).map((record) => record.month),
    ...(employee.performanceReviews || []).map((record) => record.date), employee.performanceReview?.date,
  ];
  return [...new Set(dates.filter(Boolean).map((date) => date.slice(0, 7)).filter(validMonth))].sort().reverse();
}

export function buildEmployeeMonthReport(db, employee, month, projectIds, options = {}) {
  if (!validMonth(month)) throw new Error("Choose a valid report month.");
  const today = options.today || new Date().toISOString().slice(0, 10);
  const monthStart = `${month}-01`;
  const monthEnd = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0)).toISOString().slice(0, 10);
  const attendanceByDate = new Map(rows(db, "attendance").filter((record) => record.subjectType === "EMPLOYEE" && record.subjectId === employee.id && projectIds.includes(record.projectId) && record.date <= today).map((record) => [record.date, record]));
  const attendance = [...attendanceByDate.values()].filter((record) => inMonth(record.date, month)).sort((a, b) => a.date.localeCompare(b.date));
  const working = attendance.filter((record) => ["PRESENT", "LATE", "ABSENT"].includes(record.status));
  const attended = working.filter((record) => record.status !== "ABSENT").length;
  const attendanceRate = working.length ? attended / working.length * 100 : null;
  const events = employeeWorkEvents(db, employee, projectIds, options).filter((event) => inMonth(event.date, month));
  const metricsFor = (work, centerId, metricProjectId) => {
    const completed = (type) => work.filter((event) => event.type === type && event.complete).length;
    const training = work.filter((event) => event.type === "training" && event.complete && event.hours !== null);
    const centerIds = (employee.centerIds || []).filter((id) => !centerId || id === centerId);
    const centerAttendance = [...new Map(rows(db, "attendance").filter((record) => record.subjectType === "CANDIDATE" && projectIds.includes(record.projectId) && (!metricProjectId || record.projectId === metricProjectId) && centerIds.includes(record.centerId) && inMonth(record.date, month) && ["PRESENT", "LATE", "ABSENT"].includes(record.status)).map((record) => [`${record.subjectId}:${record.date}`, record])).values()];
    const completedBatches = rows(db, "batches").filter((batch) => projectIds.includes(batch.projectId) && (!metricProjectId || batch.projectId === metricProjectId) && centerIds.includes(batch.centerId) && ["COMPLETED", "CLOSED"].includes(batch.status?.toUpperCase()) && inMonth(batch.completedOn || batch.endDate, month)).length;
    return {
      "Center Attendance (%)": centerAttendance.length ? centerAttendance.filter((record) => record.status !== "ABSENT").length / centerAttendance.length * 100 : null,
      "Completed Batches": completedBatches,
      "Enrolled": completed("enrollment"), "Community Drives": completed("community"),
      "Training Hours": training.length ? training.reduce((sum, event) => sum + event.hours, 0) : null,
      "Exposure Visits": completed("exposure"),
      "Placed Candidates": new Set(work.filter((event) => event.type === "placement").flatMap((event) => event.placedIds)).size,
      "Placement Drives Conducted": completed("placement"),
    };
  };
  const metrics = metricsFor(events);
  const monthTargets = (options.targets || []).filter((record) => record.empId === employee.id && record.month === month && (record.projectId ? projectIds.includes(record.projectId) : employee.projectIds?.length === 1));
  const targets = monthTargets.flatMap((target) => [1, 2].map((number) => {
    const scopeMetrics = target.projectId || target.centerId ? metricsFor(events.filter((event) => (!target.projectId || event.projectId === target.projectId) && (!target.centerId || event.centerId === target.centerId)), target.centerId, target.projectId) : metrics;
    const label = target[`t${number}Label`] || `Target ${number}`;
    const item = { label, projectId: target.projectId, target: Number(target[`t${number}`]), actual: scopeMetrics[label] ?? null };
    return { ...item, achievement: item.target > 0 && item.actual !== null ? item.actual / item.target * 100 : null };
  }));
  const measurableTargets = targets.filter((item) => item.achievement !== null);
  const targetRate = measurableTargets.length ? measurableTargets.reduce((sum, item) => sum + Math.min(item.achievement, 100), 0) / measurableTargets.length : null;
  const leaves = rows(db, "leaveRequests").filter((record) => record.employeeId === employee.id && record.fromDate <= monthEnd && (record.toDate || record.fromDate) >= monthStart);
  const leaveDays = new Set();
  for (const record of leaves.filter((row) => ["APPROVED", "ADMIN_APPROVED", "SUPER_ADMIN_APPROVED"].includes(row.status))) {
    const from = record.fromDate > monthStart ? record.fromDate : monthStart;
    const to = (record.toDate || record.fromDate) < monthEnd ? (record.toDate || record.fromDate) : monthEnd;
    for (let date = new Date(`${from}T00:00:00Z`); date.toISOString().slice(0, 10) <= to; date.setUTCDate(date.getUTCDate() + 1)) leaveDays.add(date.toISOString().slice(0, 10));
  }
  const salaries = rows(db, "salaries").filter((record) => record.employeeId === employee.id && record.month === month && projectIds.includes(record.projectId));
  const reimbursements = rows(db, "reimbursements").filter((record) => record.employeeId === employee.id && projectIds.includes(record.projectId) && inMonth(record.submittedOn || record.createdAt, month));
  const reviews = [...(employee.performanceReviews || []), ...(employee.performanceReview ? [employee.performanceReview] : [])].filter((record) => inMonth(record.date, month));
  const hasCenterAttendance = (employee.roleIds || []).some((id) => db.roles?.byId[id]?.code === "CENTER_INCHARGE") && metrics["Center Attendance (%)"] !== null;
  const noData = !hasCenterAttendance && !attendance.length && !events.length && !leaves.length && !salaries.length && !reimbursements.length && !monthTargets.length && !reviews.length;
  const pastMonth = month < (options.today || new Date().toISOString().slice(0, 10)).slice(0, 7);
  const weeks = [];
  const firstWeek = new Date(`${monthStart}T00:00:00Z`);
  firstWeek.setUTCDate(firstWeek.getUTCDate() - (firstWeek.getUTCDay() + 6) % 7);
  for (let start = new Date(firstWeek); start.toISOString().slice(0, 10) <= monthEnd; start.setUTCDate(start.getUTCDate() + 7)) {
    const end = new Date(start); end.setUTCDate(end.getUTCDate() + 6);
    const from = start.toISOString().slice(0, 10), to = end.toISOString().slice(0, 10);
    const workingDays = [...attendanceByDate.values()].filter((record) => record.date >= from && record.date <= to && ["PRESENT", "LATE", "ABSENT"].includes(record.status));
    const rate = workingDays.length ? workingDays.filter((record) => record.status !== "ABSENT").length / workingDays.length * 100 : null;
    weeks.push({ start: from, end: to, days: workingDays.length, rate, warning: to < today && rate !== null && rate < 70 && workingDays.some((record) => inMonth(record.date, month)), complete: to < today });
  }
  const warnings = [];
  const lowWeeks = weeks.filter((week) => week.warning).length;
  if (lowWeeks) warnings.push(`${lowWeeks} completed ${lowWeeks === 1 ? "week has" : "weeks have"} attendance below 70% of recorded working days.`);
  if (pastMonth && measurableTargets.some((item) => item.achievement < 100)) warnings.push("One or more measurable monthly targets were not achieved.");
  if (reviews.some((review) => typeof review.score === "number" && review.score < 60)) warnings.push("A recorded performance review is below 60/100.");
  return { month, attendance, weeks, recordedDays: working.length, present: attended, absent: working.length - attended, late: working.filter((row) => row.status === "LATE").length, attendanceRate, events, metrics, targets, targetRate, completedWork: events.filter((event) => event.complete).length, leaves, leaveDays: leaveDays.size, salaries, reimbursements, reviews, warnings, noData, status: noData ? "No records" : warnings.length ? "Needs attention" : pastMonth ? "Recorded" : "In progress" };
}
